# Vibe Beta Technical Architecture

## Overview

Vibe Beta is an AI-powered web application builder that enables users to create fully functional web applications through natural language conversations. This document provides a comprehensive technical overview of the system architecture, key components, and implementation protocols.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Chat UI   │  │Code Editor   │  │   Live Preview         │ │
│  │             │  │(Monaco)      │  │   (Sandboxed)          │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     WebSocket Connection                          │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express + TS)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   API       │  │  AI Service  │  │   Code Processor       │ │
│  │   Routes    │  │  Manager     │  │   & Validator          │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Auth      │  │  Project     │  │   File System          │ │
│  │   Service   │  │  Manager     │  │   Emulator             │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  PostgreSQL │  │    Redis     │  │      S3/CDN            │ │
│  │  (Prisma)   │  │   (Cache)    │  │   (File Storage)       │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      AI Providers                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   OpenAI    │  │  Anthropic   │  │    Ollama              │ │
│  │   GPT-4     │  │   Claude     │  │   (Local)              │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Application

#### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS Variables
- **State Management**: React Context + Zustand (to be added)
- **Real-time**: Socket.IO Client
- **Code Editor**: Monaco Editor
- **HTTP Client**: Axios
- **Routing**: React Router v6

#### Key Features
- Real-time chat interface with AI
- Multi-file code editor with syntax highlighting
- Live preview with hot module replacement
- Project management dashboard
- Responsive design with dark/light themes

### 2. Backend Services

#### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (to be added)
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
- **Validation**: Zod

#### Core Services
1. **AI Service Manager**
   - Handles multiple AI provider integrations
   - Manages prompt templates and context
   - Implements retry logic and fallbacks
   - Streams responses via WebSocket

2. **Code Generation Pipeline**
   - Parses AI responses into structured code
   - Validates generated code syntax
   - Manages file structure creation
   - Handles dependency resolution

3. **Project Manager**
   - CRUD operations for projects
   - Version control for project files
   - Collaboration and sharing logic
   - Export/import functionality

4. **Preview Engine**
   - In-browser code compilation
   - Sandboxed execution environment
   - Asset handling and optimization
   - Error boundary management

### 3. Database Schema

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  password        String
  plan            String    @default("free")
  apiUsage        Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  projects        Project[]
  sharedProjects  ProjectShare[]
}

model Project {
  id              String    @id @default(cuid())
  name            String
  description     String?
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  framework       String    @default("react")
  isPublic        Boolean   @default(false)
  deploymentUrl   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  files           File[]
  messages        Message[]
  shares          ProjectShare[]
  versions        ProjectVersion[]
}

model File {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id])
  path            String
  content         String    @db.Text
  language        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([projectId, path])
}

model Message {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id])
  role            String    // "user" or "assistant"
  content         String    @db.Text
  metadata        Json?     // Store tokens used, model, etc.
  createdAt       DateTime  @default(now())
}

model ProjectShare {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id])
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  permission      String    @default("view") // "view" or "edit"
  shareToken      String    @unique
  createdAt       DateTime  @default(now())
  expiresAt       DateTime?
}

model ProjectVersion {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id])
  version         Int
  snapshot        Json      // Complete project state
  message         String?
  createdAt       DateTime  @default(now())
}
```

## AI Integration Protocol

### 1. Provider Abstraction Layer

```typescript
interface AIProvider {
  generateCode(prompt: string, context: ProjectContext): AsyncGenerator<CodeChunk>
  explainCode(code: string, language: string): Promise<string>
  suggestFix(error: Error, code: string): Promise<Fix>
  validatePrompt(prompt: string): PromptValidation
}

class AIServiceManager {
  private providers: Map<string, AIProvider>
  
  async generate(request: GenerateRequest): AsyncGenerator<GenerateResponse> {
    const provider = this.selectProvider(request)
    const enhancedPrompt = this.enhancePrompt(request)
    
    for await (const chunk of provider.generateCode(enhancedPrompt, request.context)) {
      yield this.processChunk(chunk)
    }
  }
}
```

### 2. Prompt Engineering System

```typescript
interface PromptTemplate {
  id: string
  framework: Framework
  category: string
  template: string
  variables: Variable[]
  examples: Example[]
}

