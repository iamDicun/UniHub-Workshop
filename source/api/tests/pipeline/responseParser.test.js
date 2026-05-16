import { jest } from '@jest/globals';

const { responseParser } = await import(
  '../../src/services/pipeline/filters/responseParser.js'
);

describe('responseParser', () => {
  describe('valid JSON', () => {
    it('should parse complete valid response', async () => {
      const rawResponse = JSON.stringify({
        title: 'Workshop AI Cơ Bản',
        description: '<p>Học AI từ cơ bản</p>',
        capacity: 30,
        price: 50000,
        start_time: '2026-06-01T08:00:00.000Z',
        end_time: '2026-06-01T11:00:00.000Z',
        location: 'Phòng 402',
        speaker: 'TS. Nguyễn Văn A',
      });

      const result = await responseParser({ rawResponse }, {});
      expect(result.title).toBe('Workshop AI Cơ Bản');
      expect(result.description).toBe('<p>Học AI từ cơ bản</p>');
      expect(result.capacity).toBe(30);
      expect(result.price).toBe(50000);
      expect(result.start_time).toBe('2026-06-01T08:00:00.000Z');
      expect(result.end_time).toBe('2026-06-01T11:00:00.000Z');
      expect(result.location).toBe('Phòng 402');
      expect(result.speaker).toBe('TS. Nguyễn Văn A');
    });
  });

  describe('markdown fences', () => {
    it('should strip ```json fences', async () => {
      const rawResponse =
        '```json\n{"title":"Test","description":"Desc"}\n```';
      const result = await responseParser({ rawResponse }, {});
      expect(result.title).toBe('Test');
      expect(result.description).toBe('Desc');
    });

    it('should strip ``` fences without json tag', async () => {
      const rawResponse = '```\n{"title":"Test","description":"Desc"}\n```';
      const result = await responseParser({ rawResponse }, {});
      expect(result.title).toBe('Test');
    });
  });

  describe('default values', () => {
    it('should use default capacity 50 when missing', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(result.capacity).toBe(50);
    });

    it('should use default capacity 50 when invalid', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test","capacity":-5}' },
        {}
      );
      expect(result.capacity).toBe(50);
    });

    it('should use default capacity 50 when zero', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test","capacity":0}' },
        {}
      );
      expect(result.capacity).toBe(50);
    });

    it('should use default price 0 when missing', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(result.price).toBe(0);
    });

    it('should use default price 0 when negative', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test","price":-1000}' },
        {}
      );
      expect(result.price).toBe(0);
    });

    it('should generate default start_time when missing', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(new Date(result.start_time).getTime()).not.toBeNaN();
    });

    it('should generate default end_time when missing', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(new Date(result.end_time).getTime()).not.toBeNaN();
      expect(
        new Date(result.end_time) > new Date(result.start_time)
      ).toBe(true);
    });

    it('should use empty string for missing location', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(result.location).toBe('');
    });

    it('should use empty string for missing speaker', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test"}' },
        {}
      );
      expect(result.speaker).toBe('');
    });

    it('should default empty title to "Workshop Mới"', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":""}' },
        {}
      );
      expect(result.title).toBe('Workshop Mới');
    });

    it('should default missing title to "Workshop Mới"', async () => {
      const result = await responseParser(
        { rawResponse: '{}' },
        {}
      );
      expect(result.title).toBe('Workshop Mới');
    });
  });

  describe('date validation', () => {
    it('should fix end_time before start_time', async () => {
      const result = await responseParser(
        {
          rawResponse: JSON.stringify({
            title: 'Test',
            start_time: '2026-06-01T08:00:00.000Z',
            end_time: '2026-06-01T07:00:00.000Z',
          }),
        },
        {}
      );
      expect(
        new Date(result.end_time) > new Date(result.start_time)
      ).toBe(true);
    });

    it('should handle invalid date strings', async () => {
      const result = await responseParser(
        {
          rawResponse: JSON.stringify({
            title: 'Test',
            start_time: 'not-a-date',
          }),
        },
        {}
      );
      expect(new Date(result.start_time).getTime()).not.toBeNaN();
    });
  });

  describe('error handling', () => {
    it('should throw for empty response', async () => {
      await expect(responseParser({ rawResponse: '' }, {})).rejects.toThrow(
        'AI returned empty response'
      );
    });

    it('should throw for invalid JSON', async () => {
      await expect(
        responseParser({ rawResponse: 'not-json-at-all' }, {})
      ).rejects.toThrow('not valid JSON');
    });
  });

  describe('price handling', () => {
    it('should floor decimal capacity', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test","capacity":30.7}' },
        {}
      );
      expect(result.capacity).toBe(30);
    });

    it('should floor decimal price', async () => {
      const result = await responseParser(
        { rawResponse: '{"title":"Test","price":50000.99}' },
        {}
      );
      expect(result.price).toBe(50000);
    });

    it('should handle string numeric values', async () => {
      const result = await responseParser(
        {
          rawResponse:
            '{"title":"Test","capacity":"40","price":"100000"}',
        },
        {}
      );
      expect(result.capacity).toBe(40);
      expect(result.price).toBe(100000);
    });
  });
});
