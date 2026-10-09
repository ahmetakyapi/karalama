/**
 * Glue the last two words with a no-break space so a line never ends with a
 * single orphaned word — a fallback for browsers without `text-wrap: pretty`.
 */
export function noWidow(text: string) {
  const i = text.lastIndexOf(' ');
  return i > 0 ? `${text.slice(0, i)} ${text.slice(i + 1)}` : text;
}
