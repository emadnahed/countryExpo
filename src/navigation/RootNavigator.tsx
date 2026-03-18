import React from 'react';
import { useColorScheme } from 'react-native'; // drives DarkTheme / DefaultTheme selection
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CountryListScreen } from '@/features/countries/CountryListScreen';
import { CountryDetailScreen } from '@/features/countries/CountryDetailScreen';
import { MapScreen } from '@/features/countries/MapScreen';

export type RootStackParamList = {
  CountryList: undefined;
  CountryDetail: { cca3: string };
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['countryexplorer://'],
  config: {
    screens: {
      CountryList: 'countries',
      CountryDetail: 'country/:cca3',
      Map: 'map',
    },
  },
};

export function RootNavigator() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer linking={linking} theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="CountryList">
        <Stack.Screen
          name="CountryList"
          component={CountryListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CountryDetail"
          component={CountryDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
