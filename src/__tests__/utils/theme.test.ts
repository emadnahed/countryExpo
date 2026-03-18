import { Colors } from '@/utils/theme';

const REQUIRED_KEYS = [
  'background',
  'surface',
  'text',
  'textSecondary',
  'textMuted',
  'border',
  'primary',
  'inputBg',
  'skeleton',
  'error',
  'favorite',
  'borderChipBg',
  'borderChipBorder',
  'borderChipText',
  'headerBg',
] as const;

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3}([0-9A-Fa-f]{2})?)?$/;

describe('Colors.light', () => {
  it.each(REQUIRED_KEYS)('has required key "%s"', (key) => {
    expect(Colors.light).toHaveProperty(key);
  });

  it.each(REQUIRED_KEYS)('"%s" is a valid hex color string', (key) => {
    expect(Colors.light[key]).toMatch(HEX_COLOR_RE);
  });
});

describe('Colors.dark', () => {
  it.each(REQUIRED_KEYS)('has required key "%s"', (key) => {
    expect(Colors.dark).toHaveProperty(key);
  });

  it.each(REQUIRED_KEYS)('"%s" is a valid hex color string', (key) => {
    expect(Colors.dark[key]).toMatch(HEX_COLOR_RE);
  });
});

describe('Colors consistency', () => {
  it('light and dark themes have the same set of keys', () => {
    expect(Object.keys(Colors.light).sort()).toEqual(Object.keys(Colors.dark).sort());
  });

  it('background differs between light and dark', () => {
    expect(Colors.light.background).not.toBe(Colors.dark.background);
  });

  it('text differs between light and dark', () => {
    expect(Colors.light.text).not.toBe(Colors.dark.text);
  });

  it('surface differs between light and dark', () => {
    expect(Colors.light.surface).not.toBe(Colors.dark.surface);
  });
});
