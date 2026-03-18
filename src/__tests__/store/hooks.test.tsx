jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue(undefined),
    getNumber: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';

function wrapper({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

describe('useAppDispatch', () => {
  it('returns a callable dispatch function', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(typeof result.current).toBe('function');
  });
});

describe('useAppSelector', () => {
  it('selects the countries array from state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.countries.countries),
      { wrapper },
    );
    expect(Array.isArray(result.current)).toBe(true);
  });

  it('selects loading from state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.countries.loading),
      { wrapper },
    );
    expect(result.current).toBe(false);
  });

  it('selects error from state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.countries.error),
      { wrapper },
    );
    expect(result.current).toBeNull();
  });

  it('selects favorites from state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.countries.favorites),
      { wrapper },
    );
    expect(Array.isArray(result.current)).toBe(true);
  });
});
