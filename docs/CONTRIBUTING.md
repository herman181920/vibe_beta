# Contributing to Vibe Beta

First off, thank you for considering contributing to Vibe Beta! It's people like you that make Vibe Beta such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:

- `good first issue` - issues which should only require a few lines of code
- `help wanted` - issues which should be a bit more involved than beginner issues

### Pull Requests

1. Fork the repo and create your branch from `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setting Up Your Development Environment

1. Fork and clone the repository
```bash
git clone https://github.com/yourusername/vibe-beta.git
cd vibe-beta
```

2. Install dependencies
```bash
npm run install:all
```

3. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

4. Make your changes and commit
```bash
git add .
git commit -m "feat: add amazing feature"
```

5. Push to your fork
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request

### Coding Standards

#### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types
- Use interfaces over type aliases where possible

#### React
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

#### Testing
- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test edge cases

#### Code Style
- Use Prettier for formatting
- Use ESLint for linting
- Follow existing code style
- Use meaningful variable names

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add chat history feature
fix: resolve websocket connection issue
docs: update installation instructions
```

### Testing Your Changes

1. Run unit tests
```bash
npm test
```

2. Run linting
```bash
npm run lint
```

3. Build the project
```bash
npm run build
```

4. Test manually
- Start the development server
- Test your changes thoroughly
- Check for edge cases

## Project Structure

Understanding the project structure will help you navigate and contribute effectively:

```
vibe-beta/
├── frontend/          # React application
├── backend/           # Express API
├── shared/           # Shared types/utilities
├── docs/             # Documentation
└── scripts/          # Build/deploy scripts
```

## Documentation

- Update documentation for any changed functionality
- Write clear code comments
- Update API documentation if endpoints change
- Add JSDoc comments for public functions

## Review Process

### What We Look For

- **Code Quality**: Is the code clean, readable, and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the feature/fix documented?
- **Performance**: Does it impact performance?
- **Security**: Are there any security concerns?

### Review Timeline

- We aim to review PRs within 48 hours
- Complex changes may take longer
- Feel free to ping if no response after 72 hours

## Recognition

Contributors who make significant contributions will be:
- Added to the contributors list
- Mentioned in release notes
- Given credit in the documentation

## Questions?

Don't hesitate to ask questions! You can:
- Open an issue for clarification
- Join our Discord community
- Email us at contributors@vibe-beta.com

Thank you for contributing! 🎉