import axios from 'axios';

const BASE_URL = 'https://restcountries.com/v3.1';

// RestCountries API v3.1 enforces a maximum of 10 fields per request
export const FIELDS = 'cca3,name,flags,region,population,capital,languages,currencies,borders,latlng';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

export const countriesApi = {
  fetchAll: () => apiClient.get(`/all?fields=${FIELDS}`),
  fetchByCode: (code: string) => apiClient.get(`/alpha/${code}?fields=${FIELDS}`),
  fetchByCodes: (codes: string[]) =>
    apiClient.get(`/alpha?codes=${codes.join(',')}&fields=${FIELDS}`),
};
