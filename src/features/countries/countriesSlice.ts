import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { countriesService } from './countriesService';
import { storage } from '@/utils/storage';

const FAVORITES_KEY = 'favorites';

function loadFavorites(): string[] {
  try {
    const raw = storage.getString(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export interface Country {
  cca3: string;
  name: { common: string; official: string };
  capital: string[];
  region: string;
  population: number;
  languages: Record<string, string>;
  currencies: Record<string, { name: string; symbol: string }>;
  borders: string[];
  flags: { png: string; svg: string; alt?: string };
  latlng: [number, number];
  // Optional — not fetched to stay within the API's 10-field limit
  subregion?: string;
  area?: number;
  tld?: string[];
}

interface CountriesState {
  countries: Country[];
  filteredCountries: Country[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedRegion: string | null;
  favorites: string[];
}

const initialState: CountriesState = {
  countries: [],
  filteredCountries: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedRegion: null,
  favorites: loadFavorites(),
};

function applyFilters(
  countries: Country[],
  query: string,
  region: string | null,
): Country[] {
  let result = countries;
  if (region) {
    result = result.filter((c) => c.region === region);
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter((c) => c.name.common.toLowerCase().includes(q));
  }
  return [...result].sort((a, b) => a.name.common.localeCompare(b.name.common));
}

export const fetchCountries = createAsyncThunk(
  'countries/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await countriesService.getAllCountries();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'countries/toggleFavorite',
  async (cca3: string, { getState, rejectWithValue }) => {
    const state = getState() as { countries: CountriesState };
    const idx = state.countries.favorites.indexOf(cca3);
    const newFavorites = [...state.countries.favorites];
    if (idx >= 0) {
      newFavorites.splice(idx, 1);
    } else {
      newFavorites.push(cca3);
    }
    try {
      storage.set(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.filteredCountries = applyFilters(
        state.countries,
        action.payload,
        state.selectedRegion,
      );
    },
    setRegionFilter(state, action: PayloadAction<string | null>) {
      state.selectedRegion = action.payload;
      state.filteredCountries = applyFilters(
        state.countries,
        state.searchQuery,
        action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
        state.filteredCountries = applyFilters(
          action.payload,
          state.searchQuery,
          state.selectedRegion,
        );
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  },
});

export const { setSearchQuery, setRegionFilter } = countriesSlice.actions;

export default countriesSlice.reducer;
