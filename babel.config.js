module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      // react-native-reanimated/plugin MUST be listed last.
      // Skip in Jest — the module is mocked and the plugin is very slow.
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
