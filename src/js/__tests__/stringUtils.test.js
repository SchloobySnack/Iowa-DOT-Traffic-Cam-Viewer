import { capitalizeFirstLetter } from '../utils/stringUtils';

describe('stringUtils', () => {
  test('capitalizeFirstLetter capitalizes the first letter and lowercases the rest', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('WORLD')).toBe('World');
    expect(capitalizeFirstLetter('OpenAI')).toBe('Openai');
  });

  test('capitalizeFirstLetter handles empty strings', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  test('capitalizeFirstLetter handles single character strings', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
    expect(capitalizeFirstLetter('Z')).toBe('Z');
  });
});