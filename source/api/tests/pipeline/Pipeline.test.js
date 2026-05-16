import { jest } from '@jest/globals';

const { default: Pipeline } = await import('../../src/services/pipeline/Pipeline.js');

describe('Pipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  describe('empty pipeline', () => {
    it('should return the initial input unchanged', async () => {
      const result = await pipeline.run('hello');
      expect(result).toBe('hello');
    });

    it('should return objects unchanged', async () => {
      const input = { key: 'value' };
      const result = await pipeline.run(input);
      expect(result).toEqual(input);
    });
  });

  describe('single filter', () => {
    it('should pass input through one filter', async () => {
      const doubler = async (x) => x * 2;
      pipeline.use(doubler, 'doubler');
      const result = await pipeline.run(5);
      expect(result).toBe(10);
    });

    it('should pass object through one filter', async () => {
      const addKey = async (obj) => ({ ...obj, added: true });
      pipeline.use(addKey, 'addKey');
      const result = await pipeline.run({ original: true });
      expect(result).toEqual({ original: true, added: true });
    });
  });

  describe('multiple filters', () => {
    it('should chain filters sequentially', async () => {
      const add1 = async (x) => x + 1;
      const double = async (x) => x * 2;
      const minus3 = async (x) => x - 3;

      pipeline
        .use(add1, 'add1')
        .use(double, 'double')
        .use(minus3, 'minus3');

      const result = await pipeline.run(5);
      // (5 + 1) * 2 - 3 = 9
      expect(result).toBe(9);
    });

    it('should transform data through multiple object filters', async () => {
      const extract = async (input) => ({ rawText: input.text, pages: input.count });
      const enrich = async (data) => ({ ...data, cleaned: true });
      pipeline.use(extract, 'extract').use(enrich, 'enrich');

      const result = await pipeline.run({ text: 'hello', count: 3 });
      expect(result).toEqual({ rawText: 'hello', pages: 3, cleaned: true });
    });
  });

  describe('error handling', () => {
    it('should propagate filter errors with filter name', async () => {
      const failing = async () => { throw new Error('boom'); };
      pipeline.use(failing, 'exploder');

      await expect(pipeline.run('any')).rejects.toThrow(
        'Pipeline filter "exploder" failed: boom'
      );
    });

    it('should stop execution at the failing filter', async () => {
      const step1 = jest.fn(async (x) => x + 1);
      const step2 = jest.fn(async () => { throw new Error('fail'); });
      const step3 = jest.fn(async (x) => x + 1);

      pipeline.use(step1, 'step1').use(step2, 'step2').use(step3, 'step3');

      await expect(pipeline.run(0)).rejects.toThrow();
      expect(step1).toHaveBeenCalledTimes(1);
      expect(step3).not.toHaveBeenCalled();
    });
  });

  describe('context', () => {
    it('should share context with all filters', async () => {
      const config = { maxLength: 100, lang: 'vi' };
      const reader = async (data, ctx) => ({ ...data, max: ctx.maxLength });

      pipeline.use(reader, 'reader').setContext(config);

      const result = await pipeline.run({ text: 'hi' });
      expect(result).toEqual({ text: 'hi', max: 100 });
    });

    it('should merge context across multiple setContext calls', async () => {
      const reader = async (data, ctx) => ({
        ...data,
        a: ctx.a,
        b: ctx.b,
      });

      pipeline.use(reader, 'reader').setContext({ a: 1 }).setContext({ b: 2 });

      const result = await pipeline.run({});
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe('chaining', () => {
    it('should support fluent chaining of use()', () => {
      const f1 = async (x) => x;
      const f2 = async (x) => x;
      const result = pipeline.use(f1, 'f1').use(f2, 'f2');
      expect(result).toBe(pipeline);
    });

    it('should support fluent chaining of setContext()', () => {
      const result = pipeline.setContext({ a: 1 });
      expect(result).toBe(pipeline);
    });
  });
});
