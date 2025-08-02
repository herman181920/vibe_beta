import { API_URL } from './config';

export interface GenerateRequest {
  projectId: string;
  prompt: string;
  provider?: 'openai' | 'anthropic' | 'ollama';
}

export interface CodeChunk {
  type: 'file' | 'message' | 'error' | 'complete';
  content?: string;
  path?: string;
  language?: string;
  message?: string;
}

export class AIService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async *generateCode(request: GenerateRequest): AsyncGenerator<CodeChunk> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last line in buffer if it's incomplete
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const chunk: CodeChunk = JSON.parse(data);
              yield chunk;
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }
    }
  }

  async explainCode(code: string, language: string, provider?: string): Promise<string> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ code, language, provider })
    });

    if (!response.ok) {
      throw new Error(`Failed to explain code: ${response.statusText}`);
    }

    const data = await response.json();
    return data.explanation;
  }

  async suggestFix(error: string, code: string, provider?: string) {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/ai/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ error, code, provider })
    });

    if (!response.ok) {
      throw new Error(`Failed to suggest fix: ${response.statusText}`);
    }

    return response.json();
  }

  async validatePrompt(prompt: string) {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/ai/validate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate prompt: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableProviders(): Promise<string[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/ai/providers`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get providers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.providers;
  }
}

export const aiService = new AIService();