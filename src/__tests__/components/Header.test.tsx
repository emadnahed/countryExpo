jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    background: '#F5F5F7',
    surface: '#FFFFFF',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    textMuted: '#D2D2D7',
    border: '#E5E5EA',
    inputBg: '#E8E8ED',
    skeleton: '#EAEAEA',
    error: '#FF3B30',
    favorite: '#FF9500',
    borderChipBg: '#FFFFFF',
    borderChipBorder: '#E5E5EA',
    borderChipText: '#1D1D1F',
    headerBg: '#F5F5F7',
    primary: '#1D1D1F',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '@/components/Header';

// ─── Solid variant (default) ──────────────────────────────────────────────────

describe('Header — solid variant (default)', () => {
  it('renders the title', () => {
    const { getByText } = render(<Header title="Country Explorer" />);
    expect(getByText('Country Explorer')).toBeTruthy();
  });

  it('renders back button with testID "back-btn" when onBack is provided', () => {
    const { getByTestId } = render(<Header title="X" onBack={jest.fn()} />);
    expect(getByTestId('back-btn')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<Header title="X" onBack={onBack} />);
    fireEvent.press(getByTestId('back-btn'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders right action button with custom testID', () => {
    const { getByTestId } = render(
      <Header
        title="X"
        rightAction={{ icon: 'map-outline', onPress: jest.fn(), testID: 'map-btn' }}
      />,
    );
    expect(getByTestId('map-btn')).toBeTruthy();
  });

  it('calls rightAction.onPress when right button is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Header
        title="X"
        rightAction={{ icon: 'map-outline', onPress, testID: 'right-btn' }}
      />,
    );
    fireEvent.press(getByTestId('right-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without back button when onBack is omitted', () => {
    const { queryByTestId } = render(<Header title="X" />);
    expect(queryByTestId('back-btn')).toBeNull();
  });

  it('renders without crashing when no title, no onBack, no rightAction', () => {
    const { UNSAFE_root } = render(<Header />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

// ─── Glass variant ────────────────────────────────────────────────────────────

describe('Header — glass variant', () => {
  it('renders title pill', () => {
    const { getByText } = render(<Header variant="glass" title="World Map" onBack={jest.fn()} />);
    expect(getByText('World Map')).toBeTruthy();
  });

  it('renders back button', () => {
    const { getByTestId } = render(<Header variant="glass" title="X" onBack={jest.fn()} />);
    expect(getByTestId('back-btn')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<Header variant="glass" title="X" onBack={onBack} />);
    fireEvent.press(getByTestId('back-btn'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders right action', () => {
    const { getByTestId } = render(
      <Header
        variant="glass"
        title="X"
        onBack={jest.fn()}
        rightAction={{ icon: 'globe-outline', onPress: jest.fn(), testID: 'reset-btn' }}
      />,
    );
    expect(getByTestId('reset-btn')).toBeTruthy();
  });

  it('does not render back button when onBack omitted', () => {
    const { queryByTestId } = render(<Header variant="glass" title="X" />);
    expect(queryByTestId('back-btn')).toBeNull();
  });
});

// ─── Transparent variant ──────────────────────────────────────────────────────

describe('Header — transparent variant', () => {
  it('renders back button', () => {
    const { getByTestId } = render(<Header variant="transparent" onBack={jest.fn()} />);
    expect(getByTestId('back-btn')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<Header variant="transparent" onBack={onBack} />);
    fireEvent.press(getByTestId('back-btn'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders without title in transparent mode', () => {
    const { UNSAFE_root } = render(<Header variant="transparent" onBack={jest.fn()} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
