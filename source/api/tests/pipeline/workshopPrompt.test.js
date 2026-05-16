import { jest } from '@jest/globals';

const { buildWorkshopPrompt } = await import(
  '../../src/services/pipeline/prompts/workshopPrompt.js'
);

describe('workshopPrompt', () => {
  const sampleText = 'Đây là nội dung workshop mẫu về Trí Tuệ Nhân Tạo.';

  it('should include the cleaned text in the prompt', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain(sampleText);
  });

  it('should include JSON schema instructions', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('"title"');
    expect(prompt).toContain('"description"');
    expect(prompt).toContain('"capacity"');
    expect(prompt).toContain('"price"');
    expect(prompt).toContain('"start_time"');
    expect(prompt).toContain('"end_time"');
    expect(prompt).toContain('"location"');
    expect(prompt).toContain('"speaker"');
  });

  it('should instruct to return only JSON', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('Chỉ trả về JSON');
    expect(prompt).toContain('không thêm bất kỳ text nào khác');
  });

  it('should include Vietnamese-specific instructions', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('tiếng Việt');
    expect(prompt).toContain('có dấu đầy đủ');
  });

  it('should include HTML formatting instructions', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('<p>');
    expect(prompt).toContain('<ul>');
    expect(prompt).toContain('<li>');
    expect(prompt).toContain('<strong>');
  });

  it('should include ISO 8601 format requirements', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('ISO 8601');
  });

  it('should include default value hints', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(prompt).toContain('mặc định 50');
    expect(prompt).toContain('mặc định 0');
  });

  it('should return a string', () => {
    const prompt = buildWorkshopPrompt(sampleText);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('should handle empty input', () => {
    const prompt = buildWorkshopPrompt('');
    expect(prompt).toContain('NỘI DUNG TÀI LIỆU:');
  });
});
