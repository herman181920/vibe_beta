# Vibe Beta - Git Workflow & Version Control Guidelines

## Repository Structure

```
main                    # Production-ready code
├── develop            # Integration branch for features
    ├── feature/*      # Feature branches
    ├── bugfix/*       # Bug fix branches
    ├── hotfix/*       # Emergency fixes
    └── release/*      # Release preparation branches
```

## Branch Naming Convention

### Feature Branches
- Format: `feature/TICKET-description`
- Example: `feature/VB-123-add-chat-interface`

### Bugfix Branches
- Format: `bugfix/TICKET-description`
- Example: `bugfix/VB-456-fix-preview-refresh`

### Hotfix Branches
- Format: `hotfix/TICKET-description`
- Example: `hotfix/VB-789-critical-auth-fix`

### Release Branches
- Format: `release/v1.2.3`
- Example: `release/v1.0.0`

## Commit Message Convention

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

### Examples
```bash
feat(chat): add real-time message streaming

Implement WebSocket connection for streaming AI responses
in real-time as they are generated.

Closes #123

---

fix(preview): resolve iframe refresh issue

The preview iframe was not updating when code changes were made.
This fix adds proper event listeners and cache busting.

Fixes #456
```

## Workflow Process

### 1. Starting New Work

```bash
# Update your local develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/VB-123-feature-name

# Make your changes
# ...

# Stage and commit changes
git add .
git commit -m "feat(module): add new functionality"
```

### 2. Pushing Changes

```bash
# Push your branch
git push origin feature/VB-123-feature-name

# Create a Pull Request on GitHub
# - Set base branch to 'develop'
# - Add reviewers
# - Link related issues
```

### 3. Code Review Process

#### Author Responsibilities
- Write clear PR description
- Ensure all tests pass
- Respond to feedback promptly
- Update branch with latest develop

#### Reviewer Responsibilities
- Review within 24 hours
- Provide constructive feedback
- Approve when satisfied
- Check for:
  - Code quality
  - Test coverage
  - Documentation
  - Security concerns

### 4. Merging

```bash
# After approval, merge via GitHub PR
# Use "Squash and merge" for feature branches
# Use "Create a merge commit" for release branches
```

### 5. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Make release preparations
# - Update version numbers
# - Update CHANGELOG.md
# - Final testing

# Merge to main
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Back-merge to develop
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop
```

### 6. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/VB-999-critical-fix

# Make fixes
# ...

# Merge to main
git checkout main
git merge --no-ff hotfix/VB-999-critical-fix
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/VB-999-critical-fix
git push origin develop
```

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
```

## Git Hooks

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linting
npm run lint

# Run tests
npm test

# Check for console.logs
if grep -r "console.log" src/; then
  echo "Error: console.log found in source files"
  exit 1
fi
```

### Commit Message Hook
```bash
#!/bin/sh
# .git/hooks/commit-msg

# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "Invalid commit message format!"
  echo "Format: <type>(<scope>): <subject>"
  exit 1
fi
```

## Best Practices

### Do's
- Pull latest changes before starting work
- Keep commits atomic and focused
- Write meaningful commit messages
- Test before pushing
- Keep PR's small and focused
- Update documentation with code changes
- Delete branches after merging

### Don'ts
- Don't commit directly to main or develop
- Don't force push to shared branches
- Don't merge without review
- Don't commit sensitive data
- Don't ignore failing tests
- Don't use generic commit messages

## Useful Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Amend last commit
git commit --amend

# Interactive rebase
git rebase -i HEAD~3

# Cherry-pick commit
git cherry-pick <commit-hash>

# Show commit history with graph
git log --oneline --graph --all

# Clean up local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Stash changes
git stash save "WIP: feature description"
git stash pop
```

## Conflict Resolution

When conflicts occur:

1. Pull latest changes from target branch
2. Resolve conflicts locally
3. Test thoroughly
4. Commit resolution
5. Push changes

```bash
# Update your branch with latest develop
git checkout feature/your-branch
git pull origin develop
# Resolve conflicts in your editor
git add .
git commit -m "chore: resolve merge conflicts with develop"
git push origin feature/your-branch
```

## Version Tagging

We use Semantic Versioning (SemVer):
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

```bash
# Create annotated tag
git tag -a v1.2.3 -m "Release version 1.2.3"

# Push tags
git push origin --tags

# List tags
git tag -l

# Delete tag
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3
```

---

**Remember**: Good version control practices lead to better collaboration and easier debugging!