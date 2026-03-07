import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'country-explorer-storage',
});
