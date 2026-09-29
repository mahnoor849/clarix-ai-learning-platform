export function highlightJava(code) {
  if (typeof code !== 'string') return code;
  
  // Escape HTML characters
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Match single-line comments and place a placeholder to protect them from further regex replacement
  const comments = [];
  html = html.replace(/(\/\/.*)/g, (match) => {
    const placeholder = `__COMMENT_PLACEHOLDER_${comments.length}__`;
    comments.push(match);
    return placeholder;
  });

  // Match string literals and place a placeholder
  const strings = [];
  html = html.replace(/(["'])(.*?)\1/g, (match) => {
    const placeholder = `__STRING_PLACEHOLDER_${strings.length}__`;
    strings.push(match);
    return placeholder;
  });

  // Highlight keywords
  html = html.replace(/\b(class|interface|extends|implements|public|private|protected|void|int|double|float|boolean|char|return|new|static|package|import|if|else|for|while|super|this|null|true|false)\b/g, '<span class="java-keyword">$1</span>');

  // Highlight annotations
  html = html.replace(/(@\w+)/g, '<span class="java-annotation">$1</span>');

  // Highlight numbers
  html = html.replace(/\b(\d+)\b/g, '<span class="java-number">$1</span>');

  // Highlight methods
  html = html.replace(/\b(\w+)(?=\()/g, '<span class="java-method">$1</span>');

  // Restore strings with syntax class
  html = html.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (_, index) => {
    return `<span class="java-string">${strings[parseInt(index)]}</span>`;
  });

  // Restore comments with syntax class
  html = html.replace(/__COMMENT_PLACEHOLDER_(\d+)__/g, (_, index) => {
    return `<span class="java-comment">${comments[parseInt(index)]}</span>`;
  });

  return html;
}
