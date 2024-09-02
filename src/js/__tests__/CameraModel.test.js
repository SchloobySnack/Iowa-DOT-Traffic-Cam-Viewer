import CameraModel from '../models/CameraModel';

describe('CameraModel', () => {
  let model;

  beforeEach(() => {
    model = new CameraModel();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null)
      },
      writable: true
    });
  });

  test('constructor initializes cameras and favorites', () => {
    expect(model.cameras).toEqual([]);
    expect(model.favorites).toEqual([]);
  });

  test('toggleFavorite adds camera to favorites if not present', () => {
    model.toggleFavorite('Camera1');
    expect(model.favorites).toContain('Camera1');
  });

  test('toggleFavorite removes camera from favorites if already present', () => {
    model.favorites = ['Camera1', 'Camera2'];
    model.toggleFavorite('Camera1');
    expect(model.favorites).not.toContain('Camera1');
    expect(model.favorites).toContain('Camera2');
  });

  test('isFavorite returns true for favorite cameras', () => {
    model.favorites = ['Camera1', 'Camera2'];
    expect(model.isFavorite('Camera1')).toBe(true);
    expect(model.isFavorite('Camera3')).toBe(false);
  });

  test('getRegions returns unique sorted regions', () => {
    model.cameras = [
      { region: 'B' },
      { region: 'A' },
      { region: 'C' },
      { region: 'B' },
    ];
    expect(model.getRegions()).toEqual(['A', 'B', 'C']);
  });
});