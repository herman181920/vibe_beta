# AI Prompt Engineering Guide

## Overview

This document outlines the prompt engineering strategies and templates used in Vibe Beta for generating high-quality web applications through AI. Proper prompt engineering is crucial for consistent, reliable, and production-ready code generation.

## Core Principles

### 1. Clarity and Specificity
- Be explicit about requirements and constraints
- Include technical specifications
- Define expected output format
- Specify coding standards and conventions

### 2. Context Awareness
- Provide relevant project context
- Include existing code structure
- Reference installed dependencies
- Maintain conversation history

### 3. Framework-Specific Guidelines
- Use framework-appropriate patterns
- Follow community best practices
- Include proper typing (TypeScript)
- Implement error handling

## Prompt Templates

### React Application Generation

```typescript
const REACT_APP_PROMPT = `
You are an expert React developer. Create a {appType} application with the following specifications:

DESCRIPTION:
{userDescription}

TECHNICAL REQUIREMENTS:
- Use React 18+ with functional components and hooks
- Implement proper TypeScript types and interfaces
- Use Tailwind CSS for styling with custom design system
- Follow React best practices and patterns
- Include proper error boundaries and loading states
- Implement responsive design for mobile/tablet/desktop
- Use React Router v6 for navigation (if multi-page)
- Optimize for performance with React.memo and useMemo where appropriate

FILE STRUCTURE:
src/
├── App.tsx                 # Main application component
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Input, etc.)
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── services/             # API and external service integrations
├── types/                # TypeScript type definitions
├── utils/                # Helper functions and utilities
└── styles/               # Global styles and Tailwind config

CODING STANDARDS:
- Use descriptive component and variable names
- Implement proper prop validation with TypeScript
- Add JSDoc comments for complex functions
- Keep components small and focused (< 200 lines)
- Use custom hooks for logic extraction
- Implement proper accessibility (ARIA labels, semantic HTML)

OUTPUT FORMAT:
Return the complete code for all necessary files. Each file should be clearly marked with:
// File: [filepath]
[file content]

IMPORTANT: Generate production-ready code that can be directly used without modifications.
`;
```

### Vue.js Application Generation

```typescript
const VUE_APP_PROMPT = `
You are an expert Vue.js developer. Create a {appType} application with the following specifications:

DESCRIPTION:
{userDescription}

TECHNICAL REQUIREMENTS:
- Use Vue 3 with Composition API
- Implement proper TypeScript support
- Use Tailwind CSS for styling
- Follow Vue.js best practices
- Include proper error handling and loading states
- Implement responsive design
- Use Vue Router 4 for navigation (if needed)
- Use Pinia for state management (if needed)

FILE STRUCTURE:
src/
├── App.vue               # Root component
├── components/          # Vue components
│   ├── base/           # Base components
│   └── features/       # Feature components
├── composables/        # Composition API composables
├── stores/             # Pinia stores
├── views/              # Page components
├── router/             # Router configuration
├── types/              # TypeScript types
└── utils/              # Utilities

COMPONENT TEMPLATE:
<script setup lang="ts">
// Imports and logic here
</script>

<template>
  <!-- Template here -->
</template>

<style scoped>
/* Scoped styles if needed */
</style>

OUTPUT FORMAT:
Return complete code for all files with clear file markers.
`;
```

### Backend API Generation

```typescript
const BACKEND_API_PROMPT = `
You are an expert backend developer. Create a RESTful API with the following specifications:

DESCRIPTION:
{userDescription}

TECHNICAL REQUIREMENTS:
- Use Node.js with Express and TypeScript
- Implement proper error handling and validation
- Use Prisma ORM for database operations
- Include authentication with JWT (if needed)
- Follow RESTful conventions
- Implement proper security measures
- Add request validation with Zod
- Include proper logging

FILE STRUCTURE:
src/
├── index.ts            # Server entry point
├── routes/            # API routes
├── controllers/       # Route handlers
├── services/          # Business logic
├── middleware/        # Custom middleware
├── types/             # TypeScript types
├── utils/             # Utilities
└── prisma/
    └── schema.prisma  # Database schema

