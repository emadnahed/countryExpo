# 🌍 Country Explorer – React Native Mobile App

A **React Native mobile application** for exploring countries around the world using the **RestCountries API**.

This project demonstrates modern React Native development with TypeScript, Redux Toolkit, and performance optimizations.

---

# 📱 App Overview

Country Explorer allows users to:

* Browse all countries worldwide
* Search countries by name
* Filter countries by region
* View detailed country information
* Navigate between border countries
* Explore countries on an interactive world map

The application is built using **modern React Native architecture** with a focus on **performance and maintainability**.

---

#  Architecture

The project follows a **feature-based modular architecture**.

```
src
│
├── api
│   └── countriesApi.ts
│
├── components
│   ├── CountryCard.tsx
│   ├── RegionFilter.tsx
│   ├── SearchBar.tsx
│   └── SkeletonLoader.tsx
│
├── features
│   └── countries
│        ├── CountryListScreen.tsx
│        ├── CountryDetailScreen.tsx
│        ├── countriesSlice.ts
│        └── countriesService.ts
│
├── navigation
│   └── RootNavigator.tsx
│
├── hooks
│   ├── useCountries.ts
│   └── useTheme.ts
│
├── store
│   └── store.ts
│
├── utils
│   ├── helpers.ts
│   ├── storage.ts
│   └── theme.ts
│
└── App.tsx
```

---

# 🗺 API

Data is fetched from the **RestCountries API**.

```
https://restcountries.com/v3.1/all
```

The API provides:
* Country name, population, region, capital
* Languages, currency, borders
* Geographic coordinates, flag images

No API key required.

---

# 📱 Application Screens

## Country List Screen

Main screen displaying all countries with:
* Search by name
* Filter by region
* High-performance FlatList rendering

Each item shows:
* Country flag
* Country name
* Population
* Region

## Country Detail Screen

Comprehensive country information:
* Flag, official name, capital
* Population, region, subregion
* Languages, currency, area
* Border countries (clickable for navigation)

## Interactive Map Screen

Uses **React Native Maps** to display countries:
* Interactive map markers
* Region zooming
* Marker selection
* Navigation to country details

---

# ⚡ Performance Features

* FlatList virtualization for large datasets
* Memoization with React.memo, useMemo, useCallback
* Efficient data loading and caching
* Optimized re-rendering strategies
* Skeleton loading states for better UX

---

# 📦 Offline Support

The application uses **MMKV storage** for local caching:

1. Fetch country data from API
2. Store locally for offline access
3. Load cached data when offline

Benefits:
* Instant app startup
* Offline browsing
* Reduced API calls

---

# 🛠 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/country-explorer.git
cd country-explorer
```

Install dependencies:

```bash
npm install
```

Run iOS:

```bash
npx pod-install
npm run ios
```

Run Android:

```bash
npm run android
```

---

# 🧰 Tech Stack

**Core**
* React Native
* TypeScript

**State Management**
* Redux Toolkit

**Navigation**
* React Navigation

**Networking**
* Axios

**Storage**
* MMKV

**Animations**
* React Native Reanimated

**Testing**
* Jest
* React Native Testing Library

---

# 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in CI mode:

```bash
npm run test:ci
```

---

# � Scripts

* `npm start` - Start Expo development server
* `npm run android` - Run on Android
* `npm run ios` - Run on iOS
* `npm run prebuild` - Clean prebuild
* `npm test` - Run tests in watch mode
* `npm run test:ci` - Run tests in CI mode
* `npm run lint` - Run ESLint

---

# 📊 Project Status

The Country Explorer app has been implemented with core features including country browsing, search, filtering, and detailed views. The app includes theme support (light/dark mode), skeleton loading states, and optimized performance features.

---

# 🧑‍💻 Author

Built as a demonstration of modern React Native development practices and architecture.

---

# 📜 License

MIT License
