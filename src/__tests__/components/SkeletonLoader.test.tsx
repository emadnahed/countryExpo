jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    background: '#F5F5F7',
    surface: '#FFFFFF',
    skeleton: '#EAEAEA',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    textMuted: '#D2D2D7',
    border: '#E5E5EA',
    inputBg: '#E8E8ED',
    error: '#FF3B30',
    favorite: '#FF9500',
    borderChipBg: '#FFFFFF',
    borderChipBorder: '#E5E5EA',
    borderChipText: '#1D1D1F',
    headerBg: '#F5F5F7',
    primary: '#1D1D1F',
  }),
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonLoader } from '@/components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with testID "skeleton-loader"', () => {
    const { getByTestId } = render(<SkeletonLoader />);
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });

  it('renders exactly 4 skeleton cards', () => {
    const { getAllByTestId } = render(<SkeletonLoader />);
    expect(getAllByTestId('skeleton-card')).toHaveLength(4);
  });

  it('renders without crashing', () => {
    expect(() => render(<SkeletonLoader />)).not.toThrow();
  });
});
