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

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('renders the text input with testID "search-input"', () => {
    const { getByTestId } = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(getByTestId('search-input')).toBeTruthy();
  });

  it('displays the current value in the input', () => {
    const { getByTestId } = render(<SearchBar value="Germany" onChangeText={jest.fn()} />);
    expect(getByTestId('search-input').props.value).toBe('Germany');
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(<SearchBar value="" onChangeText={onChangeText} />);
    fireEvent.changeText(getByTestId('search-input'), 'Japan');
    expect(onChangeText).toHaveBeenCalledWith('Japan');
  });

  it('renders the placeholder text', () => {
    const { getByTestId } = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(getByTestId('search-input').props.placeholder).toBe('Search countries...');
  });

  it('disables autocorrect', () => {
    const { getByTestId } = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(getByTestId('search-input').props.autoCorrect).toBe(false);
  });

  it('uses search return key type', () => {
    const { getByTestId } = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(getByTestId('search-input').props.returnKeyType).toBe('search');
  });

  it('calls onChangeText with empty string when text is cleared', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(<SearchBar value="Germany" onChangeText={onChangeText} />);
    fireEvent.changeText(getByTestId('search-input'), '');
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
