import { jest } from '@jest/globals';

const { textCleaner } = await import(
  '../../src/services/pipeline/filters/textCleaner.js'
);

describe('textCleaner', () => {
  describe('basic cleaning', () => {
    it('should trim whitespace', async () => {
      const result = await textCleaner(
        { rawText: '  hello world  ', pageCount: 1, objectKey: 'test.pdf' },
        {}
      );
      expect(result.cleanedText).toBe('hello world');
    });

    it('should collapse multiple spaces into single space', async () => {
      const result = await textCleaner(
        { rawText: 'hello    world    test', pageCount: 1, objectKey: 'test.pdf' },
        {}
      );
      expect(result.cleanedText).toBe('hello world test');
    });

    it('should collapse excessive newlines', async () => {
      const result = await textCleaner(
        {
          rawText: 'line1\n\n\n\n\nline2',
          pageCount: 1,
          objectKey: 'test.pdf',
        },
        {}
      );
      // Empty lines are removed by noise filter, so only one newline remains
      expect(result.cleanedText).toBe('line1\nline2');
    });

    it('should replace form feed with newline', async () => {
      const result = await textCleaner(
        { rawText: 'page1\fpage2', pageCount: 2, objectKey: 'test.pdf' },
        {}
      );
      expect(result.cleanedText).toBe('page1\npage2');
    });
  });

  describe('noise removal', () => {
    it('should remove standalone page numbers', async () => {
      const result = await textCleaner(
        {
          rawText: 'Chapter 1\n42\nContent here\n43\n',
          pageCount: 2,
          objectKey: 'test.pdf',
        },
        {}
      );
      expect(result.cleanedText).not.toContain('42');
      expect(result.cleanedText).not.toContain('43');
      expect(result.cleanedText).toContain('Chapter 1');
      expect(result.cleanedText).toContain('Content here');
    });

    it('should remove "Page X" headers', async () => {
      const result = await textCleaner(
        {
          rawText: 'Page 1\nReal content\nPage 2\nMore content',
          pageCount: 2,
          objectKey: 'test.pdf',
        },
        {}
      );
      expect(result.cleanedText).not.toContain('Page 1');
      expect(result.cleanedText).not.toContain('Page 2');
      expect(result.cleanedText).toContain('Real content');
      expect(result.cleanedText).toContain('More content');
    });

    it('should remove very short uppercase-only lines', async () => {
      const result = await textCleaner(
        {
          rawText: 'AB\nReal content here\nCD',
          pageCount: 1,
          objectKey: 'test.pdf',
        },
        {}
      );
      expect(result.cleanedText).not.toContain('AB');
      expect(result.cleanedText).not.toContain('CD');
      expect(result.cleanedText).toContain('Real content here');
    });
  });

  describe('Vietnamese text', () => {
    it('should preserve Vietnamese characters', async () => {
      const result = await textCleaner(
        {
          rawText:
            '  Hội thảo "Kỹ năng lãnh đạo" sẽ diễn ra tại Phòng 402  ',
          pageCount: 1,
          objectKey: 'test.pdf',
        },
        {}
      );
      expect(result.cleanedText).toBe(
        'Hội thảo "Kỹ năng lãnh đạo" sẽ diễn ra tại Phòng 402'
      );
    });

    it('should handle multi-paragraph Vietnamese', async () => {
      const input = {
        rawText:
          'Giới thiệu về workshop\n\nĐây là workshop về AI và Machine Learning.\n\nDiễn giả: TS. Nguyễn Văn A',
        pageCount: 1,
        objectKey: 'test.pdf',
      };
      const result = await textCleaner(input, {});
      expect(result.cleanedText).toContain('Giới thiệu về workshop');
      expect(result.cleanedText).toContain('AI và Machine Learning');
      expect(result.cleanedText).toContain('TS. Nguyễn Văn A');
    });
  });

  describe('empty input', () => {
    it('should throw for empty rawText', async () => {
      await expect(
        textCleaner(
          { rawText: '', pageCount: 1, objectKey: 'test.pdf' },
          {}
        )
      ).rejects.toThrow('PDF contains no extractable text');
    });

    it('should throw for whitespace-only rawText', async () => {
      await expect(
        textCleaner(
          { rawText: '   \n  \n  ', pageCount: 1, objectKey: 'test.pdf' },
          {}
        )
      ).rejects.toThrow('PDF contains no extractable text');
    });
  });

  describe('truncation', () => {
    it('should truncate text exceeding maxChars', async () => {
      const longText = 'a'.repeat(15000);
      const result = await textCleaner(
        { rawText: longText, pageCount: 1, objectKey: 'test.pdf' },
        { maxChars: 1000 }
      );
      expect(result.cleanedText.length).toBeLessThanOrEqual(1100); // with truncation note
      expect(result.cleanedText).toContain('nội dung đã rút gọn');
    });

    it('should not truncate text within limit', async () => {
      const shortText = 'Hello world. '.repeat(20);
      const result = await textCleaner(
        { rawText: shortText, pageCount: 1, objectKey: 'test.pdf' },
        {}
      );
      expect(result.cleanedText).not.toContain('nội dung đã rút gọn');
      expect(result.originalLength).toBeLessThanOrEqual(12000);
    });
  });

  describe('metadata preservation', () => {
    it('should pass through pageCount and objectKey', async () => {
      const result = await textCleaner(
        { rawText: 'content', pageCount: 7, objectKey: 'users/1/docs/x.pdf' },
        {}
      );
      expect(result.pageCount).toBe(7);
      expect(result.objectKey).toBe('users/1/docs/x.pdf');
    });

    it('should record originalLength', async () => {
      const result = await textCleaner(
        { rawText: 'Some content here', pageCount: 1, objectKey: 't.pdf' },
        {}
      );
      expect(result.originalLength).toBeGreaterThan(0);
    });
  });
});
