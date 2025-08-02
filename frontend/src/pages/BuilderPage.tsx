import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Code2, Eye, Download, Sparkles } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function BuilderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [showCode, setShowCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if we came from a template
    if (location.state?.template) {
      setPrompt(location.state.template.prompt)
    }
  }, [location])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return

    const userMessage = prompt.trim()
    setPrompt('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)

    try {
      // TODO: Connect to backend API
      // Simulating AI response for now
      setTimeout(() => {
        const mockResponse = "I'll create that for you! Here's what I'm building:\n\n1. Setting up the React components\n2. Adding the styling with Tailwind CSS\n3. Implementing the interactive features\n\nYour app is now ready in the preview!"
        setMessages(prev => [...prev, { role: 'assistant', content: mockResponse }])
        setGeneratedCode(`// Generated React Component
import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Your Generated App
      </h1>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <p>Your app content will appear here based on your description.</p>
      </div>
    </div>
  )
}`)
        setIsGenerating(false)
        toast.success('App generated successfully!')
      }, 2000)
    } catch (error) {
      console.error('Error generating app:', error)
      toast.error('Failed to generate app. Please try again.')
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">AI App Builder</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
              <p className="text-sm">Describe the app you want to build...</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "p-3 rounded-lg",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground ml-8" 
                    : "bg-muted mr-8"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </motion.div>
            ))
          )}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-muted p-3 rounded-lg mr-8"
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <TextareaAutosize
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your app..."
              className="flex-1 resize-none bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxRows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(false)}
              className={cn(
                "px-3 py-1.5 rounded-md transition-colors flex items-center gap-2",
                !showCode ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={cn(
                "px-3 py-1.5 rounded-md transition-colors flex items-center gap-2",
                showCode ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Code2 className="h-4 w-4" />
              Code
            </button>
          </div>
          <button
            className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
            onClick={() => {
              // TODO: Implement export functionality
              toast.success('Export feature coming soon!')
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showCode ? (
            <div className="h-full bg-[#1e1e1e] text-white p-4 overflow-auto">
              <pre className="text-sm">
                <code>{generatedCode || '// Your generated code will appear here...'}</code>
              </pre>
            </div>
          ) : (
            <iframe
              className="w-full h-full bg-white"
              title="App Preview"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                  </head>
                  <body>
                    <div id="root">
                      ${generatedCode ? '<div class="min-h-screen bg-gray-100 p-8"><h1 class="text-3xl font-bold text-center">Your app preview will appear here</h1></div>' : '<div class="min-h-screen flex items-center justify-center text-gray-400"><p>Start building to see your app here...</p></div>'}
                    </div>
                  </body>
                </html>
              `}
            />
          )}
        </div>
      </div>
    </div>
  )
}