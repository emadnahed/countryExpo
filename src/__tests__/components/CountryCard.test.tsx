jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    background: '#FFFFFF',
    surface: '#F8F8F8',
    text: '#111111',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
  }),
}));

jest.mock('@/utils/storage', () => ({
  storage: { getString: jest.fn(), getNumber: jest.fn(), set: jest.fn(), remove: jest.fn() },
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CountryCard } from '@/components/CountryCard';
import type { Country } from '@/features/countries/countriesSlice';

const GERMANY: Country = {
  cca3: 'DEU',
  name: { common: 'Germany', official: 'Federal Republic of Germany' },
  capital: ['Berlin'],
  region: 'Europe',
  population: 83_000_000,
  languages: { deu: 'German' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: ['AUT', 'FRA'],
  flags: { png: 'https://example.com/w320/deu.png', svg: '', alt: 'Flag of Germany' },
  latlng: [51.0, 10.0],
};

describe('CountryCard', () => {
  it('renders with the correct testID', () => {
    const { getByTestId } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    expect(getByTestId('country-card-DEU')).toBeTruthy();
  });

  it('displays the country common name', () => {
    const { getByText } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    expect(getByText('Germany')).toBeTruthy();
  });

  it('displays the formatted population', () => {
    const { getByText } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    expect(getByText('83.0M')).toBeTruthy();
  });

  it('displays the region', () => {
    const { getByText } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    expect(getByText('Europe')).toBeTruthy();
  });

  it('renders the flag image with the alt accessibility label', () => {
    const { getByLabelText } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    expect(getByLabelText('Flag of Germany')).toBeTruthy();
  });

  it('uses the country name as fallback accessibility label when alt is missing', () => {
    const countryNoAlt = { ...GERMANY, flags: { ...GERMANY.flags, alt: undefined } };
    const { getByLabelText } = render(<CountryCard country={countryNoAlt} onPress={jest.fn()} />);
    expect(getByLabelText('Flag of Germany')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<CountryCard country={GERMANY} onPress={onPress} />);
    fireEvent.press(getByTestId('country-card-DEU'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('upgrades the flag image URL from w320 to w640', () => {
    const { getByLabelText } = render(<CountryCard country={GERMANY} onPress={jest.fn()} />);
    const img = getByLabelText('Flag of Germany');
    expect(img.props.source.uri).toContain('w640');
    expect(img.props.source.uri).not.toContain('w320');
  });
});
