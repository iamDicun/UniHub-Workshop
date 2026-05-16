import { jest } from '@jest/globals';

const mockGetS3ReadStream = jest.fn();
jest.unstable_mockModule('../../src/services/s3.service.js', () => ({
  getS3ReadStream: mockGetS3ReadStream,
}));

const mockPdfParseFn = jest.fn();
const mockRequire = jest.fn(() => mockPdfParseFn);
jest.unstable_mockModule('module', () => ({
  createRequire: jest.fn(() => mockRequire),
}));

const { pdfExtractor } = await import(
  '../../src/services/pipeline/filters/pdfExtractor.js'
);

describe('pdfExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockStream = (chunks) => {
    let index = 0;
    return {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            if (index < chunks.length) {
              return { value: chunks[index++], done: false };
            }
            return { done: true };
          },
        };
      },
    };
  };

  describe('successful extraction', () => {
    it('should extract text from a PDF', async () => {
      const stream = createMockStream([
        Buffer.from('%PDF-1.4'),
        Buffer.from(' fake pdf content '),
      ]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockResolvedValue({
        text: 'Nội dung workshop về AI',
        numpages: 3,
      });

      const result = await pdfExtractor(
        { objectKey: 'users/1/docs/test.pdf' },
        {}
      );

      expect(result.rawText).toBe('Nội dung workshop về AI');
      expect(result.pageCount).toBe(3);
      expect(result.objectKey).toBe('users/1/docs/test.pdf');
      expect(mockGetS3ReadStream).toHaveBeenCalledWith(
        'users/1/docs/test.pdf'
      );
      expect(mockPdfParseFn).toHaveBeenCalled();
    });

    it('should buffer multiple stream chunks', async () => {
      const stream = createMockStream([
        Buffer.from('%PDF'),
        Buffer.from('-1.4'),
        Buffer.from(' content '),
      ]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockImplementation(async (buffer) => ({
        text: `Parsed ${buffer.length} bytes`,
        numpages: 1,
      }));

      const result = await pdfExtractor(
        { objectKey: 'test.pdf' },
        {}
      );

      expect(result.rawText).toContain('Parsed');
      expect(result.rawText).toContain('17');
    });
  });

  describe('object key resolution', () => {
    it('should use objectKey from input', async () => {
      const stream = createMockStream([Buffer.from('pdf')]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockResolvedValue({ text: 'ok', numpages: 1 });

      await pdfExtractor({ objectKey: 'from-input.pdf' }, {});
      expect(mockGetS3ReadStream).toHaveBeenCalledWith('from-input.pdf');
    });

    it('should use objectKey from context if not in input', async () => {
      const stream = createMockStream([Buffer.from('pdf')]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockResolvedValue({ text: 'ok', numpages: 1 });

      await pdfExtractor(
        { objectKey: undefined },
        { objectKey: 'from-context.pdf' }
      );
      expect(mockGetS3ReadStream).toHaveBeenCalledWith('from-context.pdf');
    });

    it('should prefer input objectKey over context', async () => {
      const stream = createMockStream([Buffer.from('pdf')]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockResolvedValue({ text: 'ok', numpages: 1 });

      await pdfExtractor(
        { objectKey: 'from-input.pdf' },
        { objectKey: 'from-context.pdf' }
      );
      expect(mockGetS3ReadStream).toHaveBeenCalledWith('from-input.pdf');
    });
  });

  describe('error handling', () => {
    it('should throw when objectKey is missing', async () => {
      await expect(
        pdfExtractor({ objectKey: undefined }, {})
      ).rejects.toThrow('Missing objectKey');

      await expect(
        pdfExtractor({}, {})
      ).rejects.toThrow('Missing objectKey');
    });

    it('should throw when S3 read fails', async () => {
      mockGetS3ReadStream.mockRejectedValue(new Error('S3 access denied'));

      await expect(
        pdfExtractor({ objectKey: 'test.pdf' }, {})
      ).rejects.toThrow('S3 access denied');
    });

    it('should throw when PDF parsing fails', async () => {
      const stream = createMockStream([Buffer.from('not a real pdf')]);
      mockGetS3ReadStream.mockResolvedValue(stream);
      mockPdfParseFn.mockRejectedValue(new Error('Invalid PDF structure'));

      await expect(
        pdfExtractor({ objectKey: 'test.pdf' }, {})
      ).rejects.toThrow('Invalid PDF structure');
    });
  });
});
