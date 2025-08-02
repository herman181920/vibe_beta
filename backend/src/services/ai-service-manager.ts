import { AIProvider, GenerationContext, CodeChunk, PromptValidation } from './providers/base.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { PrismaClient } from '@prisma/client';
import { Server as SocketServer } from 'socket.io';

export interface GenerateRequest {
  projectId: string;
  prompt: string;
  userId: string;
  provider?: 'openai' | 'anthropic' | 'ollama';
}

export class AIServiceManager {
  private providers: Map<string, AIProvider> = new Map();
  private prisma: PrismaClient;
  private io: SocketServer;
  
  constructor(prisma: PrismaClient, io: SocketServer) {
    this.prisma = prisma;
    this.io = io;
    this.initializeProviders();
  }
  
  private initializeProviders() {
    // Initialize providers based on available API keys
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider());
    }
    
    // Ollama is always available for local development
    this.providers.set('ollama', new OllamaProvider());
  }
  
  async *generate(request: GenerateRequest): AsyncGenerator<CodeChunk> {
    // Get project details
    const project = await this.prisma.project.findFirst({
      where: { id: request.projectId, userId: request.userId },
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Select provider
    const provider = await this.selectProvider(request.provider);
    if (!provider) {
      throw new Error('No AI provider available');
    }
    
    // Validate prompt
    const validation = provider.validatePrompt(request.prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid prompt: ${validation.issues?.join(', ')}`);
    }
    
    // Build context
    const context: GenerationContext = {
      framework: project.framework as 'react' | 'vue' | 'vanilla',
      projectName: project.name,
      dependencies: this.extractDependencies(project),
      existingFiles: project.files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language
      })),
      previousMessages: project.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })).reverse()
    };
    
    // Save user message
    await this.prisma.message.create({
      data: {
        projectId: request.projectId,
        role: 'user',
        content: request.prompt
      }
    });
    
    // Emit to WebSocket
    this.io.to(`project:${request.projectId}`).emit('ai-generation-start', {
      projectId: request.projectId,
      prompt: request.prompt
    });
    
    // Generate code
    const generatedFiles: Array<{ path: string; content: string; language: string }> = [];
    let assistantMessage = '';
    
    try {
      for await (const chunk of provider.generateCode(request.prompt, context)) {
        // Emit chunk to WebSocket
        this.io.to(`project:${request.projectId}`).emit('ai-chunk', chunk);
        
        if (chunk.type === 'file' && chunk.path && chunk.content) {
          generatedFiles.push({
            path: chunk.path,
            content: chunk.content,
            language: chunk.language || 'plaintext'
          });
        }
        
        if (chunk.type === 'message' && chunk.message) {
          assistantMessage += chunk.message + '\n';
        }
        
        yield chunk;
      }
      
      // Save generated files
      for (const file of generatedFiles) {
        await this.prisma.file.upsert({
          where: {
            projectId_path: {
              projectId: request.projectId,
              path: file.path
            }
          },
          update: {
            content: file.content,
            language: file.language
          },
          create: {
            projectId: request.projectId,
            path: file.path,
            content: file.content,
            language: file.language
          }
        });
      }
      
      // Save assistant message
      await this.prisma.message.create({
        data: {
          projectId: request.projectId,
          role: 'assistant',
          content: assistantMessage || `Generated ${generatedFiles.length} files for your ${context.framework} application.`,
          metadata: JSON.stringify({
            provider: provider.name,
            filesGenerated: generatedFiles.length,
            tokens: validation.estimatedTokens
          })
        }
      });
      
      // Update project
      await this.prisma.project.update({
        where: { id: request.projectId },
        data: { updatedAt: new Date() }
      });
      
      // Emit completion
      this.io.to(`project:${request.projectId}`).emit('ai-generation-complete', {
        projectId: request.projectId,
        filesGenerated: generatedFiles.length
      });
      
    } catch (error) {
      // Save error message
      await this.prisma.message.create({
        data: {
          projectId: request.projectId,
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Generation failed'}`
        }
      });
      
      throw error;
    }
  }
  
  async explainCode(code: string, language: string, provider?: string): Promise<string> {
    const selectedProvider = await this.selectProvider(provider);
    if (!selectedProvider) {
      throw new Error('No AI provider available');
    }
    
    return selectedProvider.explainCode(code, language);
  }
  
  async suggestFix(error: string, code: string, provider?: string) {
    const selectedProvider = await this.selectProvider(provider);
    if (!selectedProvider) {
      throw new Error('No AI provider available');
    }
    
    return selectedProvider.suggestFix(error, code);
  }
  
  async validatePrompt(prompt: string): Promise<PromptValidation> {
    // Use first available provider for validation
    const provider = this.providers.values().next().value;
    if (!provider) {
      return {
        isValid: false,
        issues: ['No AI provider available']
      };
    }
    
    return provider.validatePrompt(prompt);
  }
  
  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];
    
    for (const [name, provider] of this.providers) {
      if (await provider.isAvailable()) {
        available.push(name);
      }
    }
    
    return available;
  }
  
  private async selectProvider(preferred?: string): Promise<AIProvider | null> {
    // If specific provider requested, try to use it
    if (preferred && this.providers.has(preferred)) {
      const provider = this.providers.get(preferred)!;
      if (await provider.isAvailable()) {
        return provider;
      }
    }
    
    // Otherwise, use priority order: OpenAI > Anthropic > Ollama
    const priorityOrder = ['openai', 'anthropic', 'ollama'];
    
    for (const name of priorityOrder) {
      const provider = this.providers.get(name);
      if (provider && await provider.isAvailable()) {
        return provider;
      }
    }
    
    return null;
  }
  
  private extractDependencies(project: any): string[] {
    // Extract from package.json if it exists
    const packageJson = project.files.find((f: any) => f.path === 'package.json');
    if (packageJson) {
      try {
        const parsed = JSON.parse(packageJson.content);
        return Object.keys(parsed.dependencies || {});
      } catch {
        // Ignore parse errors
      }
    }
    
    // Default dependencies based on framework
    const defaultDeps: Record<string, string[]> = {
      react: ['react', 'react-dom', 'react-router-dom', 'axios'],
      vue: ['vue', 'vue-router', 'pinia', 'axios'],
      vanilla: []
    };
    
    return defaultDeps[project.framework] || [];
  }
}