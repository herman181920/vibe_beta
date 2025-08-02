import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  framework: z.enum(['react', 'vue', 'vanilla']).default('react')
})

// Get all projects for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Create new project
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, framework } = createProjectSchema.parse(req.body)
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        framework,
        userId: req.user!.userId
      }
    })
    
    res.json(project)
  } catch (error) {
    console.error('Create project error:', error)
    res.status(400).json({ error: 'Failed to create project' })
  }
})

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      },
      include: {
        files: {
          orderBy: { path: 'asc' }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    res.json(project)
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// Update project metadata
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body
    
    const project = await prisma.project.update({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      },
      data: {
        name,
        description,
        isPublic,
        updatedAt: new Date()
      }
    })
    
    res.json(project)
  } catch (error) {
    console.error('Update project error:', error)
    res.status(400).json({ error: 'Failed to update project' })
  }
})

// Update project files
router.put('/:id/files', authenticate, async (req, res) => {
  try {
    const { files } = req.body as { files: Array<{ path: string; content: string; language: string }> }
    
    // Update files in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing files
      await tx.file.deleteMany({
        where: { projectId: req.params.id }
      })
      
      // Create new files
      await tx.file.createMany({
        data: files.map(file => ({
          projectId: req.params.id,
          path: file.path,
          content: file.content,
          language: file.language
        }))
      })
      
      // Update project timestamp
      await tx.project.update({
        where: { id: req.params.id },
        data: { updatedAt: new Date() }
      })
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Update files error:', error)
    res.status(400).json({ error: 'Failed to update files' })
  }
})

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.project.delete({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(400).json({ error: 'Failed to delete project' })
  }
})

export default router