API ENDPOINTS:
Define clear RESTful endpoints following this pattern:
- GET /api/[resource] - List resources
- GET /api/[resource]/:id - Get single resource
- POST /api/[resource] - Create resource
- PUT /api/[resource]/:id - Update resource
- DELETE /api/[resource]/:id - Delete resource

Include proper status codes, error responses, and data validation.
`;
```

## Context Enhancement Strategies

### 1. Project Context Integration

```typescript
interface ProjectContext {
  framework: 'react' | 'vue' | 'vanilla';
  dependencies: string[];
  existingFiles: FileInfo[];
  projectStructure: string;
  designSystem: DesignTokens;
  previousMessages: Message[];
}

function enhancePromptWithContext(basePrompt: string, context: ProjectContext): string {
  return `
${basePrompt}

EXISTING PROJECT CONTEXT:
- Framework: ${context.framework}
- Installed Dependencies: ${context.dependencies.join(', ')}
- Current File Structure:
${context.projectStructure}

DESIGN SYSTEM:
- Primary Color: ${context.designSystem.primary}
- Font Family: ${context.designSystem.fontFamily}
- Spacing Scale: ${context.designSystem.spacing}

PREVIOUS CONTEXT:
${summarizePreviousMessages(context.previousMessages)}

BUILD ON EXISTING CODE:
Ensure compatibility with existing files and maintain consistent patterns.
  `;
}
```

### 2. Error Recovery Prompts

```typescript
const ERROR_FIX_PROMPT = `
The following error occurred in the generated code:

ERROR:
{errorMessage}

FILE: {filePath}
LINE: {lineNumber}

CODE CONTEXT:
\`\`\`{language}
{codeContext}
\`\`\`

Please provide a fix for this error that:
1. Resolves the immediate issue
2. Maintains compatibility with the rest of the codebase
3. Follows the project's coding standards
4. Includes an explanation of what caused the error

Return only the corrected code section and explanation.
`;
```

### 3. Code Improvement Prompts

```typescript
const CODE_IMPROVEMENT_PROMPT = `
Review and improve the following code:

\`\`\`{language}
{code}
\`\`\`

IMPROVEMENT AREAS:
- Performance optimization
- Code readability and maintainability
- Error handling
- TypeScript type safety
- Accessibility
- Security best practices

Provide the improved code with explanations for each change.
`;
```

## Advanced Prompt Patterns

### 1. Multi-Step Generation

```typescript
const MULTI_STEP_GENERATION = {
  step1_analysis: `
    Analyze the user's requirements and create a detailed plan:
    1. List all required components
    2. Define the data model
    3. Identify necessary API endpoints
    4. Plan the UI/UX flow
  `,
  
  step2_implementation: `
    Based on the analysis, implement:
    1. Core data structures and types
    2. Main application components
    3. Business logic and services
    4. API integration layer
  `,
  
  step3_enhancement: `
    Enhance the implementation with:
    1. Error handling and edge cases
    2. Loading and empty states
    3. Animations and transitions
    4. Performance optimizations
  `
};
```

### 2. Component-Specific Templates

```typescript
const COMPONENT_TEMPLATES = {
  dataTable: `
    Create a reusable DataTable component with:
    - Sorting capabilities
    - Pagination
    - Search/filter functionality
    - Column customization
    - Row selection
    - Export functionality
    - Responsive design
  `,
  
  form: `
    Create a Form component with:
    - Field validation
    - Error display
    - Loading states
    - Success feedback
    - Accessibility features
    - Custom input components
  `,
  
  authentication: `
    Create an authentication system with:
    - Login/Register forms
    - Password reset flow
    - Session management
    - Protected routes
    - User profile management
  `
};
```

### 3. Integration Patterns

```typescript
const INTEGRATION_PROMPTS = {
  database: `
    Integrate with {databaseType} including:
    - Connection setup
    - Schema definitions
    - CRUD operations
    - Query optimization
    - Migration system
  `,
  
  thirdPartyAPI: `
    Integrate with {apiName} API:
    - Authentication setup
    - Request/response handling
    - Error handling
    - Rate limiting
    - Caching strategy
  `,
  
  stateManagement: `
    Implement state management with {library}:
    - Store configuration
    - Actions and mutations
    - Getters/selectors
    - Middleware setup
    - DevTools integration
  `
};
```

## Prompt Optimization Techniques

### 1. Token Efficiency

```typescript
function optimizePrompt(prompt: string): string {
  // Remove redundant instructions
  // Use abbreviations for common terms
  // Compress whitespace
  // Focus on essential requirements
  return prompt
    .replace(/\s+/g, ' ')
    .replace(/component/g, 'comp')
    .replace(/functionality/g, 'func')
    .trim();
}
```

### 2. Response Parsing

```typescript
interface ParsedResponse {
  files: Map<string, string>;
  dependencies: string[];
  instructions: string[];
}

