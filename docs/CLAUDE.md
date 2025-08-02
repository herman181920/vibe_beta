# Claude Assistant Context for Vibe Beta

## Project Overview

Vibe Beta is an AI-powered web application builder that enables users to create fully functional web applications through natural language conversations. Think of it as "Lovable.dev" or "Bolt.new" - users describe what they want to build, and the AI generates complete, production-ready code.

## Current Project State

### Completed Features
- ✅ Basic project structure with frontend and backend
- ✅ Modern UI with vibe-assets styling (glass morphism design)
- ✅ Homepage with animated gradients and project templates  
- ✅ Builder page with chat interface and code preview
- ✅ TypeScript setup for both frontend and backend
- ✅ Database schema with Prisma ORM
- ✅ Authentication system with JWT
- ✅ WebSocket setup for real-time communication
- ✅ Comprehensive documentation suite

### In Progress
- 🔄 AI integration for code generation (OpenAI, Anthropic, Ollama)
- 🔄 Real-time preview system with sandboxed execution
- 🔄 Multi-file project support

### Upcoming
- 📋 Monaco editor integration
- 📋 Project persistence and management
- 📋 Export and deployment features
- 📋 Component library marketplace

## Key Technical Decisions

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (migrated from Create React App)
- **Styling**: Tailwind CSS + Custom CSS variables from vibe-assets
- **State**: React Context (Zustand planned)
- **Editor**: Monaco Editor (to be integrated)
- **Preview**: Sandboxed iframe with custom bundler

### Backend  
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod) with Prisma
- **Real-time**: Socket.IO
- **Auth**: JWT tokens with bcrypt
- **AI**: Multiple provider support (OpenAI, Anthropic, Ollama)

## AI Context and Behavior

When helping with this project, you should:

1. **Maintain Consistency**
   - Follow the established TypeScript patterns
   - Use the existing file structure
   - Apply vibe-assets styling patterns
   - Keep the glass morphism aesthetic

2. **Code Generation Focus**
   - Prioritize creating a robust AI code generation pipeline
   - Implement proper prompt engineering
   - Ensure generated code is production-ready
   - Support multiple frameworks (React, Vue, Vanilla)

3. **User Experience**
   - Real-time feedback during generation
   - Clear error messages
   - Smooth animations and transitions
   - Responsive design

4. **Technical Standards**
   - Write comprehensive TypeScript types
   - Include error handling
   - Add loading states
   - Implement proper security measures

## File Structure

```
vibe_beta/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API integrations
│   │   ├── lib/          # Utilities
│   │   └── styles/       # Global styles
│   └── index.html
├── backend/               # Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── types/        # TypeScript types
│   └── prisma/
│       └── schema.prisma # Database schema
└── docs/                  # Comprehensive documentation
```

## Current Tasks Priority

1. **High Priority**
   - Configure AI providers (OpenAI, Anthropic, Ollama)
   - Implement streaming AI responses
   - Build code generation pipeline
   - Create sandboxed preview environment

2. **Medium Priority**
   - Add Monaco editor with IntelliSense
   - Implement project persistence
   - Build project dashboard
   - Add export functionality

3. **Low Priority**
   - Component library integration
   - Backend generation capabilities
   - Advanced collaboration features

## Development Commands

```bash
# Frontend
cd frontend
npm install
npm run dev         # Start dev server on port 3000

# Backend  
cd backend
npm install
npx prisma migrate dev  # Setup database
npm run dev            # Start server on port 5000

# Root commands
npm run install:all    # Install all dependencies
npm run dev           # Run both frontend and backend
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `POST /api/ai/generate` - Generate code from prompt
- WebSocket events: `join-project`, `code-update`, `ai-stream`

## Environment Variables

```env
# Backend (.env)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
OLLAMA_BASE_URL="http://localhost:11434"

# Frontend (.env)
VITE_API_URL="http://localhost:5000"
```

## Common Issues & Solutions

1. **Port conflicts**: Backend uses 5000, frontend uses 3000
2. **CORS errors**: Check backend CORS configuration
3. **TypeScript errors**: Run `npm run typecheck`
4. **Database issues**: Run `npx prisma migrate reset`

## Design Patterns

1. **AI Response Streaming**
   ```typescript
   for await (const chunk of aiService.generate(prompt)) {
     socket.emit('ai-stream', chunk);
   }
   ```

2. **Error Handling**
   ```typescript
   try {
     const result = await generateCode(prompt);
     return { success: true, data: result };
   } catch (error) {
     logger.error('Generation failed:', error);
     return { success: false, error: error.message };
   }
   ```

3. **Component Structure**
   ```typescript
   interface ComponentProps {
     // Props
   }
   
   export function Component({ ...props }: ComponentProps) {
     // Hooks
     // State
     // Effects
     // Handlers
     // Render
   }
   ```

## Testing Approach

- Unit tests for utilities and hooks
- Integration tests for API endpoints  
- E2E tests for critical user flows
- AI prompt testing for consistency

## Security Considerations

- Sanitize all user inputs
- Validate generated code before execution
- Implement rate limiting
- Use CSP headers for preview iframe
- Store sensitive keys in environment variables

## Performance Goals

- Generate simple apps in <10 seconds
- Support projects with 50+ files
- Handle 100+ concurrent users
- Maintain <100ms API response time
- 95+ Lighthouse score

## Remember

This is an MVP focused on core functionality. Prioritize:
1. Reliable AI code generation
2. Smooth user experience
3. Clean, maintainable code
4. Comprehensive error handling

Avoid:
- Over-engineering
- Premature optimization  
- Feature creep
- Complex abstractions

The goal is to create a tool that makes web development accessible to everyone through the power of AI.