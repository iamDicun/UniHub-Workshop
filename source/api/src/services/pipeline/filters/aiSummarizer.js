import OpenAI from 'openai';
import { buildWorkshopPrompt } from '../prompts/workshopPrompt.js';

let _client = null;
const getClient = () => {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    });
  }
  return _client;
};

export const aiSummarizer = async (input, context) => {
  const { cleanedText, pageCount, objectKey } = input;

  if (!cleanedText || cleanedText.trim().length === 0) {
    throw new Error('No text content to summarize.');
  }

  const prompt = buildWorkshopPrompt(cleanedText);
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a workshop data extractor. Return ONLY valid JSON, no markdown, no explanations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const rawResponse = completion.choices[0]?.message?.content || '';

  return {
    rawResponse,
    pageCount,
    objectKey,
  };
};
