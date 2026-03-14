export function trimNL(text: string) {
  return text.replace(/^\n+|\n+$/g, '');
}
