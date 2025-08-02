import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { generateApp } from '../services/ai'

const router = Router()
const prisma = new PrismaClient()

const generateSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(1)
})

// Generate app from prompt
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { projectId, prompt } = generateSchema.parse(req.body)
    
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId
      }
    })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Save user message
    await prisma.message.create({
      data: {
        projectId,
        role: 'user',
        content: prompt
      }
    })
    
    // Generate app code
    const generatedCode = await generateApp(prompt, project.framework)
    
    // Save assistant message
    await prisma.message.create({
      data: {
        projectId,
        role: 'assistant',
        content: `Generated ${project.framework} app based on your description.`
      }
    })
    
    // Update project with generated code
    await prisma.project.update({
      where: { id: projectId },
      data: {
        code: generatedCode.code,
        html: generatedCode.html,
        css: generatedCode.css,
        javascript: generatedCode.javascript
      }
    })
    
    res.json({
      success: true,
      code: generatedCode
    })
  } catch (error) {
    console.error('Generate error:', error)
    res.status(500).json({ error: 'Failed to generate app' })
  }
})

// Get chat history
router.get('/messages/:projectId', authenticate, async (req, res) => {
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

export default router