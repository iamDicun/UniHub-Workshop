import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockChatCompletions = {
  create: mockCreate,
};
const mockOpenAI = jest.fn(() => ({
  chat: { completions: mockChatCompletions },
}));
jest.unstable_mockModule('openai', () => ({
  default: mockOpenAI,
}));

const { aiSummarizer } = await import(
  '../../src/services/pipeline/filters/aiSummarizer.js'
);

describe('aiSummarizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DEEPSEEK_API_KEY = 'sk-test-key';
    process.env.DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
  });

  const validInput = {
    cleanedText: 'Nội dung workshop về AI và Machine Learning.',
    pageCount: 2,
    objectKey: 'users/1/docs/test.pdf',
  };

  describe('successful AI call', () => {
    it('should call DeepSeek API and return raw response', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: '{"title":"Workshop AI","description":"<p>Học AI</p>"}',
            },
          },
        ],
      });

      const result = await aiSummarizer(validInput, {});

      expect(result.rawResponse).toBe(
        '{"title":"Workshop AI","description":"<p>Học AI</p>"}'
      );
      expect(result.pageCount).toBe(2);
      expect(result.objectKey).toBe('users/1/docs/test.pdf');
    });

    it('should call the AI API successfully', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });

      await aiSummarizer(validInput, {});

      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('deepseek-chat');
    });

    it('should send correct model and parameters', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });

      await aiSummarizer(validInput, {});

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('deepseek-chat');
      expect(callArgs.temperature).toBe(0.3);
      expect(callArgs.max_tokens).toBe(4096);
    });

    it('should include system and user messages', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });

      await aiSummarizer(validInput, {});

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(2);
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[1].role).toBe('user');
      expect(callArgs.messages[1].content).toContain(
        'Nội dung workshop về AI và Machine Learning'
      );
    });
  });

  describe('error handling', () => {
    it('should throw for empty cleanedText', async () => {
      await expect(
        aiSummarizer({ ...validInput, cleanedText: '' }, {})
      ).rejects.toThrow('No text content');
    });

    it('should throw for whitespace-only cleanedText', async () => {
      await expect(
        aiSummarizer({ ...validInput, cleanedText: '   ' }, {})
      ).rejects.toThrow('No text content');
    });

    it('should propagate API errors', async () => {
      mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

      await expect(aiSummarizer(validInput, {})).rejects.toThrow(
        'API rate limit exceeded'
      );
    });

    it('should handle null message content', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const result = await aiSummarizer(validInput, {});
      expect(result.rawResponse).toBe('');
    });

    it('should handle missing choices', async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const result = await aiSummarizer(validInput, {});
      expect(result.rawResponse).toBe('');
    });
  });

  describe('prompt integration', () => {
    it('should include the workshop prompt template', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });

      await aiSummarizer(validInput, {});

      const userMessage = mockCreate.mock.calls[0][0].messages[1].content;
      expect(userMessage).toContain('trợ lý tạo workshop');
      expect(userMessage).toContain('"title"');
      expect(userMessage).toContain('NỘI DUNG TÀI LIỆU:');
    });
  });
});
