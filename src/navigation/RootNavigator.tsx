import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="CountryList"
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="CountryList"
          component={CountryListScreen}
          options={{ title: 'Country Explorer' }}
        />
        <Stack.Screen
          name="CountryDetail"
          component={CountryDetailScreen}
          options={{ title: 'Country Detail' }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'World Map' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
