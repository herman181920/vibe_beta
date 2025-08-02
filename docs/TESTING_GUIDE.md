# Vibe Beta Testing Guide

## Overview

This guide outlines the comprehensive testing strategy for Vibe Beta, covering unit tests, integration tests, end-to-end tests, and performance benchmarks. Following these guidelines ensures high code quality and reliability.

## Testing Philosophy

- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **TDD Approach**: Write tests before implementation when possible
- **Coverage Goals**: Maintain >80% code coverage
- **Fast Feedback**: Tests should run quickly for rapid development
- **Realistic Scenarios**: Test actual user workflows

## Testing Stack

### Frontend Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing
- **Storybook**: Component development and testing

### Backend Testing
- **Jest**: Unit and integration testing
- **Supertest**: API endpoint testing
- **Prisma**: Database testing utilities
- **Docker**: Test environment consistency

## Unit Testing

### Frontend Components

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('applies correct styling variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
  });
});
```

### Custom Hooks

```typescript
// src/hooks/__tests__/useProject.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProject } from '../useProject';
import { mockServer } from '../../test/mockServer';

describe('useProject Hook', () => {
  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('fetches project data successfully', async () => {
    const { result } = renderHook(() => useProject('project-123'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.project).toBeNull();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.project).toEqual({
      id: 'project-123',
      name: 'Test Project',
      framework: 'react'
    });
  });

  it('handles error states', async () => {
    mockServer.use(
      rest.get('/api/projects/:id', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'Not found' }));
      })
    );

    const { result } = renderHook(() => useProject('invalid-id'));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.error).toBe('Not found');
    expect(result.current.project).toBeNull();
  });
});
```

### Backend Services

```typescript
// src/services/__tests__/ai.service.test.ts
import { AIService } from '../ai.service';
import { OpenAIProvider } from '../providers/openai';

jest.mock('../providers/openai');

describe('AIService', () => {
  let aiService: AIService;
  let mockProvider: jest.Mocked<OpenAIProvider>;

  beforeEach(() => {
    mockProvider = new OpenAIProvider() as jest.Mocked<OpenAIProvider>;
    aiService = new AIService(mockProvider);
  });

  describe('generateCode', () => {
    it('generates React component successfully', async () => {
      const mockResponse = 'export default function App() { return <div>Hello</div>; }';
      mockProvider.generate.mockResolvedValue(mockResponse);

      const result = await aiService.generateCode({
        prompt: 'Create a hello world app',
        framework: 'react'
      });

      expect(result.code).toBe(mockResponse);
      expect(result.framework).toBe('react');
      expect(mockProvider.generate).toHaveBeenCalledWith(
        expect.stringContaining('React'),
        expect.any(Object)
      );
    });

    it('validates generated code', async () => {
      const invalidCode = 'export default function App() { return <div>Hello</div> }'; // Missing semicolon
      mockProvider.generate.mockResolvedValue(invalidCode);

      await expect(aiService.generateCode({
        prompt: 'Create app',
        framework: 'react'
      })).rejects.toThrow('Invalid code syntax');
    });

    it('implements retry logic on failure', async () => {
      mockProvider.generate
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce('export default function App() { return <div>Hello</div>; }');

      const result = await aiService.generateCode({
        prompt: 'Create app',
        framework: 'react'
      });

      expect(result.code).toBeDefined();
      expect(mockProvider.generate).toHaveBeenCalledTimes(2);
    });
  });
});
```

## Integration Testing

### API Endpoints

```typescript
// src/routes/__tests__/projects.test.ts
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../prisma';
import { generateToken } from '../../utils/auth';

describe('Projects API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User'
      }
    });
    userId = user.id;
    authToken = generateToken(user);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          framework: 'react',
          description: 'A test project'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Test Project',
        framework: 'react',
        userId
      });

      // Verify in database
      const project = await prisma.project.findUnique({
        where: { id: response.body.id }
      });
      expect(project).toBeTruthy();
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing name
          framework: 'react'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          framework: 'react'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          framework: 'react',
          userId
        }
      });
      projectId = project.id;
    });

    it('retrieves project with files', async () => {
      // Add test files
      await prisma.file.createMany({
        data: [
          { projectId, path: 'src/App.tsx', content: '...', language: 'typescript' },
          { projectId, path: 'src/index.css', content: '...', language: 'css' }
        ]
      });

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.files).toHaveLength(2);
      expect(response.body.files[0].path).toBe('src/App.tsx');
    });

    it('prevents access to other users projects', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'password'
        }
      });

      const otherProject = await prisma.project.create({
        data: {
          name: 'Other Project',
          framework: 'vue',
          userId: otherUser.id
        }
      });

      const response = await request(app)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

