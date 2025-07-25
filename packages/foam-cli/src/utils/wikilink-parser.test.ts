import { parseWikilinks, normalizeWikilinkTarget } from './wikilink-parser';

describe('parseWikilinks', () => {
  it('should parse simple wikilinks', () => {
    const content = 'This has [[link-one]] and [[link-two]] in it.';
    const result = parseWikilinks(content, 'test.md');
    
    expect(result.path).toBe('test.md');
    expect(result.links).toHaveLength(2);
    expect(result.links[0]).toEqual({
      raw: '[[link-one]]',
      target: 'link-one',
      alias: undefined,
      line: 1,
      column: 10,
    });
    expect(result.links[1]).toEqual({
      raw: '[[link-two]]',
      target: 'link-two',
      alias: undefined,
      line: 1,
      column: 27,
    });
  });

  it('should parse wikilinks with aliases', () => {
    const content = 'Link with [[target|displayed text]] alias.';
    const result = parseWikilinks(content, 'test.md');
    
    expect(result.links).toHaveLength(1);
    expect(result.links[0]).toEqual({
      raw: '[[target|displayed text]]',
      target: 'target',
      alias: 'displayed text',
      line: 1,
      column: 11,
    });
  });

  it('should handle multiple lines', () => {
    const content = `Line one has [[link-one]].
Line two has [[link-two]].
Line three has [[link-three]].`;
    const result = parseWikilinks(content, 'test.md');
    
    expect(result.links).toHaveLength(3);
    expect(result.links[0].line).toBe(1);
    expect(result.links[1].line).toBe(2);
    expect(result.links[2].line).toBe(3);
  });

  it('should handle no wikilinks', () => {
    const content = 'This has no wikilinks.';
    const result = parseWikilinks(content, 'test.md');
    
    expect(result.links).toHaveLength(0);
  });
});

describe('normalizeWikilinkTarget', () => {
  it('should remove .md extension', () => {
    expect(normalizeWikilinkTarget('page.md')).toBe('page');
    expect(normalizeWikilinkTarget('page.MD')).toBe('page');
  });

  it('should remove .mdx extension', () => {
    expect(normalizeWikilinkTarget('page.mdx')).toBe('page');
    expect(normalizeWikilinkTarget('page.MDX')).toBe('page');
  });

  it('should convert to lowercase', () => {
    expect(normalizeWikilinkTarget('MyPage')).toBe('mypage');
    expect(normalizeWikilinkTarget('UPPERCASE')).toBe('uppercase');
  });

  it('should replace spaces with hyphens', () => {
    expect(normalizeWikilinkTarget('My Page Name')).toBe('my-page-name');
    expect(normalizeWikilinkTarget('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('should handle combined transformations', () => {
    expect(normalizeWikilinkTarget('My Page.md')).toBe('my-page');
    expect(normalizeWikilinkTarget('Some File Name.MDX')).toBe('some-file-name');
  });
});