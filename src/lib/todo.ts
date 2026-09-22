const PREFIX = "TODO:";

export function isTodo(value: string): boolean {
  return value.startsWith(PREFIX);
}

/** The placeholder text with the `TODO:` prefix stripped, ready to show inside a mark. */
export function todoText(value: string): string {
  return isTodo(value) ? value.slice(PREFIX.length).trim() : value;
}