### WebSocket Testing

```typescript
// src/websocket/__tests__/collaboration.test.ts
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';
import { setupWebSocket } from '../index';

describe('WebSocket Collaboration', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = setupWebSocket(httpServer);
    
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket1 = Client(`http://localhost:${port}`);
      clientSocket2 = Client(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket1.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  it('broadcasts code updates to all clients in project', (done) => {
    const projectId = 'test-project-123';
    const codeUpdate = {
      file: 'src/App.tsx',
      content: 'updated code'
    };

    // Both clients join the same project
    clientSocket1.emit('join-project', projectId);
    clientSocket2.emit('join-project', projectId);

    // Client 2 listens for updates
    clientSocket2.on('code-update', (data) => {
      expect(data).toEqual(codeUpdate);
      done();
    });

    // Client 1 sends an update
    setTimeout(() => {
      clientSocket1.emit('code-update', {
        projectId,
        ...codeUpdate
      });
    }, 100);
  });

  it('isolates updates to specific projects', (done) => {
    clientSocket1.emit('join-project', 'project-1');
    clientSocket2.emit('join-project', 'project-2');

    let received = false;
    clientSocket2.on('code-update', () => {
      received = true;
    });

    clientSocket1.emit('code-update', {
      projectId: 'project-1',
      file: 'test.ts',
      content: 'test'
    });

    setTimeout(() => {
      expect(received).toBe(false);
      done();
    }, 200);
  });
});
```

## End-to-End Testing

### User Workflows

```typescript
// e2e/create-app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create App Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start Building');
  });

  test('creates a React app from scratch', async ({ page }) => {
    // Type in the chat
    await page.fill('[data-testid="prompt-input"]', 
      'Create a todo list app with add, remove, and mark complete features');
    await page.press('[data-testid="prompt-input"]', 'Enter');

    // Wait for AI response
    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('Creating your todo list app');

    // Wait for preview to load
    await expect(page.frameLocator('[data-testid="preview-iframe"]')
      .locator('text=Todo List')).toBeVisible({ timeout: 30000 });

    // Verify generated files
    await page.click('[data-testid="file-tree-toggle"]');
    await expect(page.locator('text=App.tsx')).toBeVisible();
    await expect(page.locator('text=TodoItem.tsx')).toBeVisible();

    // Test the generated app
    const preview = page.frameLocator('[data-testid="preview-iframe"]');
    await preview.locator('input[placeholder="Add a todo"]').fill('Test todo');
    await preview.locator('button:has-text("Add")').click();
    await expect(preview.locator('text=Test todo')).toBeVisible();
  });

  test('uses template to create app', async ({ page }) => {
    // Click on a template
    await page.click('text=Build a Netflix clone');

    // Verify template prompt is loaded
    await expect(page.locator('[data-testid="prompt-input"]'))
      .toHaveValue(/Netflix-style homepage/);

    // Generate the app
    await page.click('[data-testid="generate-button"]');

    // Verify preview contains expected elements
    const preview = page.frameLocator('[data-testid="preview-iframe"]');
    await expect(preview.locator('[data-testid="hero-banner"]'))
      .toBeVisible({ timeout: 30000 });
    await expect(preview.locator('[data-testid="movie-grid"]'))
      .toBeVisible();
  });

  test('handles errors gracefully', async ({ page }) => {
    // Send invalid prompt
    await page.fill('[data-testid="prompt-input"]', 'Generate syntax error');
    await page.press('[data-testid="prompt-input"]', 'Enter');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Failed to generate valid code');

    // Should offer to retry
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });
});
```

### Deployment Testing

```typescript
// e2e/deployment.spec.ts
test.describe('Deployment Flow', () => {
  test('deploys to Vercel successfully', async ({ page }) => {
    // Create and save a project first
    await createTestProject(page);
    
    // Click deploy button
    await page.click('[data-testid="deploy-button"]');
    
    // Select Vercel
    await page.click('text=Deploy to Vercel');
    
    // Wait for deployment
    await expect(page.locator('[data-testid="deployment-status"]'))
      .toContainText('Deploying...', { timeout: 5000 });
    
    await expect(page.locator('[data-testid="deployment-status"]'))
      .toContainText('Deployed successfully', { timeout: 120000 });
    
    // Verify deployment URL
    const deployUrl = await page.locator('[data-testid="deploy-url"]').textContent();
    expect(deployUrl).toMatch(/https:\/\/.*\.vercel\.app/);
    
    // Visit deployed app
    await page.goto(deployUrl!);
    await expect(page.locator('body')).toContainText('Todo List');
  });
});
```

## Performance Testing

### Load Testing

```typescript
// performance/load-test.ts
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';

