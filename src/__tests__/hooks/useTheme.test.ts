import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/utils/theme';

describe('useTheme', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the light theme when color scheme is "light"', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.light);
  });

  it('returns the dark theme when color scheme is "dark"', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.dark);
  });

  it('falls back to light theme when color scheme is null', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(null);
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.light);
  });

  it('falls back to light theme when color scheme is undefined', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(undefined);
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.light);
  });

  it('returned theme has the background color key', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toHaveProperty('background');
  });

  it('switches theme on re-render when scheme changes', () => {
    const spy = jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    const { result, rerender } = renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.light);

    spy.mockReturnValue('dark');
    rerender({});
    expect(result.current).toEqual(Colors.dark);
  });
});
