import type { Country } from '@/features/countries/countriesSlice';

export function formatPopulation(population: number): string {
  if (population >= 1_000_000_000) {
    return `${(population / 1_000_000_000).toFixed(1)}B`;
  }
  if (population >= 1_000_000) {
    return `${(population / 1_000_000).toFixed(1)}M`;
  }
  if (population >= 1_000) {
    return `${(population / 1_000).toFixed(0)}K`;
  }
  return population.toLocaleString();
}

export function formatArea(area: number | undefined): string {
  if (area == null) return 'N/A';
  return `${area.toLocaleString()} km²`;
}

export function getLanguagesList(languages: Country['languages']): string {
  return Object.values(languages ?? {}).join(', ') || 'N/A';
}

export function getCurrencyList(currencies: Country['currencies']): string {
  return Object.values(currencies ?? {})
    .map((c) => `${c.name} (${c.symbol})`)
    .join(', ') || 'N/A';
}

export function getCapital(capital: string[]): string {
  return capital?.join(', ') || 'N/A';
}
