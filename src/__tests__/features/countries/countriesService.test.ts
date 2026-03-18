jest.mock('@/utils/storage', () => ({
  storage: {
    getString: jest.fn(),
    getNumber: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/api/countriesApi', () => ({
  countriesApi: {
    fetchAll: jest.fn(),
    fetchByCode: jest.fn(),
    fetchByCodes: jest.fn(),
  },
}));

import { countriesService } from '@/features/countries/countriesService';
import { storage } from '@/utils/storage';
import { countriesApi } from '@/api/countriesApi';
import type { Country } from '@/features/countries/countriesSlice';

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockApi = countriesApi as jest.Mocked<typeof countriesApi>;

const CACHE_TTL = 24 * 60 * 60 * 1000;

const MOCK_COUNTRIES: Country[] = [
  {
    cca3: 'DEU',
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83_000_000,
    languages: { deu: 'German' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['AUT', 'FRA'],
    flags: { png: '', svg: '' },
    latlng: [51.0, 10.0],
  },
];

describe('countriesService.getAllCountries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns cached data when cache is valid', async () => {
    mockStorage.getNumber.mockReturnValue(Date.now() - 1000); // 1 second ago — within TTL
    mockStorage.getString.mockReturnValue(JSON.stringify(MOCK_COUNTRIES));

    const result = await countriesService.getAllCountries();

    expect(result).toEqual(MOCK_COUNTRIES);
    expect(mockApi.fetchAll).not.toHaveBeenCalled();
  });

  it('fetches from API when cache timestamp is missing', async () => {
    mockStorage.getNumber.mockReturnValue(undefined);
    mockApi.fetchAll.mockResolvedValue({ data: MOCK_COUNTRIES } as never);

    const result = await countriesService.getAllCountries();

    expect(mockApi.fetchAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_COUNTRIES);
  });

  it('fetches from API when cache is expired', async () => {
    mockStorage.getNumber.mockReturnValue(Date.now() - CACHE_TTL - 1000); // expired
    mockApi.fetchAll.mockResolvedValue({ data: MOCK_COUNTRIES } as never);

    const result = await countriesService.getAllCountries();

    expect(mockApi.fetchAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_COUNTRIES);
  });

  it('fetches from API when cache string is missing despite valid timestamp', async () => {
    mockStorage.getNumber.mockReturnValue(Date.now() - 1000); // fresh timestamp
    mockStorage.getString.mockReturnValue(undefined); // but no cached string
    mockApi.fetchAll.mockResolvedValue({ data: MOCK_COUNTRIES } as never);

    const result = await countriesService.getAllCountries();

    expect(mockApi.fetchAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(MOCK_COUNTRIES);
  });

  it('writes data and timestamp to storage after a successful API fetch', async () => {
    mockStorage.getNumber.mockReturnValue(undefined);
    mockApi.fetchAll.mockResolvedValue({ data: MOCK_COUNTRIES } as never);

    await countriesService.getAllCountries();

    expect(mockStorage.set).toHaveBeenCalledWith(
      'countries_cache',
      JSON.stringify(MOCK_COUNTRIES),
    );
    // Timestamp is a number — just verify the key was set
    expect(mockStorage.set).toHaveBeenCalledWith(
      'countries_cache_ts',
      expect.any(Number),
    );
  });

  it('propagates API errors to the caller', async () => {
    mockStorage.getNumber.mockReturnValue(undefined);
    mockApi.fetchAll.mockRejectedValue(new Error('Network down'));

    await expect(countriesService.getAllCountries()).rejects.toThrow('Network down');
  });
});

describe('countriesService.clearCache', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes both cache keys from storage', () => {
    countriesService.clearCache();

    expect(mockStorage.remove).toHaveBeenCalledWith('countries_cache');
    expect(mockStorage.remove).toHaveBeenCalledWith('countries_cache_ts');
    expect(mockStorage.remove).toHaveBeenCalledTimes(2);
  });
});
