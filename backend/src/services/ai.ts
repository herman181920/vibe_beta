import axios from 'axios'

interface GeneratedCode {
  code: string
  html: string
  css: string
  javascript: string
}

export async function generateApp(prompt: string, framework: string): Promise<GeneratedCode> {
  // TODO: Integrate with actual AI service (OpenAI, Anthropic, or Ollama)
  // For now, return a mock response
  
  const mockCode = `
import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Generated App
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">
            This app was generated based on: "${prompt}"
          </p>
        </div>
      </div>
    </div>
  )
}
  `.trim()
  
  const mockHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
  `.trim()
  
  const mockCss = `
/* Generated CSS */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
  `.trim()
  
  const mockJs = `
// Generated JavaScript
console.log('App initialized');
  `.trim()
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    code: mockCode,
    html: mockHtml,
    css: mockCss,
    javascript: mockJs
  }
}

// Example integration with Ollama (local LLM)
export async function generateWithOllama(prompt: string): Promise<string> {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'codellama',
      prompt: `Generate a React component for: ${prompt}. Return only the code, no explanation.`,
      stream: false
    })
    
    return response.data.response
  } catch (error) {
    console.error('Ollama generation error:', error)
    throw new Error('Failed to generate with Ollama')
  }
}