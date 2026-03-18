jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    getNumber: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

import { createMMKV } from 'react-native-mmkv';
import { storage } from '@/utils/storage';

const mockCreateMMKV = createMMKV as jest.Mock;

describe('storage', () => {
  it('initializes MMKV with the correct storage id', () => {
    expect(mockCreateMMKV).toHaveBeenCalledWith({ id: 'country-explorer-storage' });
  });

  it('creates exactly one MMKV instance', () => {
    expect(mockCreateMMKV).toHaveBeenCalledTimes(1);
  });

  it('exports the instance returned by createMMKV', () => {
    const instance = mockCreateMMKV.mock.results[0].value;
    expect(storage).toBe(instance);
  });

  it('exposes a getString method', () => {
    expect(typeof storage.getString).toBe('function');
  });

  it('exposes a getNumber method', () => {
    expect(typeof storage.getNumber).toBe('function');
  });

  it('exposes a set method', () => {
    expect(typeof storage.set).toBe('function');
  });

  it('exposes a remove method', () => {
    expect(typeof storage.remove).toBe('function');
  });
});
