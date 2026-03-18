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
import { RegionFilter } from '@/components/RegionFilter';

const COUNTS = {
  Africa: 54,
  Americas: 35,
  Asia: 49,
  Europe: 44,
  Oceania: 14,
};

describe('RegionFilter', () => {
  it('renders the scroll container with correct testID', () => {
    const { getByTestId } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={COUNTS} />,
    );
    expect(getByTestId('region-filter-scroll')).toBeTruthy();
  });

  it('renders the All chip', () => {
    const { getByTestId } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={COUNTS} />,
    );
    expect(getByTestId('region-chip-all')).toBeTruthy();
  });

  it('shows total count in the All chip label', () => {
    const { getByText } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={COUNTS} />,
    );
    const total = Object.values(COUNTS).reduce((a, b) => a + b, 0); // 196
    expect(getByText(`All · ${total}`)).toBeTruthy();
  });

  it('renders all 5 region chips', () => {
    const { getByTestId } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={COUNTS} />,
    );
    ['africa', 'americas', 'asia', 'europe', 'oceania'].forEach((r) => {
      expect(getByTestId(`region-chip-${r}`)).toBeTruthy();
    });
  });

  it('calls onRegionSelect(null) when All chip is tapped', () => {
    const onRegionSelect = jest.fn();
    const { getByTestId } = render(
      <RegionFilter selectedRegion="Europe" onRegionSelect={onRegionSelect} counts={COUNTS} />,
    );
    fireEvent.press(getByTestId('region-chip-all'));
    expect(onRegionSelect).toHaveBeenCalledWith(null);
  });

  it('calls onRegionSelect with the region name when a region chip is tapped', () => {
    const onRegionSelect = jest.fn();
    const { getByTestId } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={onRegionSelect} counts={COUNTS} />,
    );
    fireEvent.press(getByTestId('region-chip-europe'));
    expect(onRegionSelect).toHaveBeenCalledWith('Europe');
  });

  it('calls onRegionSelect(null) when the already-selected region chip is tapped (deselect)', () => {
    const onRegionSelect = jest.fn();
    const { getByTestId } = render(
      <RegionFilter selectedRegion="Asia" onRegionSelect={onRegionSelect} counts={COUNTS} />,
    );
    fireEvent.press(getByTestId('region-chip-asia'));
    expect(onRegionSelect).toHaveBeenCalledWith(null);
  });

  it('shows "All" without a count when counts is empty', () => {
    const { getByText } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={{}} />,
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('shows count in each region chip label', () => {
    const { getByText } = render(
      <RegionFilter selectedRegion={null} onRegionSelect={jest.fn()} counts={COUNTS} />,
    );
    expect(getByText('Africa · 54')).toBeTruthy();
    expect(getByText('Europe · 44')).toBeTruthy();
  });
});
