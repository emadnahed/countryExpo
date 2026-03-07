import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { countriesService } from './countriesService';

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
  favorites: [],
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
  return result;
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
    toggleFavorite(state, action: PayloadAction<string>) {
      const idx = state.favorites.indexOf(action.payload);
      if (idx >= 0) {
        state.favorites.splice(idx, 1);
      } else {
        state.favorites.push(action.payload);
      }
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
      });
  },
});

export const { setSearchQuery, setRegionFilter, toggleFavorite } =
  countriesSlice.actions;

export default countriesSlice.reducer;
