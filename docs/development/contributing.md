# Contributing Guide

Thank you for your interest in contributing to GoDeploy! This guide covers the process for contributing code, documentation, and bug reports.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Set up the development environment (see [Development Setup](setup.md))
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 2. Make Changes

Follow the coding standards below. Run tests and linting before committing.

### 3. Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:

```
feat(api): add custom domain support
fix(cli): handle token refresh on 401
docs(readme): update installation instructions
refactor(dashboard): extract project card component
```

### 4. Submit Pull Request

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill out the PR template
4. Wait for review

## Coding Standards

### TypeScript

- No default exports
- Use `PascalCase` for components, interfaces, types
- Use `camelCase` for functions, variables
- Co-locate types with their usage
- Prefer `interface` over `type` for object shapes
- Use strict TypeScript settings

```typescript
// Good
export interface ProjectConfig {
  name: string;
  sourceDir: string;
}

export function createProject(config: ProjectConfig): Project {
  // ...
}

// Bad
export default function (config: any) {
  // ...
}
```

### React

- Functional components only
- Use hooks for state and effects
- Co-locate styles with components
- Keep components small and focused

```typescript
// Good
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
    </div>
  );
}

// Bad
export default class ProjectCard extends React.Component {
  // ...
}
```

### Go (CLI)

- Follow [Effective Go](https://golang.org/doc/effective_go)
- Use `gofmt` for formatting
- Keep functions small
- Handle errors explicitly

```go
// Good
func (c *Client) Deploy(projectID string) (*Deploy, error) {
    resp, err := c.post("/deploys", payload)
    if err != nil {
        return nil, fmt.Errorf("deploy failed: %w", err)
    }
    return resp, nil
}

// Bad
func deploy(id string) interface{} {
    // ...
}
```

### SQL Migrations

- Use descriptive names: `20240101120000_add_user_preferences.sql`
- Include both up and down migrations when possible
- Add RLS policies for new tables
- Test migrations locally before pushing

## Testing

### Running Tests

```bash
# All tests
bun test

# Specific app
bun run test:api
bun run test:dashboard

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage
```

### Writing Tests

- Test files: `*.test.ts` or `*.spec.ts`
- Co-locate tests with source files
- Use descriptive test names
- Test behavior, not implementation

```typescript
describe("ProjectService", () => {
  describe("create", () => {
    it("creates a project with valid input", async () => {
      const project = await projectService.create({
        name: "test-project",
        subdomain: "test-project",
      });

      expect(project.name).toBe("test-project");
      expect(project.id).toBeDefined();
    });

    it("throws on duplicate subdomain", async () => {
      await projectService.create({ subdomain: "taken" });

      await expect(
        projectService.create({ subdomain: "taken" }),
      ).rejects.toThrow("Subdomain already exists");
    });
  });
});
```

### CLI Tests (Go)

```bash
cd apps/cli
make cli.test
make cli.test.coverage
```

## Linting & Formatting

We use [Biome](https://biomejs.dev/) for TypeScript/JavaScript:

```bash
# Check
make all.check

# Fix
make all.check.fix

# Lint only
make all.lint

# Format only
make all.fmt
```

For Go:

```bash
cd apps/cli
make cli.lint
make cli.fmt
```

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass: `bun test`
- [ ] Linting passes: `make all.check`
- [ ] Types check: `make all.typecheck`
- [ ] Commit messages follow conventions
- [ ] Documentation updated if needed

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Automated checks run (tests, lint, types)
2. Maintainer reviews code
3. Address feedback
4. Maintainer approves and merges

## Reporting Bugs

### Before Reporting

1. Search existing issues
2. Try the latest version
3. Gather reproduction steps

### Bug Report Template

```markdown
## Description

Clear description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. ...

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: macOS 14.0
- Node: 20.10.0
- Bun: 1.0.20
- CLI version: 1.2.3
```

## Feature Requests

Open an issue with:

- Clear description of the feature
- Use case / motivation
- Proposed solution (optional)
- Alternatives considered (optional)

## Documentation

### Updating Docs

Documentation lives in `docs/`:

```
docs/
  architecture/    # System design
  api/             # API reference
  guides/          # User guides
  development/     # Developer docs
```

### Documentation Style

- Use clear, concise language
- Include code examples
- Keep sections focused
- Link to related docs

## Release Process

Releases are handled by maintainers:

1. Update version in relevant files
2. Update CHANGELOG.md
3. Create release tag
4. CI builds and publishes

## Getting Help

- Open an issue for bugs/features
- Check existing documentation
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Related Documentation

- [Development Setup](setup.md) - Local environment setup
- [Architecture Overview](../architecture/overview.md) - System design
- [API Reference](../api/reference.md) - API documentation
