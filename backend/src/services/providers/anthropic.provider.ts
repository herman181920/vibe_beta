import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, CodeChunk, GenerationContext, Fix } from './base.provider';
import { getPromptTemplate } from '../prompts/templates';

export class AnthropicProvider extends BaseAIProvider {
  name = 'Anthropic';
  private client: Anthropic;
  
  constructor(apiKey?: string) {
    super();
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });
  }
  
  async *generateCode(prompt: string, context: GenerationContext): AsyncGenerator<CodeChunk> {
    try {
      const systemPrompt = getPromptTemplate(context.framework, 'system');
      const enhancedPrompt = this.enhancePrompt(prompt, context);
      
      const stream = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        messages: [
          ...this.buildContextMessages(context),
          { role: 'user', content: enhancedPrompt }
        ],
        system: systemPrompt,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true
      });
      
      let buffer = '';
      let currentFile: { path?: string; content: string } = { content: '' };
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const content = chunk.delta.text;
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
        message: `Anthropic Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  async explainCode(code: string, language: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        system: 'You are a helpful coding assistant. Explain code clearly and concisely.',
        max_tokens: 500,
        temperature: 0.5
      });
      
      if (response.content[0].type === 'text') {
        return response.content[0].text;
      }
      
      return 'Could not generate explanation.';
    } catch (error) {
      throw new Error(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async suggestFix(error: string, code: string): Promise<Fix> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: `Fix this error:\n\nError: ${error}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide the fixed code and explain what was wrong.`
          }
        ],
        system: 'You are a helpful coding assistant. Provide fixes for code errors with clear explanations.',
        max_tokens: 1000,
        temperature: 0.3
      });
      
      if (response.content[0].type === 'text') {
        return this.parseFix(response.content[0].text, code);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw new Error(`Failed to suggest fix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      // Simple test to check if API key is valid
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      return true;
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