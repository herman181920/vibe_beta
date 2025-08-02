import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { AIServiceManager } from '../services/ai-service-manager'
import { Server as SocketServer } from 'socket.io'

const prisma = new PrismaClient()

const generateSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(1),
  provider: z.enum(['openai', 'anthropic', 'ollama']).optional()
})

const explainSchema = z.object({
  code: z.string(),
  language: z.string(),
  provider: z.enum(['openai', 'anthropic', 'ollama']).optional()
})

const fixSchema = z.object({
  error: z.string(),
  code: z.string(),
  provider: z.enum(['openai', 'anthropic', 'ollama']).optional()
})

export function createAIRouter(io: SocketServer) {
  const router = Router()
  const aiManager = new AIServiceManager(prisma, io)

  // Stream generation endpoint
  router.post('/generate', authenticate, async (req: Request, res: Response) => {
    try {
      const { projectId, prompt, provider } = generateSchema.parse(req.body)
      
      // Set up SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
      
      const generator = aiManager.generate({
        projectId,
        prompt,
        userId: req.user!.userId,
        provider
      })
      
      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
      
      res.write('data: {"type":"complete"}\n\n')
      res.end()
      
    } catch (error) {
      console.error('Generate error:', error)
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to generate app' 
      })}\n\n`)
      res.end()
    }
  })
  
  // Explain code endpoint
  router.post('/explain', authenticate, async (req: Request, res: Response) => {
    try {
      const { code, language, provider } = explainSchema.parse(req.body)
      
      const explanation = await aiManager.explainCode(code, language, provider)
      
      res.json({ explanation })
    } catch (error) {
      console.error('Explain error:', error)
      res.status(500).json({ error: 'Failed to explain code' })
    }
  })
  
  // Fix error endpoint
  router.post('/fix', authenticate, async (req: Request, res: Response) => {
    try {
      const { error, code, provider } = fixSchema.parse(req.body)
      
      const fix = await aiManager.suggestFix(error, code, provider)
      
      res.json(fix)
    } catch (error) {
      console.error('Fix error:', error)
      res.status(500).json({ error: 'Failed to suggest fix' })
    }
  })
  
  // Validate prompt endpoint
  router.post('/validate-prompt', authenticate, async (req: Request, res: Response) => {
    try {
      const { prompt } = z.object({ prompt: z.string() }).parse(req.body)
      
      const validation = await aiManager.validatePrompt(prompt)
      
      res.json(validation)
    } catch (error) {
      console.error('Validate error:', error)
      res.status(500).json({ error: 'Failed to validate prompt' })
    }
  })
  
  // Get available providers
  router.get('/providers', authenticate, async (req: Request, res: Response) => {
    try {
      const providers = await aiManager.getAvailableProviders()
      
      res.json({ providers })
    } catch (error) {
      console.error('Providers error:', error)
      res.status(500).json({ error: 'Failed to get providers' })
    }
  })

  // Get chat history
  router.get('/messages/:projectId', authenticate, async (req: Request, res: Response) => {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: req.params.projectId,
          userId: req.user!.userId
        }
      })
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }
      
      const messages = await prisma.message.findMany({
        where: { projectId: req.params.projectId },
        orderBy: { createdAt: 'asc' }
      })
      
      res.json(messages)
    } catch (error) {
      console.error('Get messages error:', error)
      res.status(500).json({ error: 'Failed to fetch messages' })
    }
  })
  
  return router
}

export default createAIRouter