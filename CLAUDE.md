# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Foam is a personal knowledge management and sharing system built as a VS Code extension. It provides features like wikilinks, graph visualization, and note templates to create a connected knowledge base using Markdown files.

## Development Commands

### Setup and Build
```bash
# Install dependencies (uses Yarn workspaces)
yarn install

# Build all packages
yarn build

# Watch mode for development
yarn watch

# Clean build artifacts
yarn clean

# Full reset (clean + build)
yarn reset
```

### Testing
```bash
# Run all tests
yarn test

# Run only unit tests (.test.ts files)
yarn workspace foam-vscode test:unit

# Run only integration/E2E tests (.spec.ts files) 
yarn workspace foam-vscode test:e2e

# Run specific test file
yarn workspace foam-vscode test:unit -- <filename>
```

### Linting and Code Quality
```bash
# Run linter
yarn lint

# Format code (uses Prettier config in package.json)
yarn workspace foam-vscode format
```

### Extension Development
```bash
# Package the extension as .vsix
yarn package-extension

# Install extension from .vsix
yarn install-extension

# Publish to marketplace
yarn publish-extension
```

### CLI Development
```bash
# Build the CLI package
yarn workspace foam-cli build

# Run tests
yarn workspace foam-cli test

# Publish to npm (requires OTP)
./scripts/publish-foam-cli.sh

# Test CLI commands locally
node packages/foam-cli/dist/index.js verify-links
```

## Architecture Overview

### Monorepo Structure
- **packages/foam-vscode**: Main VS Code extension
- **packages/foam-cli**: Command-line interface for Foam operations
- Uses Yarn workspaces with Lerna for monorepo management
- Node.js >= 18 required

### Core Components (packages/foam-vscode/src/core)
- **model/**: Data models (FoamWorkspace, FoamGraph, Resource, URI)
- **services/**: Core services (ResourceParser, DataStore, MarkdownProvider)
- **janitor/**: Code maintenance features (Janitor, Recycler, Watchdog)
- **utils/**: Utility functions

### VS Code Integration (packages/foam-vscode/src)
- **features/**: VS Code specific features and commands
- **services/**: VS Code service layer
- **extension.ts**: Main entry point

### Key Design Patterns
1. **Resource-based architecture**: Everything is a Resource (note, attachment, placeholder)
2. **Graph-based connections**: Uses FoamGraph to track relationships
3. **Provider pattern**: Different providers for markdown, attachments, etc.
4. **Event-driven updates**: Workspace changes trigger graph updates

## Testing Conventions

### Test File Organization
- **Unit tests** (`.test.ts`): Pure Jest tests without VS Code APIs
- **Integration tests** (`.spec.ts`): Tests requiring VS Code environment
- Tests are colocated with source files

### Running Tests in Development
```bash
# For unit tests during development
yarn workspace foam-vscode test:unit -- --watch

# Debug tests in VS Code
# Use "Jest: Unit Tests" launch configuration
```

## Common Development Tasks

### Adding a New Feature
1. Create feature in `src/features/`
2. Register in `src/extension.ts`
3. Add tests following naming conventions
4. Update package.json if adding commands/settings

### Working with the Graph
```typescript
// Access the workspace and graph
const workspace = foamWorkspace; 
const graph = workspace.graph;

// Find connections
const connections = graph.getConnections(resourceUri);
```

### Parsing Markdown with Wikilinks
```typescript
// Use ResourceParser for consistent parsing
const parser = ResourceParser.make();
const resource = await parser.parse(uri, fileContent);
```

## Important Constraints

1. **No direct fs module**: Use VS Code workspace API for file operations
2. **URI handling**: Always use FoamUri utility for cross-platform compatibility  
3. **Async patterns**: Most operations are async, handle properly
4. **Extension context**: Many features require VS Code extension context

## Debugging

### VS Code Launch Configurations
- **Run Extension**: Launch extension in new VS Code window
- **Jest: Unit Tests**: Debug unit tests
- **Jest: E2E Tests**: Debug integration tests

### Common Issues
- **Module not found**: Run `yarn build` first
- **Test failures**: Check if running unit vs integration test correctly
- **Graph not updating**: Check Watchdog and event listeners

## Key Dependencies
- **markdown-it**: Markdown parsing
- **remark**: Additional markdown processing
- **lodash**: Utility functions
- **gray-matter**: Frontmatter parsing
- **dateformat**: Date formatting for daily notes