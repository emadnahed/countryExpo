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

// Mock LeafletMap — WebView can't run in Jest; captures onCountryPress so tests can trigger it
let capturedOnCountryPress: ((cca3: string) => void) | null = null;
jest.mock('@/components/LeafletMap', () => {
  const React = require('react');
  const { View } = require('react-native');
  const { forwardRef } = React;
  const LeafletMap = forwardRef(function LeafletMap(
    { onCountryPress, testID }: { onCountryPress: (cca3: string) => void; testID?: string },
    ref: React.Ref<{ flyTo: jest.Mock; closePopup: jest.Mock }>,
  ) {
    capturedOnCountryPress = onCountryPress;
    React.useImperativeHandle(ref, () => ({
      flyTo: jest.fn(),
      closePopup: jest.fn(),
    }));
    return <View testID={testID ?? 'leaflet-map'} />;
  });
  return { LeafletMap };
});

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MapScreen } from '@/features/countries/MapScreen';
import countriesReducer, { fetchCountries, type Country } from '@/features/countries/countriesSlice';

const makeCountry = (cca3: string, name: string, latlng: [number, number] = [0, 0]): Country => ({
  cca3, name: { common: name, official: name }, capital: ['Capital'],
  region: 'Europe', population: 1_000_000, languages: {}, currencies: {},
  borders: [], flags: { png: 'https://example.com/flag.png', svg: '' }, latlng,
});

const GERMANY = makeCountry('DEU', 'Germany', [51, 10]);
const FRANCE  = makeCountry('FRA', 'France',  [46, 2]);
const JAPAN   = makeCountry('JPN', 'Japan',   [36, 138]);

// Country without latlng
const NO_COORD = { ...makeCountry('XXX', 'NoCoord'), latlng: [] as unknown as [number, number] };

function buildStore(countries: Country[] = [GERMANY, FRANCE, JAPAN]) {
  const store = configureStore({ reducer: { countries: countriesReducer } });
  if (countries.length) {
    store.dispatch(fetchCountries.fulfilled(countries, '', undefined));
  }
  return store;
}

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn(), push: jest.fn() };

function renderScreen(store = buildStore()) {
  return render(
    <Provider store={store}>
      <MapScreen
        navigation={mockNavigation as any}
        route={{ key: 'Map', name: 'Map', params: undefined } as any}
      />
    </Provider>,
  );
}

beforeEach(() => jest.clearAllMocks());

describe('MapScreen', () => {
  it('shows the empty state (map-empty) when no countries are loaded', () => {
    const { getByTestId } = renderScreen(buildStore([]));
    expect(getByTestId('map-empty')).toBeTruthy();
  });

  it('shows the map and search bar when countries are loaded', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('leaflet-map')).toBeTruthy();
    expect(getByTestId('map-search-bar')).toBeTruthy();
  });

  it('does not show empty state when countries are loaded', () => {
    const { queryByTestId } = renderScreen();
    expect(queryByTestId('map-empty')).toBeNull();
  });

  it('shows search results dropdown when query matches countries', () => {
    const { getByTestId, getByText } = renderScreen();
    const input = getByTestId('map-search-bar').findByProps({ placeholder: 'Search countries…' });
    fireEvent.changeText(input, 'ger');
    expect(getByText('Germany')).toBeTruthy();
  });

  it('does not show dropdown for blank query', () => {
    const { getByTestId, queryByText } = renderScreen();
    const input = getByTestId('map-search-bar').findByProps({ placeholder: 'Search countries…' });
    fireEvent.changeText(input, '');
    // No results for empty query
    expect(queryByText('Germany')).toBeNull();
  });

  it('limits search results to 6 items maximum', () => {
    // Build store with 8 countries whose names all start with 'Test'
    const countries = Array.from({ length: 8 }, (_, i) =>
      makeCountry(`T0${i}`, `TestLand${i}`, [i, i]),
    );
    const store = buildStore(countries);
    const { getByTestId, getAllByText } = renderScreen(store);
    const input = getByTestId('map-search-bar').findByProps({ placeholder: 'Search countries…' });
    fireEvent.changeText(input, 'TestLand');
    // At most 6 results rendered
    const results = getAllByText(/TestLand/);
    expect(results.length).toBeLessThanOrEqual(6);
  });

  it('excludes countries without valid latlng from search results', () => {
    const store = buildStore([NO_COORD, GERMANY]);
    const { getByTestId, queryByText } = renderScreen(store);
    const input = getByTestId('map-search-bar').findByProps({ placeholder: 'Search countries…' });
    fireEvent.changeText(input, 'NoCoord');
    // NoCoord has no latlng — should not appear in results
    expect(queryByText('NoCoord')).toBeNull();
  });

  it('calls goBack when back button is pressed', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('back-btn'));
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to CountryDetail when a map marker is pressed and Explore button tapped', async () => {
    const { getByTestId } = renderScreen();
    // Simulate a map marker press — triggers showCard which sets selected state
    await act(async () => {
      capturedOnCountryPress?.('DEU');
    });
    // The country card should now be visible with the Explore button
    fireEvent.press(getByTestId('explore-country-btn'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CountryDetail', { cca3: 'DEU' });
  });
});
