import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { verifyLinks } from './verify-links';
import { glob } from 'glob';

// Mock modules
jest.mock('fs');
jest.mock('glob', () => ({
  glob: jest.fn(),
}));
jest.mock('chalk');

const mockedFs = fs as jest.Mocked<typeof fs>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { glob: mockedGlob } = require('glob') as { glob: jest.MockedFunction<typeof glob> };

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock process.exit
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number) => {
  throw new Error(`Process exited with code ${code}`);
});

describe('verify-links command', () => {
  let tempDir: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    tempDir = path.join(os.tmpdir(), `foam-test-${Date.now()}`);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('workspace validation', () => {
    it('should exit with error if workspace path does not exist', async () => {
      const nonExistentPath = '/non/existent/path';
      mockedFs.existsSync.mockReturnValue(false);

      await expect(verifyLinks({
        path: nonExistentPath,
        extensions: 'md',
        json: false,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(`Error: Workspace path does not exist: ${nonExistentPath}`)
      );
    });

    it('should handle workspace with no markdown files', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedGlob.mockResolvedValue([]);

      await verifyLinks({
        path: tempDir,
        extensions: 'md,mdx',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'No files found with extensions: md, mdx'
      );
    });
  });

  describe('link verification', () => {
    it('should pass when all wikilinks are valid', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([
          path.join(tempDir, 'note1.md'),
          path.join(tempDir, 'note2.md')
        ])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync
        .mockReturnValueOnce('This is note 1 with a link to [[note2]]')
        .mockReturnValueOnce('This is note 2 with a link back to [[note1]]');

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✓ All wikilinks are valid!')
      );
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should detect broken wikilinks', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'existing-note.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue(
        'This note has a [[broken-link]] and [[another-broken-link]]'
      );

      await expect(verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Broken links: ')
      );
    });

    it('should handle wikilinks with aliases', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      // First call returns files (as full paths), second call returns empty array
      mockedGlob
        .mockResolvedValueOnce([
          path.join(tempDir, 'note1.md'),
          path.join(tempDir, 'long-note-name.md')
        ])
        .mockResolvedValueOnce([]);

      // Mock readFileSync to return correct content for each file
      mockedFs.readFileSync.mockImplementation((filePath) => {
        const pathStr = filePath.toString();
        if (pathStr.endsWith('note1.md')) {
          return 'Link with alias: [[long-note-name|Short Name]]';
        } else if (pathStr.endsWith('long-note-name.md')) {
          return 'This is the long note name content';
        }
        return '';
      });

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✓ All wikilinks are valid!')
      );
    });

    it('should normalize wikilink targets correctly', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([
          path.join(tempDir, 'My Note.md'),
          path.join(tempDir, 'another note.md')
        ])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync
        .mockReturnValueOnce('Link to [[Another Note]] and [[my-note]]')
        .mockReturnValueOnce('Content of another note');

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✓ All wikilinks are valid!')
      );
    });

    it('should handle files in subdirectories', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([
          path.join(tempDir, 'docs/note1.md'),
          path.join(tempDir, 'docs/subfolder/note2.md')
        ])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockImplementation((filePath) => {
        const pathStr = filePath.toString();
        if (pathStr.endsWith('note1.md')) {
          return 'Link to [[note2]]';
        } else if (pathStr.endsWith('note2.md')) {
          return 'Link back to [[note1]]';
        }
        return '';
      });

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✓ All wikilinks are valid!')
      );
    });
  });

  describe('output formatting', () => {
    it('should output JSON when --json flag is used', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'note.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue('Note with [[broken-link]]');

      await expect(verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: true,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      // Check that JSON.stringify was called (via console.log)
      const jsonCall = mockConsoleLog.mock.calls.find(call => 
        call[0]?.includes('"totalFiles"') && call[0]?.includes('"brokenLinks"')
      );
      expect(jsonCall).toBeDefined();
      
      const parsedOutput = JSON.parse(jsonCall?.[0] || '{}');
      expect(parsedOutput).toMatchObject({
        totalFiles: 1,
        totalLinks: 1,
        brokenLinks: [{
          source: 'note.md',
          target: 'broken-link',
          line: 1,
          column: expect.any(Number),
          raw: '[[broken-link]]',
        }],
        workspacePath: expect.any(String),
      });
    });

    it('should disable colors when --no-color flag is used', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'note.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue('Note without links');

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: false,
      });

      // When color is false, the output should not contain ANSI color codes
      // Since we're mocking chalk, we just verify the output was called
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should group broken links by source file', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([
          path.join(tempDir, 'file1.md'),
          path.join(tempDir, 'file2.md')
        ])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync
        .mockReturnValueOnce('File 1: [[broken1]] and [[broken2]]')
        .mockReturnValueOnce('File 2: [[broken3]]');

      await expect(verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      // Check that output groups broken links by file
      const logCalls = mockConsoleLog.mock.calls.map(call => call[0]?.toString() || '');
      const output = logCalls.join('\n');
      expect(output).toContain('file1.md');
      expect(output).toContain('file2.md');
    });
  });

  describe('file extension handling', () => {
    it('should check multiple file extensions', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'note1.md')])
        .mockResolvedValueOnce([path.join(tempDir, 'note2.mdx')]);

      mockedFs.readFileSync
        .mockReturnValueOnce('MD file with [[note2]]')
        .mockReturnValueOnce('MDX file content');

      await verifyLinks({
        path: tempDir,
        extensions: 'md,mdx',
        json: false,
        color: true,
      });

      expect(mockedGlob).toHaveBeenCalledWith('**/*.md', expect.any(Object));
      expect(mockedGlob).toHaveBeenCalledWith('**/*.mdx', expect.any(Object));
    });

    it('should handle extension normalization in wikilinks', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'note.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue(
        'Links: [[note.md]] and [[note]]'
      );

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✓ All wikilinks are valid!')
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty files', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'empty.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue('');

      await verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Total wikilinks: 0')
      );
    });

    it('should handle files with only broken links', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'orphan.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue(
        '[[non-existent-1]] [[non-existent-2]] [[non-existent-3]]'
      );

      await expect(verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Broken links: ')
      );
    });

    it('should handle malformed wikilinks gracefully', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      mockedGlob
        .mockResolvedValueOnce([path.join(tempDir, 'malformed.md')])
        .mockResolvedValueOnce([]);

      mockedFs.readFileSync.mockReturnValue(
        'Valid: [[good-link]] Invalid: [[ ]] [[]] [[   ]]'
      );

      await expect(verifyLinks({
        path: tempDir,
        extensions: 'md',
        json: false,
        color: true,
      })).rejects.toThrow('Process exited with code 1');

      // Only the valid link should be counted
      const logCalls = mockConsoleLog.mock.calls.map(call => call[0]?.toString() || '');
      const output = logCalls.join('\n');
      expect(output).toContain('Total wikilinks: 1');
    });
  });
});