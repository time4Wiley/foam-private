# Foam CLI

Command-line interface for Foam knowledge management.

## Installation

```bash
# From the monorepo root
yarn install
yarn workspace foam-cli build

# Link globally
cd packages/foam-cli
npm link
```

## Usage

### Verify Wikilinks

Check for broken wikilinks in your Foam workspace:

```bash
foam verify-links [options]
```

Options:
- `-p, --path <path>`: Path to the workspace directory (default: current directory)
- `-e, --extensions <extensions>`: File extensions to check, comma-separated (default: "md,mdx")
- `--json`: Output results as JSON
- `--no-color`: Disable colored output

Examples:

```bash
# Check current directory
foam verify-links

# Check specific directory
foam verify-links -p ~/my-foam-notes

# Check only .md files
foam verify-links -e md

# Output as JSON for scripting
foam verify-links --json
```

The command will:
- Scan all markdown files in the workspace
- Parse wikilinks in the format `[[target]]` or `[[target|alias]]`
- Check if the target files exist
- Report any broken links with their location

Exit codes:
- 0: All links are valid
- 1: Broken links were found or an error occurred