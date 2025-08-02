import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Code2, Eye, Download, Sparkles, Loader2 } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { aiService, type CodeChunk } from '@/services/ai.service'

export default function BuilderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams<{ projectId: string }>()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [showCode, setShowCode] = useState(false)
  const [files, setFiles] = useState<Map<string, { content: string; language: string }>>(new Map())
  const [currentFile, setCurrentFile] = useState<string>('')
  const [previewHtml, setPreviewHtml] = useState('')
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
    if (!prompt.trim() || isGenerating || !projectId) return

    const userMessage = prompt.trim()
    setPrompt('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)

    try {
      const generator = aiService.generateCode({
        projectId,
        prompt: userMessage
      })

      let assistantMessage = ''
      const newFiles = new Map<string, { content: string; language: string }>()

      for await (const chunk of generator) {
        switch (chunk.type) {
          case 'message':
            if (chunk.message) {
              assistantMessage += chunk.message + '\n'
            }
            break
            
          case 'file':
            if (chunk.path && chunk.content) {
              newFiles.set(chunk.path, {
                content: chunk.content,
                language: chunk.language || 'plaintext'
              })
              
              // Update preview if it's the main file
              if (chunk.path === 'src/App.tsx' || chunk.path === 'src/App.jsx') {
                updatePreview(chunk.content)
              }
              
              // Set first file as current
              if (newFiles.size === 1) {
                setCurrentFile(chunk.path)
              }
            }
            break
            
          case 'error':
            toast.error(chunk.message || 'Generation failed')
            setIsGenerating(false)
            return
            
          case 'complete':
            toast.success('App generated successfully!')
            break
        }
      }

      setFiles(newFiles)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage || `Generated ${newFiles.size} files for your application.`
      }])
      setIsGenerating(false)
      
    } catch (error) {
      console.error('Error generating app:', error)
      toast.error('Failed to generate app. Please try again.')
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }])
      setIsGenerating(false)
    }
  }

  const updatePreview = (code: string) => {
    // Extract the JSX and create a preview
    const jsxMatch = code.match(/return\s*\(([\s\S]*?)\);?$/m)
    if (jsxMatch) {
      const jsx = jsxMatch[1]
      // Simple preview - in production, this would use a proper bundler
      setPreviewHtml(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="root">${jsx}</div>
          </body>
        </html>
      `)
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
        <div className="flex-1 flex">
          {/* File list (when in code view) */}
          {showCode && files.size > 0 && (
            <div className="w-48 border-r border-border bg-muted/30 p-2 overflow-y-auto">
              <div className="text-xs font-medium text-muted-foreground mb-2">FILES</div>
              {Array.from(files.keys()).map(path => (
                <button
                  key={path}
                  onClick={() => setCurrentFile(path)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm rounded hover:bg-accent transition-colors truncate",
                    currentFile === path && "bg-accent"
                  )}
                >
                  {path.split('/').pop()}
                </button>
              ))}
            </div>
          )}
          
          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            {showCode ? (
              <div className="h-full bg-[#1e1e1e] text-white p-4 overflow-auto">
                {currentFile && files.get(currentFile) ? (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">// {currentFile}</div>
                    <pre className="text-sm">
                      <code>{files.get(currentFile)?.content || ''}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center mt-10">
                    {files.size === 0 ? '// Your generated code will appear here...' : 'Select a file to view'}
                  </div>
                )}
              </div>
            ) : (
              <iframe
                className="w-full h-full bg-white"
                title="App Preview"
                srcDoc={previewHtml || `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body>
                      <div class="min-h-screen flex items-center justify-center text-gray-400">
                        <p>Start building to see your app here...</p>
                      </div>
                    </body>
                  </html>
                `}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}