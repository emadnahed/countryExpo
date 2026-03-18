jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue(undefined),
    getNumber: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/features/countries/CountryListScreen', () => ({
  CountryListScreen: function MockCountryList() {
    return null;
  },
}));

jest.mock('@/features/countries/CountryDetailScreen', () => ({
  CountryDetailScreen: function MockCountryDetail() {
    return null;
  },
}));

jest.mock('@/features/countries/MapScreen', () => ({
  MapScreen: function MockMap() {
    return null;
  },
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from '@/features/countries/countriesSlice';
import { RootNavigator, type RootStackParamList } from '@/navigation/RootNavigator';

function buildStore() {
  return configureStore({ reducer: { countries: countriesReducer } });
}

function renderNavigator() {
  const store = buildStore();
  return render(
    <Provider store={store}>
      <RootNavigator />
    </Provider>,
  );
}

describe('RootNavigator', () => {
  afterEach(() => jest.restoreAllMocks());

  it('is a function (React component)', () => {
    expect(typeof RootNavigator).toBe('function');
  });

  it('renders without crashing in light mode', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    expect(() => renderNavigator()).not.toThrow();
  });

  it('renders without crashing in dark mode', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
    expect(() => renderNavigator()).not.toThrow();
  });

  it('renders without crashing when color scheme is null', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(null);
    expect(() => renderNavigator()).not.toThrow();
  });
});

describe('RootStackParamList', () => {
  it('CountryList route has no params (undefined)', () => {
    const route: RootStackParamList['CountryList'] = undefined;
    expect(route).toBeUndefined();
  });

  it('CountryDetail route requires a cca3 string param', () => {
    const route: RootStackParamList['CountryDetail'] = { cca3: 'DEU' };
    expect(route.cca3).toBe('DEU');
  });

  it('Map route has no params (undefined)', () => {
    const route: RootStackParamList['Map'] = undefined;
    expect(route).toBeUndefined();
  });
});
