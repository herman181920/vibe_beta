export interface AIProvider {
  name: string;
  generateCode(prompt: string, context: GenerationContext): AsyncGenerator<CodeChunk>;
  explainCode(code: string, language: string): Promise<string>;
  suggestFix(error: string, code: string): Promise<Fix>;
  validatePrompt(prompt: string): PromptValidation;
  isAvailable(): Promise<boolean>;
}

export interface GenerationContext {
  framework: 'react' | 'vue' | 'vanilla';
  projectName: string;
  dependencies: string[];
  existingFiles?: FileInfo[];
  previousMessages?: Message[];
  designSystem?: DesignTokens;
}

export interface CodeChunk {
  type: 'file' | 'message' | 'error' | 'complete';
  content?: string;
  path?: string;
  language?: string;
  message?: string;
}

export interface FileInfo {
  path: string;
  content: string;
  language: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface DesignTokens {
  primary: string;
  secondary: string;
  fontFamily: string;
  spacing: string;
}

export interface Fix {
  explanation: string;
  code: string;
  changes: Change[];
}

export interface Change {
  file: string;
  line: number;
  original: string;
  replacement: string;
}

export interface PromptValidation {
  isValid: boolean;
  issues?: string[];
  estimatedTokens?: number;
  suggestions?: string[];
}

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  
  abstract generateCode(prompt: string, context: GenerationContext): AsyncGenerator<CodeChunk>;
  
  abstract explainCode(code: string, language: string): Promise<string>;
  
  abstract suggestFix(error: string, code: string): Promise<Fix>;
  
  validatePrompt(prompt: string): PromptValidation {
    const issues: string[] = [];
    
    if (prompt.length < 10) {
      issues.push('Prompt is too short. Please provide more details.');
    }
    
    if (prompt.length > 2000) {
      issues.push('Prompt is too long. Please be more concise.');
    }
    
    const estimatedTokens = Math.ceil(prompt.length / 4);
    
    return {
      isValid: issues.length === 0,
      issues,
      estimatedTokens,
      suggestions: this.generateSuggestions(prompt)
    };
  }
  
  abstract isAvailable(): Promise<boolean>;
  
  protected generateSuggestions(prompt: string): string[] {
    const suggestions: string[] = [];
    
    if (!prompt.toLowerCase().includes('react') && 
        !prompt.toLowerCase().includes('vue') && 
        !prompt.toLowerCase().includes('javascript')) {
      suggestions.push('Consider specifying the framework (React, Vue, or Vanilla JS)');
    }
    
    if (!prompt.toLowerCase().includes('style') && 
        !prompt.toLowerCase().includes('design')) {
      suggestions.push('You might want to specify styling preferences');
    }
    
    return suggestions;
  }
  
  protected parseCodeBlocks(text: string): Map<string, string> {
    const files = new Map<string, string>();
    const fileRegex = /```(?:typescript|javascript|tsx|jsx|vue|html|css)\n\/\/ File: (.+)\n([\s\S]*?)```/g;
    
    let match;
    while ((match = fileRegex.exec(text)) !== null) {
      files.set(match[1], match[2].trim());
    }
    
    return files;
  }
}