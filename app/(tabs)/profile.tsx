import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
    const [userName, setUserName] = useState('User');
    const [userEmail, setUserEmail] = useState('user@email.com');
    const [userPhone, setUserPhone] = useState('Not set');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSOS, setAutoSOS] = useState(true);
    const [shareLocation, setShareLocation] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const name = await AsyncStorage.getItem('userName');
            const email = await AsyncStorage.getItem('userEmail');
            const phone = await AsyncStorage.getItem('userPhone');
            const image = await AsyncStorage.getItem('profileImage');
            
            if (name) setUserName(name);
            if (email) setUserEmail(email);
            if (phone) setUserPhone(phone);
            if (image) setProfileImage(image);
        } catch (error) {
            console.log('Error loading user data');
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant gallery access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            await AsyncStorage.setItem('profileImage', result.assets[0].uri);
        }
    };

    const logout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('isLoggedIn');
                        // Navigate to login
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, label, value, onPress, type = 'default' }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={22} color="#34495e" />
                <Text style={styles.settingText}>{label}</Text>
            </View>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#767577', true: '#e74c3c' }}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Profile</Text>
            </LinearGradient>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarEmoji}>👤</Text>
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={12} color="white" />
                    </View>
                </TouchableOpacity>
                
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
                <Text style={styles.userPhone}>{userPhone}</Text>

                <TouchableOpacity style={styles.editProfileButton}>
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                
                <SettingItem
                    icon="notifications-outline"
                    label="Notifications"
                    type="switch"
                    value={notifications}
                    onPress={() => setNotifications(!notifications)}
                />
                
                <SettingItem
                    icon="moon-outline"
                    label="Dark Mode"
                    type="switch"
                    value={darkMode}
                    onPress={() => setDarkMode(!darkMode)}
                />
                
                <SettingItem
                    icon="alert-circle-outline"
                    label="Auto SOS"
                    type="switch"
                    value={autoSOS}
                    onPress={() => setAutoSOS(!autoSOS)}
                />
                
                <SettingItem
                    icon="location-outline"
                    label="Share Location"
                    type="switch"
                    value={shareLocation}
                    onPress={() => setShareLocation(!shareLocation)}
                />
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                
                <SettingItem
                    icon="person-outline"
                    label="Personal Information"
                    onPress={() => Alert.alert('Coming Soon', 'Edit personal info')}
                />
                
                <SettingItem
                    icon="lock-closed-outline"
                    label="Privacy Settings"
                    onPress={() => Alert.alert('Coming Soon', 'Privacy settings')}
                />
                
                <SettingItem
                    icon="shield-outline"
                    label="Security"
                    onPress={() => Alert.alert('Coming Soon', 'Security settings')}
                />
                
                <SettingItem
                    icon="language-outline"
                    label="Language"
                    onPress={() => Alert.alert('Coming Soon', 'Change language')}
                />
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                
                <SettingItem
                    icon="help-circle-outline"
                    label="Help Center"
                    onPress={() => Alert.alert('Coming Soon', 'Help center')}
                />
                
                <SettingItem
                    icon="document-text-outline"
                    label="Terms & Conditions"
                    onPress={() => Alert.alert('Coming Soon', 'Terms and conditions')}
                />
                
                <SettingItem
                    icon="lock-open-outline"
                    label="Privacy Policy"
                    onPress={() => Alert.alert('Coming Soon', 'Privacy policy')}
                />
                
                <SettingItem
                    icon="star-outline"
                    label="Rate the App"
                    onPress={() => Alert.alert('Coming Soon', 'Rate on store')}
                />
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    profileCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#e74c3c',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
    },
    editProfileButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    editProfileText: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7f8c8d',
        marginBottom: 10,
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fdf0ed',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    logoutText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 30,
    },
});