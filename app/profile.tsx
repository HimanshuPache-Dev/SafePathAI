import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications);
        setDarkMode(parsed.darkMode);
        setAutoScan(parsed.autoScan);
      }
    } catch (error) {
      console.log('Error loading settings');
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const settings = {
        notifications,
        darkMode,
        autoScan,
        [key]: value
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This will delete all your contacts and scan history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'All data cleared');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profile' }} />
      
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.email}>tap to edit profile</Text>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color="#34495e" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                saveSetting('notifications', value);
              }}
              trackColor={{ false: '#767577', true: '#e74c3c' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color="#34495e" />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                saveSetting('darkMode', value);
              }}
              trackColor={{ false: '#767577', true: '#e74c3c' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="scan-outline" size={22} color="#34495e" />
              <Text style={styles.settingText}>Auto-scan daily</Text>
            </View>
            <Switch
              value={autoScan}
              onValueChange={(value) => {
                setAutoScan(value);
                saveSetting('autoScan', value);
              }}
              trackColor={{ false: '#767577', true: '#e74c3c' }}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Rate this app</Text>
            <Ionicons name="star-outline" size={20} color="#7f8c8d" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Share with friends</Text>
            <Ionicons name="share-outline" size={20} color="#7f8c8d" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutText}>Privacy Policy</Text>
            <Ionicons name="document-text-outline" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Ionicons name="trash-outline" size={22} color="#e74c3c" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdf0ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  email: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#34495e',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  aboutText: {
    fontSize: 16,
    color: '#34495e',
  },
  aboutValue: {
    fontSize: 14,
    color: '#95a5a6',
  },
  dangerSection: {
    padding: 20,
    marginBottom: 30,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fdf0ed',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  dangerButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});