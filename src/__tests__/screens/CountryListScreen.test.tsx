jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    background: '#F5F5F7', surface: '#FFF', text: '#1D1D1F',
    textSecondary: '#86868B', textMuted: '#D2D2D7', border: '#E5E5EA',
    inputBg: '#E8E8ED', skeleton: '#EAEAEA', error: '#FF3B30',
    favorite: '#FF9500', borderChipBg: '#FFF', borderChipBorder: '#E5E5EA',
    borderChipText: '#1D1D1F', headerBg: '#F5F5F7', primary: '#1D1D1F',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/utils/storage', () => ({
  storage: { getString: jest.fn(), getNumber: jest.fn(), set: jest.fn(), remove: jest.fn() },
}));

jest.mock('@/features/countries/countriesService', () => ({
  countriesService: { getAllCountries: jest.fn(), clearCache: jest.fn() },
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CountryListScreen } from '@/features/countries/CountryListScreen';
import countriesReducer, { fetchCountries, type Country } from '@/features/countries/countriesSlice';
import { countriesService } from '@/features/countries/countriesService';

const mockService = countriesService as jest.Mocked<typeof countriesService>;

const makeCountry = (cca3: string, name: string, region: string): Country => ({
  cca3, name: { common: name, official: name }, capital: ['Capital'],
  region, population: 1_000_000, languages: {}, currencies: {},
  borders: [], flags: { png: 'https://example.com/flag.png', svg: '' }, latlng: [0, 0],
});

const COUNTRIES = [
  makeCountry('DEU', 'Germany', 'Europe'),
  makeCountry('FRA', 'France', 'Europe'),
  makeCountry('JPN', 'Japan', 'Asia'),
];

function buildStore(preloaded: Country[] = []) {
  const store = configureStore({ reducer: { countries: countriesReducer } });
  if (preloaded.length) {
    store.dispatch(fetchCountries.fulfilled(preloaded, '', undefined));
  }
  return store;
}

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
};

function renderScreen(store = buildStore()) {
  return render(
    <Provider store={store}>
      <CountryListScreen
        navigation={mockNavigation as any}
        route={{ key: 'CountryList', name: 'CountryList', params: undefined } as any}
      />
    </Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  // Prevent thunk from crashing when CountryListScreen's useEffect dispatches fetchCountries()
  mockService.getAllCountries.mockResolvedValue(COUNTRIES);
});

describe('CountryListScreen', () => {
  it('shows skeleton loader while loading and no countries', () => {
    const store = buildStore();
    store.dispatch(fetchCountries.pending('', undefined));
    const { getByTestId } = renderScreen(store);
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });

  it('shows FlatList when countries are loaded', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    expect(getByTestId('country-list')).toBeTruthy();
  });

  it('shows error view when there is an error and no filtered countries', async () => {
    // The screen's useEffect always dispatches fetchCountries on mount —
    // override the service mock to also reject so the error state persists.
    mockService.getAllCountries.mockRejectedValue(new Error('Network Error'));
    const store = buildStore();
    const { getByTestId, getByText } = renderScreen(store);
    await act(async () => {});
    expect(getByTestId('error-view')).toBeTruthy();
    expect(getByText('Failed to load: Network Error')).toBeTruthy();
  });

  it('does NOT show error view when there are countries despite an error', () => {
    const store = buildStore(COUNTRIES);
    store.dispatch(fetchCountries.rejected(null, '', undefined, 'Error'));
    const { queryByTestId } = renderScreen(store);
    // filteredCountries is populated from the earlier fulfilled dispatch
    expect(queryByTestId('error-view')).toBeNull();
  });

  it('renders the search bar', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    expect(getByTestId('search-input')).toBeTruthy();
  });

  it('renders the region filter scroll', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    expect(getByTestId('region-filter-scroll')).toBeTruthy();
  });

  it('dispatches setSearchQuery when search text changes', () => {
    const store = buildStore(COUNTRIES);
    const dispatch = jest.spyOn(store, 'dispatch');
    const { getByTestId } = renderScreen(store);
    fireEvent.changeText(getByTestId('search-input'), 'Germany');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'countries/setSearchQuery', payload: 'Germany' }),
    );
  });

  it('renders country cards for loaded countries', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    expect(getByTestId('country-card-DEU')).toBeTruthy();
  });

  it('navigates to CountryDetail when a card is pressed', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    fireEvent.press(getByTestId('country-card-DEU'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CountryDetail', { cca3: 'DEU' });
  });

  it('navigates to Map when the map button is pressed', () => {
    const { getByTestId } = renderScreen(buildStore(COUNTRIES));
    fireEvent.press(getByTestId('map-btn'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Map');
  });

  it('clears cache and dispatches fetchCountries on pull-to-refresh', async () => {
    mockService.getAllCountries.mockResolvedValue(COUNTRIES);
    const store = buildStore(COUNTRIES);
    const { getByTestId } = renderScreen(store);
    await act(async () => {
      fireEvent(getByTestId('country-list'), 'refresh');
    });
    expect(mockService.clearCache).toHaveBeenCalledTimes(1);
    expect(mockService.getAllCountries).toHaveBeenCalled();
  });

  it('computes region counts for the RegionFilter', () => {
    const { getByText } = renderScreen(buildStore(COUNTRIES));
    // All chip total = 3 countries (DEU, FRA, JPN)
    expect(getByText('All · 3')).toBeTruthy();
  });
});
