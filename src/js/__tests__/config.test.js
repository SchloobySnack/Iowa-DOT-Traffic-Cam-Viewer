import config from '../config';

describe('Config', () => {
  test('has required properties', () => {
    expect(config).toHaveProperty('apiUrl');
    expect(config).toHaveProperty('maxSimultaneousVideos');
    expect(config).toHaveProperty('lazyLoadOptions');
  });

  test('apiUrl is a valid URL', () => {
    expect(() => new URL(config.apiUrl)).not.toThrow();
  });

  test('maxSimultaneousVideos is a positive number', () => {
    expect(config.maxSimultaneousVideos).toBeGreaterThan(0);
  });

  test('lazyLoadOptions has required properties', () => {
    expect(config.lazyLoadOptions).toHaveProperty('root');
    expect(config.lazyLoadOptions).toHaveProperty('rootMargin');
    expect(config.lazyLoadOptions).toHaveProperty('threshold');
  });
});