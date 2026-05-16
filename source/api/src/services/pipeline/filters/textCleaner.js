/**
 * Filter 2: Text Cleaner
 *
 * Normalizes extracted PDF text:
 * - Collapses multiple whitespace/newlines
 * - Removes repeated PDF header/footer artifacts
 * - Strips non-content lines (page numbers, etc.)
 * - Handles Vietnamese character encoding
 * - Truncates to maxChars to control token usage
 *
 * Input:  { rawText: string, pageCount: number, objectKey: string }
 * Output: { cleanedText: string, pageCount: number, objectKey: string, originalLength: number }
 */

const MAX_CHARS = 12000; // ~3000 tokens for DeepSeek

const isLikelyNoise = (line) => {
  const trimmed = line.trim();
  if (!trimmed) return true;
  // Page numbers
  if (/^\d{1,4}$/.test(trimmed)) return true;
  // Common header/footer patterns
  if (/^(Page|Trang)\s+\d+/i.test(trimmed)) return true;
  // Very short lines that look like running headers
  if (trimmed.length < 3 && /^[A-Z0-9/\-|•]+$/.test(trimmed)) return true;
  return false;
};

export const textCleaner = async (input, context) => {
  const { rawText, pageCount, objectKey } = input;
  const maxChars = context.maxChars || MAX_CHARS;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('PDF contains no extractable text. It may be a scanned document.');
  }

  // Split into lines and filter noise
  const lines = rawText.split(/\r?\n/);
  const meaningfulLines = [];

  for (const line of lines) {
    if (!isLikelyNoise(line)) {
      meaningfulLines.push(line.trim());
    }
  }

  // Join with single newlines, collapse multiple spaces
  let cleaned = meaningfulLines
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')   // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')   // collapse excessive newlines
    .replace(/\f/g, '\n')         // form feed → newline
    .trim();

  const originalLength = cleaned.length;

  // Truncate if too long (keep beginning and end for context)
  if (cleaned.length > maxChars) {
    const half = Math.floor(maxChars / 2);
    cleaned = cleaned.slice(0, half) + '\n\n...(nội dung đã rút gọn)...\n\n' + cleaned.slice(-half);
  }

  return {
    cleanedText: cleaned,
    pageCount,
    objectKey,
    originalLength,
  };
};
