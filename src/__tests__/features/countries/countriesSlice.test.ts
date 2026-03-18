// Mock storage BEFORE importing the slice — loadFavorites() runs at module init
jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/features/countries/countriesService', () => ({
  countriesService: {
    getAllCountries: jest.fn(),
    clearCache: jest.fn(),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import countriesReducer, {
  fetchCountries,
  toggleFavorite,
  setSearchQuery,
  setRegionFilter,
  type Country,
} from '@/features/countries/countriesSlice';
import { storage } from '@/utils/storage';
import { countriesService } from '@/features/countries/countriesService';

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockService = countriesService as jest.Mocked<typeof countriesService>;

// ─── test fixtures ────────────────────────────────────────────────────────────

const makeCountry = (
  cca3: string,
  name: string,
  region: string,
  overrides: Partial<Country> = {},
): Country => ({
  cca3,
  name: { common: name, official: name },
  capital: ['Capital City'],
  region,
  population: 1_000_000,
  languages: {},
  currencies: {},
  borders: [],
  flags: { png: '', svg: '' },
  latlng: [0, 0],
  ...overrides,
});

const GERMANY = makeCountry('DEU', 'Germany', 'Europe');
const FRANCE = makeCountry('FRA', 'France', 'Europe');
const JAPAN = makeCountry('JPN', 'Japan', 'Asia');
const BRAZIL = makeCountry('BRA', 'Brazil', 'Americas');

const ALL_COUNTRIES = [GERMANY, FRANCE, JAPAN, BRAZIL];

function buildStore() {
  return configureStore({ reducer: { countries: countriesReducer } });
}

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('starts with empty countries and no loading/error', () => {
    const store = buildStore();
    const state = store.getState().countries;
    expect(state.countries).toHaveLength(0);
    expect(state.filteredCountries).toHaveLength(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedRegion).toBeNull();
  });

  it('reads favorites from storage on module init', () => {
    // storage.getString is called by loadFavorites() when the module first loads
    expect(mockStorage.getString).toHaveBeenCalledWith('favorites');
  });

  it('starts with empty favorites when storage returns nothing', () => {
    mockStorage.getString.mockReturnValue(undefined);
    const store = buildStore();
    expect(store.getState().countries.favorites).toEqual([]);
  });
});

// ─── fetchCountries thunk ─────────────────────────────────────────────────────

describe('fetchCountries', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
    jest.clearAllMocks();
  });

  it('sets loading: true on pending', () => {
    store.dispatch(fetchCountries.pending('', undefined));
    expect(store.getState().countries.loading).toBe(true);
    expect(store.getState().countries.error).toBeNull();
  });

  it('populates countries and filteredCountries sorted alphabetically on fulfilled', () => {
    store.dispatch(fetchCountries.fulfilled(ALL_COUNTRIES, '', undefined));
    const state = store.getState().countries;
    expect(state.loading).toBe(false);
    expect(state.countries).toHaveLength(4);
    expect(state.filteredCountries.map((c) => c.cca3)).toEqual(['BRA', 'FRA', 'DEU', 'JPN']);
  });

  it('sets error on rejected', () => {
    store.dispatch(
      fetchCountries.rejected(null, '', undefined, 'Network Error'),
    );
    const state = store.getState().countries;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network Error');
  });

  it('calls countriesService.getAllCountries when dispatched', async () => {
    mockService.getAllCountries.mockResolvedValue(ALL_COUNTRIES);
    await store.dispatch(fetchCountries());
    expect(mockService.getAllCountries).toHaveBeenCalledTimes(1);
  });

  it('rejects with the service error message', async () => {
    mockService.getAllCountries.mockRejectedValue(new Error('timeout'));
    const result = await store.dispatch(fetchCountries());
    expect(fetchCountries.rejected.match(result)).toBe(true);
    expect((result as { payload: string }).payload).toBe('timeout');
  });
});

// ─── setSearchQuery ───────────────────────────────────────────────────────────

