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
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CountryDetailScreen } from '@/features/countries/CountryDetailScreen';
import countriesReducer, {
  fetchCountries,
  toggleFavorite,
  type Country,
} from '@/features/countries/countriesSlice';

const makeCountry = (
  cca3: string,
  name: string,
  overrides: Partial<Country> = {},
): Country => ({
  cca3,
  name: { common: name, official: `Official ${name}` },
  capital: ['Berlin'],
  region: 'Europe',
  population: 83_000_000,
  languages: { deu: 'German' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: [],
  flags: { png: 'https://example.com/w320/flag.png', svg: '', alt: `Flag of ${name}` },
  latlng: [51, 10],
  ...overrides,
});

const AUSTRIA = makeCountry('AUT', 'Austria');
const FRANCE  = makeCountry('FRA', 'France');
const GERMANY = makeCountry('DEU', 'Germany', {
  borders: ['AUT', 'FRA'],
  capital: ['Berlin'],
  languages: { deu: 'German' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
});

const ALL = [GERMANY, AUSTRIA, FRANCE];

function buildStore(countries: Country[] = ALL, favorites: string[] = []) {
  const store = configureStore({ reducer: { countries: countriesReducer } });
  store.dispatch(fetchCountries.fulfilled(countries, '', undefined));
  return store;
}

const mockNavigation = { goBack: jest.fn(), push: jest.fn(), navigate: jest.fn() };

function renderScreen(cca3: string, store = buildStore()) {
  return render(
    <Provider store={store}>
      <CountryDetailScreen
        navigation={mockNavigation as any}
        route={{ key: 'CountryDetail', name: 'CountryDetail', params: { cca3 } } as any}
      />
    </Provider>,
  );
}

beforeEach(() => jest.clearAllMocks());

describe('CountryDetailScreen', () => {
  describe('loading / not found', () => {
    it('shows ActivityIndicator when country is not in the store', () => {
      const store = buildStore([]); // empty store
      const { UNSAFE_getByType } = renderScreen('DEU', store);
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('country found', () => {
    it('renders the country name', () => {
      const { getByTestId, getByText } = renderScreen('DEU');
      expect(getByTestId('country-name')).toBeTruthy();
      expect(getByText('Germany')).toBeTruthy();
    });

    it('renders the official name', () => {
      const { getByText } = renderScreen('DEU');
      expect(getByText('Official Germany')).toBeTruthy();
    });

    it('renders population stat', () => {
      const { getByTestId } = renderScreen('DEU');
      expect(getByTestId('stat-population')).toBeTruthy();
    });

    it('renders region stat', () => {
      const { getByTestId } = renderScreen('DEU');
      expect(getByTestId('stat-region')).toBeTruthy();
    });

    it('shows the capital city', () => {
      const { getByText } = renderScreen('DEU');
      expect(getByText('Berlin')).toBeTruthy();
    });

    it('shows the language', () => {
      const { getByText } = renderScreen('DEU');
      expect(getByText('German')).toBeTruthy();
    });

    it('shows the currency', () => {
      const { getByText } = renderScreen('DEU');
      expect(getByText('Euro (€)')).toBeTruthy();
    });

    it('upgrades flag image URL from w320 to w1280', () => {
      const { getByLabelText } = renderScreen('DEU');
      const img = getByLabelText('Flag of Germany');
      expect(img.props.source.uri).toContain('w1280');
      expect(img.props.source.uri).not.toContain('w320');
    });

    it('shows inactive favorite button when not favorited', () => {
      const { getByTestId, queryByTestId } = renderScreen('DEU');
      expect(getByTestId('favorite-btn-inactive')).toBeTruthy();
      expect(queryByTestId('favorite-btn-active')).toBeNull();
    });

    it('shows active favorite button when country is favorited', () => {
      const store = buildStore();
      // Pre-load favorites by toggling
      store.dispatch({ type: 'countries/toggleFavorite/fulfilled', payload: ['DEU'] });
      const { getByTestId, queryByTestId } = renderScreen('DEU', store);
      expect(getByTestId('favorite-btn-active')).toBeTruthy();
      expect(queryByTestId('favorite-btn-inactive')).toBeNull();
    });

    it('toggles favorite state when favorite button is pressed', async () => {
      const store = buildStore();
      const { getByTestId, findByTestId } = renderScreen('DEU', store);
      fireEvent.press(getByTestId('favorite-btn-inactive'));
      // After toggle, the active button should appear
      await findByTestId('favorite-btn-active');
      expect(store.getState().countries.favorites).toContain('DEU');
    });

    it('calls navigation.goBack when back button is pressed', () => {
      const { getByTestId } = renderScreen('DEU');
      fireEvent.press(getByTestId('back-btn'));
      expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('border countries', () => {
    it('renders border chips for each border country', () => {
      const { getByTestId } = renderScreen('DEU');
      expect(getByTestId('border-chip-AUT')).toBeTruthy();
      expect(getByTestId('border-chip-FRA')).toBeTruthy();
    });

    it('does not render borders section when country has no borders', () => {
      const { queryByTestId } = renderScreen('AUT'); // Austria has no borders in our fixture
      expect(queryByTestId('border-chip-DEU')).toBeNull();
    });

    it('calls navigation.push to the border country when a chip is pressed', () => {
      const { getByTestId } = renderScreen('DEU');
      fireEvent.press(getByTestId('border-chip-AUT'));
      expect(mockNavigation.push).toHaveBeenCalledWith('CountryDetail', { cca3: 'AUT' });
    });
  });
});
