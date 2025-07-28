/* eslint-disable jest/no-standalone-expect */
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('foam-template verification integration test', () => {
  const foamCliPath = path.resolve(__dirname, '../../dist/index.js');
  const foamTemplatePath = path.resolve(__dirname, '../../../../../foam-template');

  // Skip these tests in CI if foam-template doesn't exist
  const conditionalTest = fs.existsSync(foamTemplatePath) ? it : it.skip;

  conditionalTest('should detect broken links in foam-template directory', () => {
    let output: string;
    let exitCode = 0;

    try {
      output = execSync(
        `node ${foamCliPath} verify-links --path ${foamTemplatePath} --json`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      // Command exits with code 1 when broken links are found
      const execError = error as { stdout: string; status: number };
      output = execError.stdout;
      exitCode = execError.status;
    }

    const result = JSON.parse(output);

    // Verify the structure of the result
    expect(result).toHaveProperty('totalFiles');
    expect(result).toHaveProperty('totalLinks');
    expect(result).toHaveProperty('brokenLinks');
    expect(result).toHaveProperty('workspacePath');

    // Based on current state, we expect broken links
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.totalLinks).toBeGreaterThan(0);
    
    // Document the broken links for fixing
    if (result.brokenLinks.length > 0) {
      console.log(`Found ${result.brokenLinks.length} broken links in foam-template`);
      
      // Group by source file for easier fixing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const brokenByFile = result.brokenLinks.reduce((acc: any, link: any) => {
        if (!acc[link.source]) {
          acc[link.source] = [];
        }
        acc[link.source].push(link);
        return acc;
      }, {});

      // Log summary of broken links
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(brokenByFile).forEach(([file, links]: [string, any]) => {
        console.log(`\n${file}: ${links.length} broken links`);
      });
    }

    // The test should fail if there are broken links (exitCode should be 1)
    expect(exitCode).toBe(result.brokenLinks.length > 0 ? 1 : 0);
  });

  conditionalTest('should verify specific known issues in foam-template', () => {
    let output: string;

    try {
      output = execSync(
        `node ${foamCliPath} verify-links --path ${foamTemplatePath} --json`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      const execError = error as { stdout: string };
      output = execError.stdout;
    }

    const result = JSON.parse(output);

    // With the improved logic, example links like MediaWiki and placeholder are now filtered out
    // These are links that point to files that exist in the main docs but not in foam-template
    const expectedExternalLinks = [
      { source: 'docs/frequently-asked-questions.md', target: 'foam-file-format' },
      { source: 'docs/features/backlinking.md', target: 'materialized-backlinks' },
      { source: 'docs/features/backlinking.md', target: 'roadmap' },
      { source: 'docs/publishing/publish-to-github-pages.md', target: 'good-first-task' },
      { source: 'docs/recipes/recipes.md', target: 'contribution-guide' },
    ];

    // Some of these might still be detected as broken because they reference
    // files that exist in the main Foam docs but not in foam-template
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const externalReferences = result.brokenLinks.filter((link: any) => 
      expectedExternalLinks.some(expected => 
        link.target === expected.target
      )
    );

    console.log(`Found ${externalReferences.length} external documentation references`);
    
    // The improved logic should filter out example links
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exampleLinks = result.brokenLinks.filter((link: any) => 
      ['MediaWiki', 'placeholder', 'wikilink', 'note-a', 'note-b'].includes(link.target)
    );
    
    expect(exampleLinks.length).toBe(0);
  });

  conditionalTest('should handle different output formats correctly', () => {
    // Test human-readable output
    let humanOutput: string;
    try {
      humanOutput = execSync(
        `node ${foamCliPath} verify-links --path ${foamTemplatePath}`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      const execError = error as { stdout: string; stderr: string };
      humanOutput = execError.stdout + execError.stderr;
    }

    expect(humanOutput).toContain('Foam Link Verification Report');
    expect(humanOutput).toContain('Files scanned:');
    expect(humanOutput).toContain('Total wikilinks:');
    expect(humanOutput).toContain('Broken links:');

    // Test no-color output
    let noColorOutput: string;
    try {
      noColorOutput = execSync(
        `node ${foamCliPath} verify-links --path ${foamTemplatePath} --no-color`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      const execError = error as { stdout: string; stderr: string };
      noColorOutput = execError.stdout + execError.stderr;
    }

    // The no-color output should exist without ANSI color codes
    expect(noColorOutput).toBeTruthy();
    expect(noColorOutput).not.toContain('\x1b['); // No ANSI escape codes
  });

  conditionalTest('should correctly identify file extensions', () => {
    let output: string;

    try {
      output = execSync(
        `node ${foamCliPath} verify-links --path ${foamTemplatePath} --extensions md,mdx --json`,
        { encoding: 'utf8' }
      );
    } catch (error) {
      const execError = error as { stdout: string };
      output = execError.stdout;
    }

    const result = JSON.parse(output);
    
    // Foam template should have .md files
    expect(result.totalFiles).toBeGreaterThan(0);
  });
});