describe('setSearchQuery', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
    store.dispatch(fetchCountries.fulfilled(ALL_COUNTRIES, '', undefined));
  });

  it('filters countries by search query (case-insensitive)', () => {
    store.dispatch(setSearchQuery('ger'));
    const { filteredCountries } = store.getState().countries;
    expect(filteredCountries).toHaveLength(1);
    expect(filteredCountries[0].cca3).toBe('DEU');
  });

  it('returns all countries when query is cleared', () => {
    store.dispatch(setSearchQuery('Japan'));
    store.dispatch(setSearchQuery(''));
    expect(store.getState().countries.filteredCountries).toHaveLength(4);
  });

  it('returns empty array when no country matches', () => {
    store.dispatch(setSearchQuery('zzznomatch'));
    expect(store.getState().countries.filteredCountries).toHaveLength(0);
  });

  it('ignores whitespace-only queries and returns all countries', () => {
    store.dispatch(setSearchQuery('   '));
    expect(store.getState().countries.filteredCountries).toHaveLength(4);
  });

  it('preserves active region filter when query changes', () => {
    store.dispatch(setRegionFilter('Europe'));
    store.dispatch(setSearchQuery('fra'));
    const { filteredCountries } = store.getState().countries;
    expect(filteredCountries).toHaveLength(1);
    expect(filteredCountries[0].cca3).toBe('FRA');
  });
});

// ─── setRegionFilter ──────────────────────────────────────────────────────────

describe('setRegionFilter', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
    store.dispatch(fetchCountries.fulfilled(ALL_COUNTRIES, '', undefined));
  });

  it('filters to only the selected region', () => {
    store.dispatch(setRegionFilter('Europe'));
    const { filteredCountries } = store.getState().countries;
    expect(filteredCountries).toHaveLength(2);
    expect(filteredCountries.map((c) => c.cca3).sort()).toEqual(['DEU', 'FRA']);
  });

  it('shows all countries when region is cleared to null', () => {
    store.dispatch(setRegionFilter('Europe'));
    store.dispatch(setRegionFilter(null));
    expect(store.getState().countries.filteredCountries).toHaveLength(4);
  });

  it('returns empty when no country belongs to the region', () => {
    store.dispatch(setRegionFilter('Antarctica'));
    expect(store.getState().countries.filteredCountries).toHaveLength(0);
  });

  it('preserves active search query when region changes', () => {
    store.dispatch(setSearchQuery('a')); // Brazil, France, Japan all contain 'a'
    store.dispatch(setRegionFilter('Asia'));
    const { filteredCountries } = store.getState().countries;
    expect(filteredCountries).toHaveLength(1);
    expect(filteredCountries[0].cca3).toBe('JPN');
  });

  it('results are sorted alphabetically', () => {
    store.dispatch(setRegionFilter('Europe'));
    const names = store.getState().countries.filteredCountries.map((c) => c.name.common);
    expect(names).toEqual([...names].sort());
  });
});

// ─── toggleFavorite thunk ─────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
    jest.clearAllMocks();
  });

  it('adds a country to favorites when not already favorited', async () => {
    await store.dispatch(toggleFavorite('DEU'));
    expect(store.getState().countries.favorites).toContain('DEU');
    expect(mockStorage.set).toHaveBeenCalledWith('favorites', JSON.stringify(['DEU']));
  });

  it('removes a country from favorites when already favorited', async () => {
    await store.dispatch(toggleFavorite('DEU'));
    await store.dispatch(toggleFavorite('FRA'));
    await store.dispatch(toggleFavorite('DEU')); // remove DEU
    const { favorites } = store.getState().countries;
    expect(favorites).not.toContain('DEU');
    expect(favorites).toContain('FRA');
  });

  it('persists the updated favorites list to storage', async () => {
    await store.dispatch(toggleFavorite('JPN'));
    expect(mockStorage.set).toHaveBeenLastCalledWith('favorites', JSON.stringify(['JPN']));
  });

  it('toggle add then remove results in empty favorites', async () => {
    await store.dispatch(toggleFavorite('DEU'));
    await store.dispatch(toggleFavorite('DEU'));
    expect(store.getState().countries.favorites).toHaveLength(0);
  });
});
