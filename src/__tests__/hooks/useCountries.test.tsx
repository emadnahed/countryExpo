jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn(),
    getNumber: jest.fn(),
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

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCountries } from '@/hooks/useCountries';
import countriesReducer, {
  fetchCountries,
  type Country,
} from '@/features/countries/countriesSlice';
import { countriesService } from '@/features/countries/countriesService';

const mockService = countriesService as jest.Mocked<typeof countriesService>;

const MOCK_COUNTRIES: Country[] = [
  {
    cca3: 'DEU',
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83_000_000,
    languages: {},
    currencies: {},
    borders: [],
    flags: { png: '', svg: '' },
    latlng: [51, 10],
  },
];

function buildStore(preloadedCountries: Country[] = []) {
  const store = configureStore({ reducer: { countries: countriesReducer } });
  if (preloadedCountries.length > 0) {
    store.dispatch(fetchCountries.fulfilled(preloadedCountries, '', undefined));
  }
  return store;
}

function wrapper(store: ReturnType<typeof buildStore>) {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
}

describe('useCountries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('dispatches fetchCountries when countries list is empty and not loading', async () => {
    mockService.getAllCountries.mockResolvedValue(MOCK_COUNTRIES);
    const store = buildStore(); // empty countries

    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    // Give the effect time to fire
    await act(async () => {});

    expect(mockService.getAllCountries).toHaveBeenCalledTimes(1);
    // Verify the fetched countries were populated into state
    expect(result.current.countries).toHaveLength(1);
    expect(result.current.countries[0].cca3).toBe('DEU');
  });

  it('does NOT dispatch fetchCountries when countries are already loaded', async () => {
    mockService.getAllCountries.mockResolvedValue(MOCK_COUNTRIES);
    const store = buildStore(MOCK_COUNTRIES); // pre-populated

    renderHook(() => useCountries(), { wrapper: wrapper(store) });
    await act(async () => {});

    expect(mockService.getAllCountries).not.toHaveBeenCalled();
  });

  it('returns the countries from the store', () => {
    const store = buildStore(MOCK_COUNTRIES);
    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    expect(result.current.countries).toHaveLength(1);
    expect(result.current.countries[0].cca3).toBe('DEU');
  });

  it('returns filteredCountries from the store', () => {
    const store = buildStore(MOCK_COUNTRIES);
    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    expect(result.current.filteredCountries).toHaveLength(1);
  });

  it('returns loading: false when not fetching', () => {
    const store = buildStore(MOCK_COUNTRIES);
    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    expect(result.current.loading).toBe(false);
  });

  it('returns loading: true while fetching', () => {
    const store = buildStore(); // empty — will trigger fetch
    store.dispatch(fetchCountries.pending('', undefined));

    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    expect(result.current.loading).toBe(true);
  });

  it('returns error after a failed re-fetch when countries are already loaded', async () => {
    // Pre-populate countries so the hook's condition (length===0) is false — no re-dispatch.
    // Then dispatch a rejection to simulate a re-fetch failure.
    const store = buildStore(MOCK_COUNTRIES);
    store.dispatch(fetchCountries.rejected(null, '', undefined, 'API Error'));

    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });
    await act(async () => {});

    expect(result.current.error).toBe('API Error');
    expect(result.current.countries).toHaveLength(1); // data retained after error
  });

  it('returns empty favorites by default', () => {
    const store = buildStore();
    const { result } = renderHook(() => useCountries(), { wrapper: wrapper(store) });

    expect(result.current.favorites).toEqual([]);
  });

  it('does NOT dispatch when loading is true even if countries is empty', async () => {
    mockService.getAllCountries.mockResolvedValue(MOCK_COUNTRIES);
    const store = buildStore();
    store.dispatch(fetchCountries.pending('', undefined)); // set loading: true

    renderHook(() => useCountries(), { wrapper: wrapper(store) });
    await act(async () => {});

    // loading is true → no dispatch
    expect(mockService.getAllCountries).not.toHaveBeenCalled();
  });
});