export const options: Options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Scale to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

const BASE_URL = 'https://api.vibe-beta.com';

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  const token = loginRes.json('token');
  
  // Create project
  const createRes = http.post(`${BASE_URL}/api/projects`, JSON.stringify({
    name: `Load Test Project ${Date.now()}`,
    framework: 'react'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  
  check(createRes, {
    'project created': (r) => r.status === 201,
  });
  
  const projectId = createRes.json('id');
  
  // Generate code
  const generateRes = http.post(`${BASE_URL}/api/ai/generate`, JSON.stringify({
    projectId,
    prompt: 'Create a simple counter component'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  
  check(generateRes, {
    'code generated': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 5000,
  });
  
  sleep(1);
}
```

### Frontend Performance

```typescript
// performance/lighthouse-test.ts
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // Check scores
  const scores = {
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100,
  };
  
  console.log('Lighthouse Scores:', scores);
  
  // Assert minimum scores
  expect(scores.performance).toBeGreaterThan(85);
  expect(scores.accessibility).toBeGreaterThan(90);
  expect(scores.bestPractices).toBeGreaterThan(90);
  expect(scores.seo).toBeGreaterThan(90);
  
  await chrome.kill();
}

test('Homepage performance', async () => {
  await runLighthouse('https://vibe-beta.com');
});

test('Builder performance', async () => {
  await runLighthouse('https://vibe-beta.com/builder');
});
```

## Test Data Management

### Fixtures

```typescript
// test/fixtures/projects.ts
export const mockProjects = {
  basic: {
    id: 'proj_123',
    name: 'Test Project',
    framework: 'react' as const,
    files: [
      {
        path: 'src/App.tsx',
        content: 'export default function App() { return <div>Hello</div>; }',
        language: 'typescript'
      }
    ]
  },
  
  complex: {
    id: 'proj_456',
    name: 'E-commerce App',
    framework: 'react' as const,
    files: [
      { path: 'src/App.tsx', content: '...', language: 'typescript' },
      { path: 'src/components/ProductList.tsx', content: '...', language: 'typescript' },
      { path: 'src/components/Cart.tsx', content: '...', language: 'typescript' },
      { path: 'src/hooks/useCart.ts', content: '...', language: 'typescript' },
      { path: 'src/services/api.ts', content: '...', language: 'typescript' },
    ]
  }
};
```

### Test Utilities

```typescript
// test/utils/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/providers/theme-provider';

function render(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Setup database
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vibe_test
      
      - name: Run unit tests
        run: npm test -- --coverage
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vibe_test
      
      - name: Run E2E tests
        run: |
          npm run build
          npm run preview &
          npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests focused and isolated

### 2. Mocking Strategy
- Mock external dependencies
- Use MSW for API mocking
- Avoid over-mocking
- Test integration points

### 3. Async Testing
- Always await async operations
- Use proper timeouts
- Handle loading states
- Test error scenarios

### 4. Accessibility Testing
- Include a11y tests in component tests
- Use semantic HTML assertions
- Test keyboard navigation
- Verify ARIA attributes

### 5. Performance Considerations
- Keep test suites fast
- Use test.skip for slow tests
- Parallelize when possible
- Clean up after tests

## Debugging Tests

### Common Issues

1. **Flaky Tests**
   - Add proper waits for async operations
   - Use stable selectors
   - Mock time-dependent features
   - Increase timeouts judiciously

2. **Database State**
   - Reset database between tests
   - Use transactions for isolation
   - Create fresh test data
   - Clean up after tests

3. **Network Issues**
   - Mock all external requests
   - Handle timeout scenarios
   - Test offline behavior
   - Verify retry logic

## Continuous Improvement

- Review test failures regularly
- Update tests with bug fixes
- Add tests for new features
- Refactor tests for maintainability
- Monitor test execution time
- Track coverage trends