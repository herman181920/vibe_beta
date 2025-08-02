import { Ollama } from 'ollama';
import { BaseAIProvider, CodeChunk, GenerationContext, Fix } from './base.provider';
import { getPromptTemplate } from '../prompts/templates';

export class OllamaProvider extends BaseAIProvider {
  name = 'Ollama';
  private client: Ollama;
  private model: string;
  
  constructor(model: string = 'codellama', host?: string) {
    super();
    this.model = model;
    this.client = new Ollama({
      host: host || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    });
  }
  
  async *generateCode(prompt: string, context: GenerationContext): AsyncGenerator<CodeChunk> {
    try {
      const systemPrompt = getPromptTemplate(context.framework, 'system');
      const enhancedPrompt = this.enhancePrompt(prompt, context);
      
      const fullPrompt = `${systemPrompt}\n\n${enhancedPrompt}`;
      
      const response = await this.client.generate({
        model: this.model,
        prompt: fullPrompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 4000
        }
      });
      
      let buffer = '';
      let currentFile: { path?: string; content: string } = { content: '' };
      
      for await (const chunk of response) {
        const content = chunk.response;
        buffer += content;
        
        // Check for file markers
        const fileMatch = buffer.match(/\/\/ File: (.+)\n/);
        if (fileMatch) {
          // Save previous file if exists
          if (currentFile.path) {
            yield {
              type: 'file',
              path: currentFile.path,
              content: currentFile.content.trim(),
              language: this.getLanguageFromPath(currentFile.path)
            };
          }
          
          // Start new file
          currentFile = {
            path: fileMatch[1],
            content: ''
          };
          
          buffer = buffer.substring(fileMatch.index! + fileMatch[0].length);
        }
        
        // Accumulate content
        if (currentFile.path) {
          currentFile.content += buffer;
          buffer = '';
        }
        
        // Yield progress messages
        if (content.includes('Creating') || content.includes('Generating')) {
          yield {
            type: 'message',
            message: content
          };
        }
        
        // Check if done
        if (chunk.done) {
          break;
        }
      }
      
      // Save final file
      if (currentFile.path) {
        yield {
          type: 'file',
          path: currentFile.path,
          content: currentFile.content.trim(),
          language: this.getLanguageFromPath(currentFile.path)
        };
      }
      
      yield { type: 'complete', message: 'Code generation complete!' };
      
    } catch (error) {
      yield {
        type: 'error',
        message: `Ollama Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  async explainCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Explain this ${language} code clearly and concisely:\n\n\`\`\`${language}\n${code}\n\`\`\``;
      
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0.5,
          num_predict: 500
        }
      });
      
      return response.response || 'Could not generate explanation.';
    } catch (error) {
      throw new Error(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async suggestFix(error: string, code: string): Promise<Fix> {
    try {
      const prompt = `Fix this error and explain what was wrong:\n\nError: ${error}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide the fixed code in a code block.`;
      
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0.3,
          num_predict: 1000
        }
      });
      
      return this.parseFix(response.response, code);
    } catch (error) {
      throw new Error(`Failed to suggest fix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const models = await this.client.list();
      return models.models.some(m => m.name === this.model);
    } catch {
      return false;
    }
  }
  
  private enhancePrompt(prompt: string, context: GenerationContext): string {
    const template = getPromptTemplate(context.framework, 'app');
    
    return template
      .replace('{userDescription}', prompt)
      .replace('{projectName}', context.projectName)
      .replace('{dependencies}', context.dependencies.join(', '))
      .replace('{existingFiles}', context.existingFiles?.map(f => f.path).join(', ') || 'None');
  }
  
  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'vue': 'vue',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json'
    };
    
    return languageMap[ext || ''] || 'plaintext';
  }
  
  private parseFix(response: string, originalCode: string): Fix {
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    const fixedCode = codeMatch ? codeMatch[1].trim() : originalCode;
    
    const explanation = response.split('```')[0].trim();
    
    return {
      explanation,
      code: fixedCode,
      changes: [] // Would implement diff algorithm here
    };
  }
}