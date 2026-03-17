// Dynamic config that extends app.json.
// GOOGLE_MAPS_API_KEY is read from the environment at build time —
// set it in .env locally or as a Bitrise Secret in CI.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  plugins: [
    'expo-system-ui',
    [
      'react-native-maps',
      {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    ],
  ],
});
