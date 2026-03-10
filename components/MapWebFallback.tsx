import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function MapWebFallback() {
  if (Platform.OS !== 'web') return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>
        Map is only available on mobile devices
      </Text>
      <Text style={styles.text}>
        Please open this app on your Android or iOS device to see safe routes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});