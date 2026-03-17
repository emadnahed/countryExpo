import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CountryListScreen } from '@/features/countries/CountryListScreen';
import { CountryDetailScreen } from '@/features/countries/CountryDetailScreen';
import { MapScreen } from '@/features/countries/MapScreen';
import { Colors } from '@/utils/theme';

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
  const isDark = scheme === 'dark';
  const headerBg = isDark ? Colors.dark.headerBg : Colors.light.headerBg;

  return (
    <NavigationContainer linking={linking} theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="CountryList"
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 24 },
          headerShadowVisible: false,
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
          options={({ navigation }) => ({
            title: '',
            headerTransparent: true,
            headerTintColor: isDark ? '#FFF' : '#1C1C1C',
            headerLeft: () => (
              <TouchableOpacity
                testID="back-btn"
                onPress={() => navigation.goBack()}
                style={{ padding: 8 }}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={isDark ? '#FFF' : '#1C1C1C'}
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={({ navigation }) => ({
            title: 'World Map',
            headerLeft: () => (
              <TouchableOpacity
                testID="back-btn"
                onPress={() => navigation.goBack()}
                style={{ padding: 8 }}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
