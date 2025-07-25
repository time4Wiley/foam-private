export interface WikiLink {
  raw: string;
  target: string;
  alias?: string;
  line: number;
  column: number;
}

export interface ParsedFile {
  path: string;
  links: WikiLink[];
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

export function parseWikilinks(content: string, filePath: string): ParsedFile {
  const links: WikiLink[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    let match;
    WIKILINK_REGEX.lastIndex = 0;
    
    while ((match = WIKILINK_REGEX.exec(line)) !== null) {
      const raw = match[0];
      const target = match[1].trim();
      const alias = match[3]?.trim();
      
      links.push({
        raw,
        target,
        alias,
        line: lineIndex + 1,
        column: match.index + 1,
      });
    }
  });

  return {
    path: filePath,
    links,
  };
}

export function normalizeWikilinkTarget(target: string): string {
  // Remove file extension if present
  const withoutExt = target.replace(/\.(md|mdx)$/i, '');
  
  // Convert to lowercase and replace spaces with hyphens
  // This matches common Foam behavior
  return withoutExt
    .toLowerCase()
    .replace(/\s+/g, '-');
}