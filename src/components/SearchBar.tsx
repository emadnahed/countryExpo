import React, { memo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar = memo(({ value, onChangeText }: Props) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder="Search countries..."
      placeholderTextColor="#999"
      clearButtonMode="while-editing"
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
    />
  </View>
));

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  input: {
    height: 44,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#333',
  },
});
