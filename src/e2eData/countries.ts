/**
 * Fixture data used exclusively during Detox E2E runs on CI.
 *
 * Detox passes `-E2E 1` as a launch argument → iOS registers it in
 * NSUserDefaults → countriesService reads it via Settings.get('E2E')
 * and returns this array instead of hitting the real API.
 *
 * Why: restcountries.com is a public API with no SLA. On a fresh Bitrise VM
 * the call can exceed 30 s or fail entirely, breaking every test before any
 * UI is even exercised. E2E tests validate UI flows, not API reachability.
 *
 * Countries included — exactly what the test suite references:
 *   AFG  first alphabetically (used as the "data loaded" sentinel)
 *   ALB  first Europe card (region filter test)
 *   DZA  first Africa card  (region filter test)
 *   AIA  first Americas card (region filter test)
 *   AUS  first Oceania card  (region filter test)
 *   AUT  Germany border + navigation target in countryDetail test
 *   BEL CHE CZE DNK LUX NLD POL  remaining Germany borders
 *   DEU  primary test country (detail, favorites, search)
 *   FRA  Germany border + search test
 *   JPN  search + navigation test
 */
import type { Country } from '@/features/countries/countriesSlice';

export const E2E_COUNTRIES: Country[] = [
  {
    cca3: 'AFG',
    name: { common: 'Afghanistan', official: 'Islamic Emirate of Afghanistan' },
    capital: ['Kabul'],
    region: 'Asia',
    population: 40218234,
    languages: { prs: 'Dari', pus: 'Pashto' },
    currencies: { AFN: { name: 'Afghan afghani', symbol: '؋' } },
    borders: ['IRN', 'PAK', 'TKM', 'UZB', 'TJK', 'CHN'],
    flags: { png: 'https://flagcdn.com/w320/af.png', svg: 'https://flagcdn.com/af.svg' },
    latlng: [33, 65],
  },
  {
    cca3: 'ALB',
    name: { common: 'Albania', official: 'Republic of Albania' },
    capital: ['Tirana'],
    region: 'Europe',
    population: 2837743,
    languages: { sqi: 'Albanian' },
    currencies: { ALL: { name: 'Albanian lek', symbol: 'L' } },
    borders: ['GRC', 'MKD', 'MNE', 'SRB'],
    flags: { png: 'https://flagcdn.com/w320/al.png', svg: 'https://flagcdn.com/al.svg' },
    latlng: [41, 20],
  },
  {
    cca3: 'DZA',
    name: { common: 'Algeria', official: "People's Democratic Republic of Algeria" },
    capital: ['Algiers'],
    region: 'Africa',
    population: 44700000,
    languages: { ara: 'Arabic' },
    currencies: { DZD: { name: 'Algerian dinar', symbol: 'د.ج' } },
    borders: ['TUN', 'LBY', 'NER', 'ESH', 'MRT', 'MLI', 'MAR'],
    flags: { png: 'https://flagcdn.com/w320/dz.png', svg: 'https://flagcdn.com/dz.svg' },
    latlng: [28, 3],
  },
  {
    cca3: 'AIA',
    name: { common: 'Anguilla', official: 'Anguilla' },
    capital: ['The Valley'],
    region: 'Americas',
    population: 18090,
    languages: { eng: 'English' },
    currencies: { XCD: { name: 'Eastern Caribbean dollar', symbol: '$' } },
    borders: [],
    flags: { png: 'https://flagcdn.com/w320/ai.png', svg: 'https://flagcdn.com/ai.svg' },
    latlng: [18.25, -63.1667],
  },
  {
    cca3: 'AUS',
    name: { common: 'Australia', official: 'Commonwealth of Australia' },
    capital: ['Canberra'],
    region: 'Oceania',
    population: 25687041,
    languages: { eng: 'English' },
    currencies: { AUD: { name: 'Australian dollar', symbol: '$' } },
    borders: [],
    flags: { png: 'https://flagcdn.com/w320/au.png', svg: 'https://flagcdn.com/au.svg' },
    latlng: [-27, 133],
  },
  {
    cca3: 'AUT',
    name: { common: 'Austria', official: 'Republic of Austria' },
    capital: ['Vienna'],
    region: 'Europe',
    population: 9006398,
    languages: { deu: 'German' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['CZE', 'DEU', 'HUN', 'ITA', 'LIE', 'SVK', 'SVN', 'CHE'],
    flags: { png: 'https://flagcdn.com/w320/at.png', svg: 'https://flagcdn.com/at.svg' },
    latlng: [47.33333333, 13.33333333],
  },
  {
    cca3: 'BEL',
    name: { common: 'Belgium', official: 'Kingdom of Belgium' },
    capital: ['Brussels'],
    region: 'Europe',
    population: 11555997,
    languages: { deu: 'German', fra: 'French', nld: 'Dutch' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['FRA', 'DEU', 'LUX', 'NLD'],
    flags: { png: 'https://flagcdn.com/w320/be.png', svg: 'https://flagcdn.com/be.svg' },
    latlng: [50.83333333, 4],
  },
  {
    cca3: 'CHE',
    name: { common: 'Switzerland', official: 'Swiss Confederation' },
    capital: ['Bern'],
    region: 'Europe',
    population: 8654622,
    languages: { deu: 'German', fra: 'French', ita: 'Italian', roh: 'Romansh' },
    currencies: { CHF: { name: 'Swiss franc', symbol: 'Fr.' } },
    borders: ['AUT', 'FRA', 'ITA', 'LIE', 'DEU'],
    flags: { png: 'https://flagcdn.com/w320/ch.png', svg: 'https://flagcdn.com/ch.svg' },
    latlng: [47, 8],
  },
  {
    cca3: 'CZE',
    name: { common: 'Czechia', official: 'Czech Republic' },
    capital: ['Prague'],
    region: 'Europe',
    population: 10900555,
    languages: { ces: 'Czech' },
    currencies: { CZK: { name: 'Czech koruna', symbol: 'Kč' } },
    borders: ['AUT', 'DEU', 'POL', 'SVK'],
    flags: { png: 'https://flagcdn.com/w320/cz.png', svg: 'https://flagcdn.com/cz.svg' },
    latlng: [49.75, 15.5],
  },
  {
    cca3: 'DEU',
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83240525,
    languages: { deu: 'German' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'LUX', 'NLD', 'POL', 'CHE'],
    flags: { png: 'https://flagcdn.com/w320/de.png', svg: 'https://flagcdn.com/de.svg' },
    latlng: [51, 9],
  },
  {
    cca3: 'DNK',
    name: { common: 'Denmark', official: 'Kingdom of Denmark' },
    capital: ['Copenhagen'],
    region: 'Europe',
    population: 5831404,
    languages: { dan: 'Danish' },
    currencies: { DKK: { name: 'Danish krone', symbol: 'kr.' } },
    borders: ['DEU'],
    flags: { png: 'https://flagcdn.com/w320/dk.png', svg: 'https://flagcdn.com/dk.svg' },
    latlng: [56, 10],
  },
  {
    cca3: 'FRA',
    name: { common: 'France', official: 'French Republic' },
    capital: ['Paris'],
    region: 'Europe',
    population: 67391582,
    languages: { fra: 'French' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE'],
    flags: { png: 'https://flagcdn.com/w320/fr.png', svg: 'https://flagcdn.com/fr.svg' },
    latlng: [46, 2],
  },
  {
    cca3: 'JPN',
    name: { common: 'Japan', official: 'Japan' },
    capital: ['Tokyo'],
    region: 'Asia',
    population: 125681593,
    languages: { jpn: 'Japanese' },
    currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } },
    borders: [],
    flags: { png: 'https://flagcdn.com/w320/jp.png', svg: 'https://flagcdn.com/jp.svg' },
    latlng: [35, 136],
  },
  {
    cca3: 'LUX',
    name: { common: 'Luxembourg', official: 'Grand Duchy of Luxembourg' },
    capital: ['Luxembourg'],
    region: 'Europe',
    population: 632275,
    languages: { deu: 'German', fra: 'French', ltz: 'Luxembourgish' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['BEL', 'FRA', 'DEU'],
    flags: { png: 'https://flagcdn.com/w320/lu.png', svg: 'https://flagcdn.com/lu.svg' },
    latlng: [49.75, 6.16666666],
  },
  {
    cca3: 'NLD',
    name: { common: 'Netherlands', official: 'Kingdom of the Netherlands' },
    capital: ['Amsterdam'],
    region: 'Europe',
    population: 17441139,
    languages: { nld: 'Dutch' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['BEL', 'DEU'],
    flags: { png: 'https://flagcdn.com/w320/nl.png', svg: 'https://flagcdn.com/nl.svg' },
    latlng: [52.5, 5.75],
  },
  {
    cca3: 'POL',
    name: { common: 'Poland', official: 'Republic of Poland' },
    capital: ['Warsaw'],
    region: 'Europe',
    population: 37950802,
    languages: { pol: 'Polish' },
    currencies: { PLN: { name: 'Polish złoty', symbol: 'zł' } },
    borders: ['BLR', 'CZE', 'DEU', 'LTU', 'RUS', 'SVK', 'UKR'],
    flags: { png: 'https://flagcdn.com/w320/pl.png', svg: 'https://flagcdn.com/pl.svg' },
    latlng: [52, 20],
  },
];