const REACT_APP_TEMPLATE: PromptTemplate = {
  id: 'react-app-basic',
  framework: 'react',
  category: 'full-app',
  template: `
    Create a React application with the following requirements:
    {description}
    
    Technical specifications:
    - Use functional components with hooks
    - Implement proper TypeScript types
    - Use Tailwind CSS for styling
    - Follow React best practices
    - Include proper error boundaries
    
    File structure:
    - src/App.tsx (main component)
    - src/components/* (reusable components)
    - src/hooks/* (custom hooks)
    - src/types/* (TypeScript types)
    
    Return the complete code for all files.
  `,
  variables: ['description'],
  examples: [...]
}
```

### 3. Code Generation Pipeline

```typescript
class CodeGenerationPipeline {
  async process(aiResponse: string): Promise<GeneratedProject> {
    const parsed = this.parseResponse(aiResponse)
    const validated = await this.validateCode(parsed)
    const enhanced = this.enhanceCode(validated)
    const optimized = await this.optimizeBundle(enhanced)
    
    return {
      files: optimized.files,
      dependencies: optimized.dependencies,
      metadata: {
        framework: detected.framework,
        features: detected.features,
        complexity: calculated.complexity
      }
    }
  }
}
```

## Preview System Architecture

### 1. Sandboxed Execution

```typescript
class PreviewEngine {
  private sandbox: SandboxedIframe
  private bundler: InMemoryBundler
  private hmrServer: HMRServer
  
  async initialize(project: Project) {
    this.sandbox = new SandboxedIframe({
      permissions: ['scripts', 'forms'],
      csp: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      origin: 'null'
    })
    
    this.bundler = new InMemoryBundler({
      entries: project.files,
      resolver: new CDNResolver(),
      transformers: [new JSXTransformer(), new TypeScriptTransformer()]
    })
  }
  
  async update(files: File[]) {
    const bundle = await this.bundler.bundle(files)
    this.hmrServer.emit('update', bundle)
    this.sandbox.postMessage({ type: 'hot-update', bundle })
  }
}
```

### 2. Virtual File System

```typescript
class VirtualFileSystem {
  private files: Map<string, VirtualFile>
  private watchers: Map<string, Set<FileWatcher>>
  
  async writeFile(path: string, content: string) {
    const file = this.createVirtualFile(path, content)
    this.files.set(path, file)
    this.notifyWatchers(path, 'change')
    await this.persistToDB(path, content)
  }
  
  resolveImport(from: string, to: string): string {
    // Handle relative imports, node_modules, aliases
    return this.resolver.resolve(from, to)
  }
}
```

## Security Protocols

### 1. Authentication & Authorization

- JWT tokens with 7-day expiration
- Refresh token rotation
- Role-based access control (RBAC)
- API rate limiting per user/IP
- Session management with Redis

### 2. Code Execution Security

- Sandboxed iframes with restricted permissions
- Content Security Policy (CSP) headers
- Input sanitization for all user inputs
- Code validation before execution
- Resource usage limits (CPU, memory)

### 3. AI Safety

- Prompt injection prevention
- Content filtering for generated code
- Malicious code pattern detection
- Rate limiting on AI API calls
- Usage tracking and anomaly detection

## Performance Optimization

### 1. Frontend Optimization

- Code splitting by route
- Lazy loading of heavy components
- Image optimization with WebP
- Service Worker for offline support
- Efficient React rendering with memo/callback

### 2. Backend Optimization

- Database query optimization with indexes
- Redis caching for frequent queries
- CDN for static assets
- Horizontal scaling with load balancer
- WebSocket connection pooling

### 3. AI Response Optimization

- Response streaming for better UX
- Caching of common prompts
- Parallel processing of independent tasks
- Smart context windowing
- Fallback to simpler models for basic tasks

## Deployment Architecture

### Production Environment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: vibe-beta-frontend:latest
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      
  backend:
    image: vibe-beta-backend:latest
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 5
      
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
```

## Monitoring & Analytics

### 1. Application Monitoring

- Error tracking with Sentry
- Performance monitoring with DataDog
- Uptime monitoring with Pingdom
- Log aggregation with ELK stack

### 2. Business Metrics

- User engagement analytics
- Feature usage tracking
- AI token usage monitoring
- Conversion funnel analysis

## Development Workflow

### 1. Git Workflow

- Main branch: production-ready code
- Develop branch: integration branch
- Feature branches: feature/[feature-name]
- Hotfix branches: hotfix/[issue-number]

### 2. Code Review Process

- All PRs require 2 approvals
- Automated testing must pass
- Code coverage must not decrease
- Performance benchmarks must pass

### 3. Release Process

- Semantic versioning (MAJOR.MINOR.PATCH)
- Automated changelog generation
- Staged rollout with feature flags
- Rollback procedures documented

## API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

## Testing Strategy

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing protocols and guidelines.