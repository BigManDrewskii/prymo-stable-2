/**
 * Simple markdown formatter that converts text to HTML with basic markdown rules
 * 
 * Handles:
 * - Bold: **text** or __text__ -> <strong>text</strong>
 * - Italic: *text* or _text_ -> <em>text</em>
 * - Headers: # Heading -> <h1>Heading</h1>
 * - Lists: - item -> <ul><li>item</li></ul>
 * - Code: `code` -> <code>code</code>
 * - Links: [text](url) -> <a href="url">text</a>
 * - Line breaks: \n\n -> <p>
 */

export function formatMarkdown(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Convert line breaks to paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Headers (h1, h2, h3)
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Unordered lists
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)(?!\n<li>)/gs, '<ul>$1</ul>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}
