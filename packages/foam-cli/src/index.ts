#!/usr/bin/env node

import { Command } from 'commander';
import { verifyLinks } from './commands/verify-links';

const program = new Command();

program
  .name('foam')
  .description('CLI tool for Foam knowledge management')
  .version('0.1.0');

program
  .command('verify-links')
  .description('Verify wikilinks in a Foam workspace')
  .option('-p, --path <path>', 'Path to the workspace directory', process.cwd())
  .option('-e, --extensions <extensions>', 'File extensions to check (comma-separated)', 'md,mdx')
  .option('--json', 'Output results as JSON')
  .option('--no-color', 'Disable colored output')
  .action(verifyLinks);

program.parse();