function parseAIResponse(response: string): ParsedResponse {
  const files = new Map<string, string>();
  const fileRegex = /\/\/ File: (.+)\n([\s\S]*?)(?=\/\/ File:|$)/g;
  
  let match;
  while ((match = fileRegex.exec(response)) !== null) {
    files.set(match[1], match[2].trim());
  }
  
  return {
    files,
    dependencies: extractDependencies(response),
    instructions: extractInstructions(response)
  };
}
```

### 3. Validation Patterns

```typescript
const VALIDATION_CHECKS = {
  syntaxValid: (code: string, language: string) => {
    // Use language-specific parsers
  },
  
  importsResolved: (code: string, availableDeps: string[]) => {
    // Check all imports can be resolved
  },
  
  typeSafe: (code: string) => {
    // Run TypeScript compiler checks
  },
  
  securityScan: (code: string) => {
    // Check for common vulnerabilities
  }
};
```

## Best Practices

### 1. Prompt Testing

- Test prompts with various inputs
- Validate output consistency
- Measure generation time
- Track error rates
- A/B test prompt variations

### 2. Continuous Improvement

- Collect user feedback
- Analyze failed generations
- Update templates based on new patterns
- Incorporate new framework features
- Optimize for model updates

### 3. Safety Measures

- Filter harmful content
- Prevent prompt injection
- Validate generated code
- Sandbox execution environment
- Rate limit generations

## Prompt Examples Library

### E-commerce Components

```typescript
const ECOMMERCE_PROMPTS = {
  productCatalog: "Create a product catalog with grid/list view...",
  shoppingCart: "Implement a shopping cart with add/remove/update...",
  checkoutFlow: "Build a multi-step checkout process...",
  orderTracking: "Create an order tracking system...",
};
```

### Dashboard Components

```typescript
const DASHBOARD_PROMPTS = {
  analytics: "Create an analytics dashboard with charts...",
  userManagement: "Build a user management interface...",
  notifications: "Implement a notification system...",
  settings: "Create a settings page with sections...",
};
```

### Social Features

```typescript
const SOCIAL_PROMPTS = {
  feed: "Create a social media feed with posts...",
  messaging: "Build a real-time messaging system...",
  profiles: "Implement user profiles with customization...",
  comments: "Create a nested comment system...",
};
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Incomplete Generation**
   - Increase context window
   - Break into smaller prompts
   - Use continuation prompts

2. **Inconsistent Styling**
   - Provide design system context
   - Include example components
   - Specify CSS framework

3. **Missing Error Handling**
   - Explicitly request error cases
   - Provide error examples
   - Include validation requirements

4. **Performance Issues**
   - Request optimization techniques
   - Specify performance constraints
   - Include bundling considerations

## Future Enhancements

1. **Multi-Model Support**
   - Optimize prompts for different models
   - Model-specific templates
   - Fallback strategies

2. **Learning System**
   - Track successful patterns
   - Auto-improve prompts
   - User preference learning

3. **Domain-Specific Languages**
   - Custom DSLs for common patterns
   - Visual prompt builders
   - Template marketplace