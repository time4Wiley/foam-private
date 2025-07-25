import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { parseWikilinks, normalizeWikilinkTarget, ParsedFile } from '../utils/wikilink-parser';

interface VerifyLinksOptions {
  path: string;
  extensions: string;
  json?: boolean;
  color?: boolean;
}

interface BrokenLink {
  source: string;
  target: string;
  line: number;
  column: number;
  raw: string;
}

interface VerificationResult {
  totalFiles: number;
  totalLinks: number;
  brokenLinks: BrokenLink[];
  workspacePath: string;
}

export async function verifyLinks(options: VerifyLinksOptions): Promise<void> {
  const workspacePath = path.resolve(options.path);
  const extensions = options.extensions.split(',').map(ext => ext.trim());
  
  // Check if workspace exists
  if (!fs.existsSync(workspacePath)) {
    console.error(chalk.red(`Error: Workspace path does not exist: ${workspacePath}`));
    process.exit(1);
  }

  // Find all markdown files
  const patterns = extensions.map(ext => `**/*.${ext}`);
  const files: string[] = [];
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: workspacePath,
      ignore: ['node_modules/**', '.git/**'],
    });
    files.push(...matches);
  }

  if (files.length === 0) {
    console.log(chalk.yellow(`No files found with extensions: ${extensions.join(', ')}`));
    return;
  }

  // Build a map of all existing files (normalized)
  const existingFiles = new Map<string, string>();
  for (const file of files) {
    const normalizedName = normalizeWikilinkTarget(path.basename(file, path.extname(file)));
    existingFiles.set(normalizedName, file);
    
    // Also store the file path without extension
    const fileWithoutExt = file.replace(/\.(md|mdx)$/i, '');
    existingFiles.set(normalizeWikilinkTarget(fileWithoutExt), file);
  }

  // Parse all files and collect wikilinks
  const parsedFiles: ParsedFile[] = [];
  for (const file of files) {
    const filePath = path.join(workspacePath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseWikilinks(content, file);
    if (parsed.links.length > 0) {
      parsedFiles.push(parsed);
    }
  }

  // Verify links
  const brokenLinks: BrokenLink[] = [];
  let totalLinks = 0;

  for (const parsedFile of parsedFiles) {
    for (const link of parsedFile.links) {
      totalLinks++;
      const normalizedTarget = normalizeWikilinkTarget(link.target);
      
      // Check if the target exists
      if (!existingFiles.has(normalizedTarget)) {
        brokenLinks.push({
          source: parsedFile.path,
          target: link.target,
          line: link.line,
          column: link.column,
          raw: link.raw,
        });
      }
    }
  }

  const result: VerificationResult = {
    totalFiles: files.length,
    totalLinks,
    brokenLinks,
    workspacePath,
  };

  // Output results
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    outputHumanReadable(result, options.color !== false);
  }

  // Exit with error code if broken links found
  if (brokenLinks.length > 0) {
    process.exit(1);
  }
}

function outputHumanReadable(result: VerificationResult, useColor: boolean): void {
  const format = (str: string | number, color?: 'gray' | 'cyan' | 'red' | 'green' | 'yellow' | 'dim') => {
    if (!useColor || !color) return String(str);
    return chalk[color](String(str));
  };
  
  const bold = (str: string) => useColor ? chalk.bold(str) : str;

  console.log(bold('\nFoam Link Verification Report'));
  console.log(format('─'.repeat(50), 'gray'));
  console.log(`Workspace: ${format(result.workspacePath, 'cyan')}`);
  console.log(`Files scanned: ${format(result.totalFiles, 'cyan')}`);
  console.log(`Total wikilinks: ${format(result.totalLinks, 'cyan')}`);
  console.log(`Broken links: ${result.brokenLinks.length > 0 ? format(result.brokenLinks.length, 'red') : format('0', 'green')}`);

  if (result.brokenLinks.length > 0) {
    console.log(format('\n─'.repeat(50), 'gray'));
    console.log(useColor ? chalk.bold.red('\nBroken Links:') : '\nBroken Links:');
    
    // Group broken links by source file
    const linksBySource = new Map<string, BrokenLink[]>();
    for (const link of result.brokenLinks) {
      if (!linksBySource.has(link.source)) {
        linksBySource.set(link.source, []);
      }
      linksBySource.get(link.source)?.push(link);
    }

    // Output broken links grouped by file
    for (const [source, links] of linksBySource) {
      console.log(format(`\n${source}:`, 'yellow'));
      for (const link of links) {
        console.log(`  ${format(`${link.line}:${link.column}`, 'gray')} ${format(link.raw, 'red')} → ${format(link.target, 'dim')}`);
      }
    }
  } else {
    console.log(useColor ? chalk.green.bold('\n✓ All wikilinks are valid!') : '\n✓ All wikilinks are valid!');
  }
  
  console.log('');
}