# Foam Tech Stack Analysis

## Project Overview
Foam is a personal knowledge management and sharing system inspired by Roam Research, built as a VS Code extension. It enables users to create interconnected notes with wiki-style linking, graph visualization, and publishing capabilities.

## Architecture

### Monorepo Structure
- **Lerna**: Version management and package orchestration
- **Yarn Workspaces**: Package management and dependency resolution
- **Structure**: Monorepo with packages in `packages/` directory
  - Main package: `foam-vscode` (VS Code extension)

## Core Technologies

### Runtime & Platform
- **Node.js**: >=18 (specified in engines)
- **VS Code Extension Platform**: Target VS Code ^1.96.0
- **TypeScript**: ^4.9.5 with ES2019 target
- **JavaScript Bundling**: ESBuild for both Node.js and Web platforms

### Package Management
- **Yarn**: Primary package manager
- **Lerna**: ^6.4.1 for monorepo management
- **Workspaces**: Enabled for dependency management

### Development Languages
- **TypeScript**: Primary development language (ES2019 target)
- **JavaScript**: For build scripts and configuration
- **JSON**: Configuration files
- **Markdown**: Documentation and content format

## VS Code Extension Architecture

### Extension Capabilities
- **Multi-platform**: Supports both Node.js and Web environments
- **Bundle Strategy**: 
  - Node bundle: `./out/bundles/extension-node.js`
  - Web bundle: `./out/bundles/extension-web.js`

### Core Dependencies

#### Markdown Processing
- **unified**: ^9.0.0 - Markdown processing pipeline
- **remark-parse**: ^8.0.2 - Markdown parser
- **remark-frontmatter**: ^2.0.0 - Front matter support
- **remark-wiki-link**: ^0.0.4 - Wiki-style link parsing
- **markdown-it**: ^12.0.4 - Alternative markdown processor
- **gray-matter**: ^4.0.2 - Front matter extraction

#### Utility Libraries
- **lodash**: ^4.17.21 - Utility functions
- **dateformat**: 4.5.1 - Date formatting
- **github-slugger**: ^1.4.0 - URL slug generation
- **title-case**: ^3.0.2 - Text case conversion
- **yaml**: ^2.2.2 - YAML parsing
- **js-sha1**: ^0.7.0 - SHA1 hashing

#### Data Structures & Performance
- **mnemonist**: ^0.39.8 - Efficient data structures
- **lru-cache**: ^7.14.1 - LRU caching implementation
- **detect-newline**: ^3.1.0 - Newline detection

#### File System & Path Handling
- **path-browserify**: ^1.0.1 - Path utilities for web
- **micromatch**: ^4.0.2 - Glob pattern matching

## Development Tools

### Build System
- **ESBuild**: ^0.17.7 - Fast JavaScript bundler
- **esbuild-plugin-polyfill-node**: ^0.3.0 - Node.js polyfills for web

### Testing Framework
- **Jest**: ^29.6.2 - Primary testing framework
- **jest-extended**: ^3.2.3 - Additional Jest matchers
- **ts-jest**: ^29.1.1 - TypeScript support for Jest
- **wait-for-expect**: ^3.0.2 - Async testing utilities
- **@vscode/test-web**: ^0.0.62 - VS Code web testing

### Code Quality
- **ESLint**: ^8.33.0 with TypeScript support
  - **@typescript-eslint/eslint-plugin**: ^5.51.0
  - **@typescript-eslint/parser**: ^5.51.0
  - **eslint-plugin-import**: ^2.27.5
  - **eslint-plugin-jest**: ^27.2.1
- **dts-cli**: ^1.6.3 - TypeScript declaration generation
- **Prettier**: Integrated code formatting
- **Husky**: ^4.2.5 - Git hooks (pre-commit linting)

### Development Workflow
- **nodemon**: ^3.1.7 - File watching and auto-restart
- **rimraf**: ^3.0.2 - Cross-platform file removal
- **vscode-test**: ^1.3.0 - VS Code extension testing

## Documentation & Publishing

### Documentation Site
- **Jekyll**: Static site generator (Ruby-based)
- **GitHub Pages**: Documentation hosting
- **Google Analytics**: UA-171027939-1

### Extension Publishing
- **vsce**: VS Code extension packaging and publishing
- **ovsx**: Open VSX Registry publishing
- **VS Code Marketplace**: Primary distribution

## Data Visualization
- **D3.js**: v6 - Data visualization for graph features
- **Force Graph**: 1.49.5 - Interactive network graphs
- **dat.GUI**: Interactive controls for graph visualization

## Configuration Management
- **JSON Schema**: Configuration validation
- **YAML**: Configuration files
- **TypeScript Paths**: Module resolution mapping

## Security & Performance Features
- **Untrusted Workspaces**: Limited support with expression restrictions
- **LRU Caching**: Performance optimization
- **Efficient Data Structures**: Via mnemonist library
- **Bundle Splitting**: Separate Node.js and Web bundles

## Integration Points
- **VS Code API**: Extension host integration
- **File System**: Cross-platform file operations
- **Git**: Version control integration (implicitly supported)
- **Web Platform**: Browser compatibility for web extension

## Development Standards
- **TypeScript Strict Mode**: Type safety
- **CommonJS Modules**: Node.js compatibility
- **ES2019 Target**: Modern JavaScript features
- **Declaration Maps**: Source mapping for TypeScript
- **Comprehensive Testing**: Unit and E2E test suites

## Deployment Pipeline
- **Lerna Versioning**: Coordinated package releases
- **Automated Testing**: Pre-commit hooks
- **Multi-platform Builds**: Node.js and Web bundles
- **Extension Marketplace**: VS Code and Open VSX publishing