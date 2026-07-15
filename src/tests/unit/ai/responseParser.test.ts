import { describe, it, expect } from 'vitest';
import { parseGeminiJson } from '@/services/ai/responseParser';

describe('parseGeminiJson', () => {
  it('parses clean, valid JSON', () => {
    expect(parseGeminiJson('{"a": 1}')).toEqual({ a: 1 });
  });

  it('strips a ```json markdown fence before parsing', () => {
    const raw = '```json\n{"a": 1}\n```';
    expect(parseGeminiJson(raw)).toEqual({ a: 1 });
  });

  it('strips a bare ``` fence without a language tag', () => {
    const raw = '```\n{"a": 1}\n```';
    expect(parseGeminiJson(raw)).toEqual({ a: 1 });
  });

  it('salvages a JSON object embedded in surrounding prose', () => {
    const raw = 'Sure, here is the JSON you asked for:\n{"a": 1}\nLet me know if you need anything else.';
    expect(parseGeminiJson(raw)).toEqual({ a: 1 });
  });

  it('returns null for empty input instead of throwing', () => {
    expect(parseGeminiJson('')).toBeNull();
  });

  it('returns null for irrecoverably malformed text instead of throwing', () => {
    expect(parseGeminiJson('this is not json at all')).toBeNull();
  });

  it('returns null for truncated/unterminated JSON instead of throwing', () => {
    expect(parseGeminiJson('{"a": 1, "b": [1, 2,')).toBeNull();
  });

  it('handles surrounding whitespace', () => {
    expect(parseGeminiJson('   \n  {"a": 1}  \n  ')).toEqual({ a: 1 });
  });
});
