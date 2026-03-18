jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue(undefined),
    getNumber: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { store } from '@/store/store';

describe('store', () => {
  it('has a countries slice in state', () => {
    expect(store.getState()).toHaveProperty('countries');
  });

  it('countries slice has all expected keys', () => {
    const { countries } = store.getState();
    expect(countries).toHaveProperty('countries');
    expect(countries).toHaveProperty('filteredCountries');
    expect(countries).toHaveProperty('loading');
    expect(countries).toHaveProperty('error');
    expect(countries).toHaveProperty('favorites');
    expect(countries).toHaveProperty('searchQuery');
    expect(countries).toHaveProperty('selectedRegion');
  });

  it('initial countries list is empty', () => {
    expect(store.getState().countries.countries).toEqual([]);
  });

  it('initial filteredCountries list is empty', () => {
    expect(store.getState().countries.filteredCountries).toEqual([]);
  });

  it('initial loading state is false', () => {
    expect(store.getState().countries.loading).toBe(false);
  });

  it('initial error is null', () => {
    expect(store.getState().countries.error).toBeNull();
  });

  it('initial searchQuery is an empty string', () => {
    expect(store.getState().countries.searchQuery).toBe('');
  });

  it('initial selectedRegion is null', () => {
    expect(store.getState().countries.selectedRegion).toBeNull();
  });

  it('exposes a dispatch function', () => {
    expect(typeof store.dispatch).toBe('function');
  });

  it('exposes a getState function', () => {
    expect(typeof store.getState).toBe('function');
  });

  it('exposes a subscribe function', () => {
    expect(typeof store.subscribe).toBe('function');
  });
});
