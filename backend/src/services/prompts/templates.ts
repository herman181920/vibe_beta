export const PROMPT_TEMPLATES = {
  react: {
    system: `You are an expert React developer. You create production-ready, well-structured React applications with TypeScript and modern best practices. Always use functional components, hooks, and proper TypeScript types. Include proper error handling and loading states.`,
    
    app: `Create a React application with the following specifications:

DESCRIPTION:
{userDescription}

PROJECT NAME: {projectName}

TECHNICAL REQUIREMENTS:
- Use React 18+ with functional components and hooks
- Implement proper TypeScript types and interfaces
- Use Tailwind CSS for styling with the existing design system
- Follow React best practices and patterns
- Include proper error boundaries and loading states
- Implement responsive design for mobile/tablet/desktop
- Use React Router v6 for navigation (if multi-page)
- Optimize for performance with React.memo and useMemo where appropriate

EXISTING CONTEXT:
- Dependencies: {dependencies}
- Existing files: {existingFiles}

FILE STRUCTURE:
Create files with the following structure:
// File: src/App.tsx
[Complete TypeScript React component code]

// File: src/components/ComponentName.tsx
[Component code]

// File: src/types/index.ts
[TypeScript type definitions]

// File: src/hooks/useCustomHook.ts
[Custom hook code]

OUTPUT RULES:
1. Each file must be clearly marked with "// File: [path]"
2. Generate complete, working code - no placeholders or comments like "add your code here"
3. Include all necessary imports
4. Ensure all TypeScript types are properly defined
5. Follow the existing project structure

Generate the complete application now:`
  },
  
  vue: {
    system: `You are an expert Vue.js developer. You create production-ready Vue 3 applications using the Composition API, TypeScript, and modern best practices. Always use script setup syntax and proper TypeScript types.`,
    
    app: `Create a Vue 3 application with the following specifications:

DESCRIPTION:
{userDescription}

PROJECT NAME: {projectName}

TECHNICAL REQUIREMENTS:
- Use Vue 3 with Composition API and <script setup>
- Implement proper TypeScript support
- Use Tailwind CSS for styling
- Follow Vue.js best practices
- Include proper error handling and loading states
- Implement responsive design
- Use Vue Router 4 for navigation (if needed)
- Use Pinia for state management (if needed)

EXISTING CONTEXT:
- Dependencies: {dependencies}
- Existing files: {existingFiles}

FILE STRUCTURE:
Create files with the following structure:
// File: src/App.vue
<script setup lang="ts">
// Composition API logic
</script>

<template>
  <!-- Template here -->
</template>

<style scoped>
/* Scoped styles if needed */
</style>

// File: src/components/ComponentName.vue
[Component code]

// File: src/types/index.ts
[TypeScript type definitions]

// File: src/composables/useCustomHook.ts
[Composable code]

OUTPUT RULES:
1. Each file must be clearly marked with "// File: [path]"
2. Generate complete, working code
3. Use <script setup lang="ts"> syntax
4. Include all necessary imports
5. Ensure proper TypeScript types

Generate the complete application now:`
  },
  
  vanilla: {
    system: `You are an expert JavaScript developer. You create clean, modern vanilla JavaScript applications with proper structure and best practices. Focus on performance, accessibility, and clean code.`,
    
    app: `Create a vanilla JavaScript application with the following specifications:

DESCRIPTION:
{userDescription}

PROJECT NAME: {projectName}

TECHNICAL REQUIREMENTS:
- Use modern ES6+ JavaScript features
- Implement a clean, modular structure
- Use CSS with Tailwind classes for styling
- Include proper error handling
- Implement responsive design
- Use semantic HTML5
- Optimize for performance
- Ensure accessibility

EXISTING CONTEXT:
- Dependencies: {dependencies}
- Existing files: {existingFiles}

FILE STRUCTURE:
Create files with the following structure:
// File: index.html
[Complete HTML with proper structure]

// File: src/js/app.js
[Main JavaScript application code]

// File: src/js/components/componentName.js
[Component code as ES6 modules]

// File: src/css/styles.css
[Custom CSS with Tailwind utilities]

OUTPUT RULES:
1. Each file must be clearly marked with "// File: [path]"
2. Generate complete, working code
3. Use ES6 modules for organization
4. Include proper event handling
5. Ensure cross-browser compatibility

Generate the complete application now:`
  }
};

