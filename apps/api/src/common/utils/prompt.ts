export function inTag(tag: string, content: string) {
  return `<${tag}>
  ${content}
  </${tag}`;
}
