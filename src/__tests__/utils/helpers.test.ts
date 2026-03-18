import {
  formatPopulation,
  formatArea,
  getLanguagesList,
  getCurrencyList,
  getCapital,
} from '@/utils/helpers';

describe('formatPopulation', () => {
  it('formats billions with one decimal place', () => {
    expect(formatPopulation(1_400_000_000)).toBe('1.4B');
  });

  it('formats exactly 1 billion', () => {
    expect(formatPopulation(1_000_000_000)).toBe('1.0B');
  });

  it('formats millions with one decimal place', () => {
    expect(formatPopulation(83_000_000)).toBe('83.0M');
  });

  it('formats thousands with no decimal', () => {
    expect(formatPopulation(500_000)).toBe('500K');
  });

  it('formats sub-thousand numbers with toLocaleString', () => {
    expect(formatPopulation(800)).toBe('800');
  });

  it('formats exactly 1000 as 1K', () => {
    expect(formatPopulation(1_000)).toBe('1K');
  });
});

describe('formatArea', () => {
  it('formats area with localized number and km² unit', () => {
    expect(formatArea(357_114)).toMatch(/357/); // locale separator varies
    expect(formatArea(357_114)).toContain('km²');
  });

  it('returns N/A when area is undefined', () => {
    expect(formatArea(undefined)).toBe('N/A');
  });

  it('returns N/A when area is null', () => {
    expect(formatArea(null as unknown as undefined)).toBe('N/A');
  });

  it('formats 0 as 0 km²', () => {
    expect(formatArea(0)).toBe('0 km²');
  });
});

describe('getLanguagesList', () => {
  it('joins multiple language values with a comma', () => {
    const result = getLanguagesList({ deu: 'German', eng: 'English' });
    expect(result).toContain('German');
    expect(result).toContain('English');
    expect(result).toContain(',');
  });

  it('returns a single language name without comma', () => {
    expect(getLanguagesList({ jpn: 'Japanese' })).toBe('Japanese');
  });

  it('returns N/A for an empty object', () => {
    expect(getLanguagesList({})).toBe('N/A');
  });

  it('returns N/A for null/undefined', () => {
    expect(getLanguagesList(null as unknown as Record<string, string>)).toBe('N/A');
    expect(getLanguagesList(undefined)).toBe('N/A');
  });
});

describe('getCurrencyList', () => {
  it('formats a single currency as "Name (Symbol)"', () => {
    expect(getCurrencyList({ EUR: { name: 'Euro', symbol: '€' } })).toBe('Euro (€)');
  });

  it('formats multiple currencies separated by comma', () => {
    const result = getCurrencyList({
      EUR: { name: 'Euro', symbol: '€' },
      USD: { name: 'United States dollar', symbol: '$' },
    });
    expect(result).toContain('Euro (€)');
    expect(result).toContain('United States dollar ($)');
    expect(result).toContain(',');
  });

  it('returns N/A for an empty object', () => {
    expect(getCurrencyList({})).toBe('N/A');
  });

  it('returns N/A for null/undefined', () => {
    expect(getCurrencyList(null as unknown as Record<string, { name: string; symbol: string }>)).toBe('N/A');
    expect(getCurrencyList(undefined)).toBe('N/A');
  });
});

describe('getCapital', () => {
  it('returns a single capital city', () => {
    expect(getCapital(['Berlin'])).toBe('Berlin');
  });

  it('joins multiple capitals with comma', () => {
    expect(getCapital(['City A', 'City B'])).toBe('City A, City B');
  });

  it('returns N/A for an empty array', () => {
    expect(getCapital([])).toBe('N/A');
  });

  it('returns N/A for null/undefined', () => {
    expect(getCapital(null as unknown as string[])).toBe('N/A');
    expect(getCapital(undefined as unknown as string[])).toBe('N/A');
  });
});