export function getPromptTemplate(framework: 'react' | 'vue' | 'vanilla', type: 'system' | 'app'): string {
  return PROMPT_TEMPLATES[framework][type];
}

export const COMPONENT_PROMPTS = {
  dataTable: `Create a reusable DataTable component with the following features:
- Sorting by columns (click header to sort)
- Pagination with customizable page size
- Search/filter functionality
- Row selection with checkboxes
- Column visibility toggle
- Export to CSV functionality
- Responsive design with horizontal scroll on mobile
- Loading and empty states
- TypeScript types for all props

The component should be flexible to work with any data structure.`,

  form: `Create a Form component with the following features:
- Dynamic field generation based on schema
- Built-in validation with error messages
- Support for text, email, password, number, select, checkbox, radio, and textarea fields
- Loading state during submission
- Success and error feedback
- Accessibility features (proper labels, ARIA attributes)
- TypeScript types for form schema and values
- Integration with React Hook Form or similar`,

  authentication: `Create an authentication system with the following components:
- Login form with email/password
- Registration form with password confirmation
- Password reset flow
- Protected route wrapper
- User context/store for auth state
- Persistent sessions with JWT
- Logout functionality
- Remember me option
- Social login buttons (UI only)
- Proper error handling and user feedback`,

  dashboard: `Create a dashboard layout with the following features:
- Responsive sidebar navigation
- Header with user menu
- Main content area with routing
- Breadcrumb navigation
- Theme toggle (dark/light mode)
- Notification center
- Search functionality
- Mobile menu toggle
- Collapsible sidebar
- Quick actions menu`,

  chart: `Create a Chart component wrapper with the following features:
- Support for line, bar, pie, and area charts
- Responsive sizing
- Animated transitions
- Custom color schemes
- Legend toggle
- Tooltip on hover
- Export chart as image
- Real-time data updates
- TypeScript types for data structure
- Loading and error states`
};

export const ERROR_PROMPTS = {
  syntax: `The following syntax error occurred:
{error}

In this code:
\`\`\`{language}
{code}
\`\`\`

Fix the syntax error and return only the corrected code section.`,

  type: `The following TypeScript error occurred:
{error}

In this code:
\`\`\`typescript
{code}
\`\`\`

Fix the type error by:
1. Adding proper type definitions
2. Fixing type mismatches
3. Ensuring all imports are typed

Return the corrected code with proper types.`,

  runtime: `The following runtime error occurred:
{error}

Stack trace:
{stack}

Fix the error by identifying the root cause and providing a solution.`,

  build: `The build failed with the following error:
{error}

This typically indicates:
1. Missing dependencies
2. Import/export issues
3. Configuration problems

Provide a fix for the build error.`
};

export const IMPROVEMENT_PROMPTS = {
  performance: `Optimize this code for better performance:
\`\`\`{language}
{code}
\`\`\`

Focus on:
1. Reducing unnecessary re-renders
2. Optimizing loops and data structures
3. Implementing proper memoization
4. Lazy loading where appropriate
5. Bundle size optimization`,

  accessibility: `Improve the accessibility of this code:
\`\`\`{language}
{code}
\`\`\`

Ensure:
1. Proper ARIA labels and roles
2. Keyboard navigation support
3. Screen reader compatibility
4. Color contrast compliance
5. Focus management`,

  security: `Review this code for security issues:
\`\`\`{language}
{code}
\`\`\`

Check for:
1. XSS vulnerabilities
2. Injection attacks
3. Insecure data handling
4. Authentication/authorization issues
5. Sensitive data exposure`
};