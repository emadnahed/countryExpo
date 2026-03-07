import { countriesApi } from '@/api/countriesApi';
import { storage } from '@/utils/storage';
import type { Country } from './countriesSlice';

const CACHE_KEY = 'countries_cache';
const CACHE_TS_KEY = 'countries_cache_ts';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class CountriesService {
  async getAllCountries(): Promise<Country[]> {
    const cached = this.readCache();
    if (cached) return cached;

    const { data } = await countriesApi.fetchAll();
    this.writeCache(data);
    return data as Country[];
  }

  private readCache(): Country[] | null {
    const ts = storage.getNumber(CACHE_TS_KEY);
    if (!ts || Date.now() - ts > CACHE_TTL) return null;
    const raw = storage.getString(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Country[]) : null;
  }

  private writeCache(countries: Country[]): void {
    storage.set(CACHE_KEY, JSON.stringify(countries));
    storage.set(CACHE_TS_KEY, Date.now());
  }

  clearCache(): void {
    storage.remove(CACHE_KEY);
    storage.remove(CACHE_TS_KEY);
  }

  async forceRefresh(): Promise<Country[]> {
    this.clearCache();
    return this.getAllCountries();
  }
}

export const countriesService = new CountriesService();
