import OpenAI from 'openai';
import { BaseAIProvider, CodeChunk, GenerationContext, Fix } from './base.provider';
import { getPromptTemplate } from '../prompts/templates';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  private client: OpenAI;
  
  constructor(apiKey?: string) {
    super();
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }
  
  async *generateCode(prompt: string, context: GenerationContext): AsyncGenerator<CodeChunk> {
    try {
      const systemPrompt = getPromptTemplate(context.framework, 'system');
      const enhancedPrompt = this.enhancePrompt(prompt, context);
      
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.buildContextMessages(context),
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      });
      
      let buffer = '';
      let currentFile: { path?: string; content: string } = { content: '' };
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
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
        message: `OpenAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  async explainCode(code: string, language: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding assistant. Explain code clearly and concisely.'
          },
          {
            role: 'user',
            content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });
      
      return response.choices[0]?.message?.content || 'Could not generate explanation.';
    } catch (error) {
      throw new Error(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async suggestFix(error: string, code: string): Promise<Fix> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding assistant. Provide fixes for code errors with clear explanations.'
          },
          {
            role: 'user',
            content: `Fix this error:\n\nError: ${error}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide the fixed code and explain what was wrong.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      // Parse the response to extract fix details
      return this.parseFix(content, code);
    } catch (error) {
      throw new Error(`Failed to suggest fix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return response.data.length > 0;
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
  
  private buildContextMessages(context: GenerationContext): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    if (context.previousMessages) {
      messages.push(...context.previousMessages.slice(-5)); // Last 5 messages for context
    }
    
    return messages;
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
    // Simple parsing - in production, this would be more sophisticated
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