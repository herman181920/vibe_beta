# Vibe Beta API Reference

## Overview

The Vibe Beta API provides programmatic access to all features of the AI-powered web app builder. This document details all available endpoints, request/response formats, and usage examples.

## Base URL

```
Production: https://api.vibe-beta.com/v1
Development: http://localhost:5000/api
```

## Authentication

All API requests require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Getting a Token

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clh2k3j4k0000...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Endpoints

### Authentication

#### Register New User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clh2k3j4k0000...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Projects

#### List Projects

```http
GET /projects?page=1&limit=10&search=todo
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page (default: 10, max: 50)
- `search` (optional): Search term for project name/description

**Response:**
```json
{
  "projects": [
    {
      "id": "clh2k3j4k0001...",
      "name": "Todo App",
      "description": "A simple todo list application",
      "framework": "react",
      "isPublic": false,
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Create Project

```http
POST /projects
```

**Request Body:**
```json
{
  "name": "E-commerce Store",
  "description": "Online shopping platform",
  "framework": "react",
  "template": "blank"
}
```

**Response:**
```json
{
  "id": "clh2k3j4k0002...",
  "name": "E-commerce Store",
  "description": "Online shopping platform",
  "framework": "react",
  "isPublic": false,
  "files": [],
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### Get Project Details

```http
GET /projects/:projectId
```

**Response:**
```json
{
  "id": "clh2k3j4k0002...",
  "name": "E-commerce Store",
  "description": "Online shopping platform",
  "framework": "react",
  "isPublic": false,
  "deploymentUrl": "https://my-app.vibe-beta.app",
  "files": [
    {
      "id": "clh2k3j4k0003...",
      "path": "src/App.tsx",
      "content": "import React from 'react'...",
      "language": "typescript"
    }
  ],
  "messages": [
    {
      "id": "clh2k3j4k0004...",
      "role": "user",
      "content": "Create an e-commerce store",
      "createdAt": "2024-01-20T10:31:00Z"
    }
  ],
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

#### Update Project

```http
PUT /projects/:projectId
```

**Request Body:**
```json
{
  "name": "Updated E-commerce Store",
  "description": "Advanced shopping platform",
  "isPublic": true
}
```

#### Delete Project

```http
DELETE /projects/:projectId
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### AI Generation

#### Generate Code

```http
POST /ai/generate
```

**Request Body:**
```json
{
  "projectId": "clh2k3j4k0002...",
  "prompt": "Add a shopping cart with add to cart functionality",
  "context": {
    "currentFiles": ["src/App.tsx", "src/components/ProductList.tsx"],
    "framework": "react",
    "dependencies": ["react", "react-router-dom"]
  }
}
```

**Response (Streaming):**
```
data: {"type":"start","message":"Generating code..."}
data: {"type":"file","path":"src/components/Cart.tsx","content":"import React..."}
data: {"type":"file","path":"src/hooks/useCart.ts","content":"import { useState..."}
data: {"type":"complete","filesGenerated":2}
```

#### Explain Code

```http
POST /ai/explain
```

**Request Body:**
```json
{
  "code": "const [cart, setCart] = useState<CartItem[]>([]);",
  "language": "typescript"
}
```

**Response:**
```json
{
  "explanation": "This line creates a React state variable called 'cart' using the useState hook...",
  "concepts": ["React Hooks", "TypeScript Generics", "State Management"]
}
```

#### Fix Error

```http
POST /ai/fix-error
```

**Request Body:**
```json
{
  "error": {
    "message": "Cannot find module './Cart'",
    "file": "src/App.tsx",
    "line": 5
  },
  "context": {
    "projectId": "clh2k3j4k0002...",
    "files": ["src/App.tsx"]
  }
}
```

### Files

#### Get File

```http
GET /projects/:projectId/files/:filePath
```

**Response:**
```json
{
  "id": "clh2k3j4k0003...",
  "path": "src/App.tsx",
  "content": "import React from 'react'...",
  "language": "typescript",
  "size": 2048,
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

#### Create/Update File

```http
PUT /projects/:projectId/files
```

**Request Body:**
```json
{
  "path": "src/components/Header.tsx",
  "content": "import React from 'react'..."
}
```

#### Delete File

```http
DELETE /projects/:projectId/files/:filePath
```

#### Batch File Operations

```http
POST /projects/:projectId/files/batch
```

**Request Body:**
```json
{
  "operations": [
    {
      "action": "create",
      "path": "src/utils/helpers.ts",
      "content": "export const formatCurrency..."
    },
    {
      "action": "update",
      "path": "src/App.tsx",
      "content": "import React from 'react'..."
    },
    {
      "action": "delete",
      "path": "src/old-component.tsx"
    }
  ]
}
```

### Deployment

#### Deploy Project

```http
POST /projects/:projectId/deploy
```

**Request Body:**
```json
{
  "platform": "vercel",
  "environment": {
    "NODE_ENV": "production",
    "API_KEY": "secret-key"
  },
  "domain": "my-custom-domain.com"
}
```

**Response:**
```json
{
  "deploymentId": "dep_1234567890",
  "url": "https://my-app.vercel.app",
  "status": "deploying",
  "estimatedTime": 120
}
```

#### Get Deployment Status

```http
GET /projects/:projectId/deployments/:deploymentId
```

**Response:**
```json
{
  "deploymentId": "dep_1234567890",
  "status": "success",
  "url": "https://my-app.vercel.app",
  "logs": ["Building...", "Optimizing...", "Deployed!"],
  "duration": 95,
  "createdAt": "2024-01-20T16:00:00Z"
}
```

### Export

#### Export as ZIP

```http
GET /projects/:projectId/export/zip
```

**Response:** Binary ZIP file

#### Export to GitHub

```http
POST /projects/:projectId/export/github
```

**Request Body:**
```json
{
  "repoName": "my-vibe-app",
  "isPrivate": false,
  "description": "Created with Vibe Beta"
}
```

**Response:**
```json
{
  "success": true,
  "repoUrl": "https://github.com/username/my-vibe-app"
}
```

### Collaboration

#### Share Project

```http
POST /projects/:projectId/share
```

**Request Body:**
```json
{
  "permission": "view",
  "expiresIn": 604800
}
```

**Response:**
```json
{
  "shareToken": "share_abc123xyz",
  "shareUrl": "https://vibe-beta.com/share/share_abc123xyz",
  "expiresAt": "2024-01-27T10:30:00Z"
}
```

#### Access Shared Project

```http
GET /shared/:shareToken
```

### WebSocket Events

Connect to WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://api.vibe-beta.com/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Join project room
ws.send(JSON.stringify({
  type: 'join-project',
  projectId: 'clh2k3j4k0002...'
}));
```

#### Event Types

**Code Update:**
```json
{
  "type": "code-update",
  "projectId": "clh2k3j4k0002...",
  "file": "src/App.tsx",
  "content": "import React...",
  "userId": "clh2k3j4k0000..."
}
```

**AI Response Stream:**
```json
{
  "type": "ai-stream",
  "projectId": "clh2k3j4k0002...",
  "chunk": "Creating a shopping cart component..."
}
```

**Collaboration Event:**
```json
{
  "type": "user-joined",
  "projectId": "clh2k3j4k0002...",
  "user": {
    "id": "clh2k3j4k0005...",
    "name": "Jane Doe"
  }
}
```

## Rate Limiting

API requests are rate limited based on your plan:

- **Free Plan**: 100 requests/hour, 10 AI generations/day
- **Pro Plan**: 1000 requests/hour, 100 AI generations/day
- **Enterprise**: Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705750800
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "The requested project does not exist",
    "details": {
      "projectId": "clh2k3j4k0002..."
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `AI_ERROR`: AI generation failed
- `DEPLOYMENT_FAILED`: Deployment error
- `INTERNAL_ERROR`: Server error

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VibeClient } from '@vibe-beta/sdk';

const client = new VibeClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vibe-beta.com/v1'
});

// Create a project
const project = await client.projects.create({
  name: 'My App',
  framework: 'react'
});

// Generate code
const stream = client.ai.generate({
  projectId: project.id,
  prompt: 'Create a todo list app'
});

for await (const chunk of stream) {
  console.log('Generated:', chunk);
}
```

### Python

```python
from vibe_beta import VibeClient

client = VibeClient(api_key="your-api-key")

# Create project
project = client.projects.create(
    name="My App",
    framework="react"
)

# Generate code
for chunk in client.ai.generate(
    project_id=project.id,
    prompt="Create a todo list app"
):
    print(f"Generated: {chunk}")
```

## Webhooks

Configure webhooks to receive real-time notifications:

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/vibe",
  "events": ["project.created", "deployment.success", "ai.generation.complete"]
}
```

### Webhook Events

- `project.created`
- `project.updated`
- `project.deleted`
- `deployment.started`
- `deployment.success`
- `deployment.failed`
- `ai.generation.started`
- `ai.generation.complete`
- `collaboration.user.joined`

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for API version history and changes.