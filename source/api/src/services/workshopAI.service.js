import { getFileById, updateFileStatus } from '../repositories/files.repository.js';
import Pipeline from './pipeline/Pipeline.js';
import { pdfExtractor } from './pipeline/filters/pdfExtractor.js';
import { textCleaner } from './pipeline/filters/textCleaner.js';
import { aiSummarizer } from './pipeline/filters/aiSummarizer.js';
import { responseParser } from './pipeline/filters/responseParser.js';

/**
 * Run the Pipe-Filter pipeline to generate workshop data from a PDF.
 *
 * Flow: fileId → lookup S3 key → download PDF → extract text →
 *       clean text → AI summarize → parse JSON → return structured data
 */
export const aiGenerateWorkshop = async (fileId, userId) => {
  // 1. Look up file record
  const file = await getFileById(fileId);
  if (!file) {
    throw Object.assign(new Error('File not found.'), { statusCode: 404 });
  }
  if (file.user_id !== userId) {
    throw Object.assign(new Error('Unauthorized access to file.'), { statusCode: 403 });
  }
  if (file.status === 'failed') {
    throw Object.assign(new Error('File upload previously failed.'), { statusCode: 400 });
  }
  if (file.mime_type !== 'application/pdf') {
    throw Object.assign(new Error('File must be a PDF.'), { statusCode: 400 });
  }

  // 2. Mark as processing
  await updateFileStatus(fileId, 'processing');

  try {
    // 3. Build and run the pipeline
    const pipeline = new Pipeline();
    pipeline
      .use(pdfExtractor, 'PDF Text Extractor')
      .use(textCleaner, 'Text Cleaner')
      .use(aiSummarizer, 'AI Summarizer (DeepSeek)')
      .use(responseParser, 'Response Parser')
      .setContext({ objectKey: file.object_key, maxChars: 12000 });

    const result = await pipeline.run({ objectKey: file.object_key });

    // 4. Mark as done
    await updateFileStatus(fileId, 'done');

    return result;
  } catch (error) {
    // 5. Mark as failed on error
    await updateFileStatus(fileId, 'failed').catch(() => {});
    throw error;
  }
};
