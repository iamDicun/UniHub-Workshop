import { getS3ReadStream } from '../../s3.service.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Filter 1: PDF Text Extractor
 *
 * Downloads a PDF from S3 using the object key, buffers the stream,
 * and extracts raw text content.
 *
 * Input:  { objectKey: string }
 * Output: { rawText: string, pageCount: number, objectKey: string }
 */
export const pdfExtractor = async (input, context) => {
  const objectKey = input.objectKey || context.objectKey;
  if (!objectKey) {
    throw new Error('Missing objectKey for PDF extraction');
  }

  const stream = await getS3ReadStream(objectKey);

  // Buffer the entire stream
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Parse PDF
  const data = await pdfParse(buffer);

  return {
    rawText: data.text,
    pageCount: data.numpages,
    objectKey,
  };
};
