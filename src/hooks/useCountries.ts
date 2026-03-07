import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCountries } from '@/features/countries/countriesSlice';

export function useCountries() {
  const dispatch = useAppDispatch();
  const { countries, filteredCountries, loading, error, favorites } =
    useAppSelector((state) => state.countries);

  useEffect(() => {
    if (countries.length === 0 && !loading) {
      dispatch(fetchCountries());
    }
  }, [countries.length, loading, dispatch]);

  return { countries, filteredCountries, loading, error, favorites };
}
