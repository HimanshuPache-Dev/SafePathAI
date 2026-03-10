import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

interface Contact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
}

export default function SOSScreen() {
    const [isListening, setIsListening] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [soundLevel, setSoundLevel] = useState(0);
    const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
    const [autoSOS, setAutoSOS] = useState(true);
    const [countdown, setCountdown] = useState(10);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [location, setLocation] = useState<string>('');
    
    // Animation
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadContacts();
        requestPermissions();
        
        // Start pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Countdown timer
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isCountdownActive && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (isCountdownActive && countdown === 0) {
            triggerSOS();
        }
        return () => clearTimeout(timer);
    }, [isCountdownActive, countdown]);

    const requestPermissions = async () => {
        const audioPermission = await Audio.requestPermissionsAsync();
        const locationPermission = await Location.requestForegroundPermissionsAsync();
        
        if (audioPermission.status === 'granted' && locationPermission.status === 'granted') {
            setPermissionGranted(true);
        }
    };

    const loadContacts = async () => {
        try {
            const saved = await AsyncStorage.getItem('emergencyContacts');
            if (saved) {
                setEmergencyContacts(JSON.parse(saved));
            }
        } catch (error) {
            console.log('Error loading contacts');
        }
    };

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            if (address[0]) {
                const addr = address[0];
                return `${addr.street || ''}, ${addr.city || ''}`;
            }
            return `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
        } catch (error) {
            return 'Location unavailable';
        }
    };

    const startListening = () => {
        if (!permissionGranted) {
            Alert.alert('Permission Denied', 'Microphone permission required');
            return;
        }
        if (emergencyContacts.length === 0) {
            Alert.alert('No Contacts', 'Please add emergency contacts first');
            return;
        }

        setIsListening(true);
        Vibration.vibrate(100);
        
        // Simulate sound monitoring
        const interval = setInterval(() => {
            const randomLevel = Math.floor(Math.random() * 100);
            setSoundLevel(randomLevel);
            
            if (randomLevel > 80 && autoSOS && !isCountdownActive) {
                startCountdown();
                clearInterval(interval);
            }
        }, 1000);
    };

    const stopListening = () => {
        setIsListening(false);
        setSoundLevel(0);
        Vibration.vibrate(50);
    };

    const startCountdown = () => {
        Vibration.vibrate([0, 500, 100, 500]);
        setIsCountdownActive(true);
        setCountdown(10);
        
        // Show local notification
        showLocalNotification('🚨 SOS Detected!', 'SOS will trigger in 10 seconds');
    };

    const showLocalNotification = async (title: string, body: string) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
            },
            trigger: null,
        });
    };

    const cancelSOS = () => {
        setIsCountdownActive(false);
        setCountdown(10);
        Vibration.vibrate(100);
    };

    const triggerSOS = async () => {
        setIsCountdownActive(false);
        setCountdown(10);
        
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
        
        Vibration.vibrate([0, 1000, 500, 1000]);
        
        // Send notifications to all contacts
        for (const contact of emergencyContacts) {
            await showLocalNotification(
                '🚨 EMERGENCY SOS',
                `${contact.name} has been alerted. Location: ${currentLocation}`
            );
        }
        
        Alert.alert(
            '🚨 SOS ACTIVATED',
            `Alerted ${emergencyContacts.length} contact(s)\nLocation: ${currentLocation}`,
            [{ text: 'OK' }]
        );
    };

    const addContact = () => {
        if (!newContact.name || !newContact.phone) {
            Alert.alert('Error', 'Name and phone are required');
            return;
        }

        const contact: Contact = {
            id: Date.now().toString(),
            name: newContact.name,
            phone: newContact.phone,
            relationship: newContact.relationship || 'Not specified',
        };

        const updated = [...emergencyContacts, contact];
        setEmergencyContacts(updated);
        AsyncStorage.setItem('emergencyContacts', JSON.stringify(updated));
        
        setNewContact({ name: '', phone: '', relationship: '' });
        setShowAddContact(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>SOS Emergency</Text>
                <Text style={styles.headerSubtitle}>
                    {emergencyContacts.length} emergency contact(s)
                </Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusDot, isListening && styles.statusActive]} />
                        <Text style={styles.statusText}>
                            {isListening ? 'LISTENING...' : 'MICROPHONE OFF'}
                        </Text>
                    </View>
                    
                    {isListening && (
                        <View style={styles.soundMeter}>
                            <View style={[styles.soundLevel, { width: `${soundLevel}%` }]} />
                        </View>
                    )}
                </View>

                {/* SOS Button */}
                <Animated.View style={[styles.sosContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <TouchableOpacity
                        style={styles.sosButton}
                        onPress={startListening}
                        onLongPress={triggerSOS}
                        delayLongPress={3000}
                    >
                        <LinearGradient
                            colors={['#e74c3c', '#c0392b']}
                            style={styles.sosGradient}
                        >
                            <Text style={styles.sosEmoji}>🆘</Text>
                            <Text style={styles.sosText}>HOLD FOR SOS</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Countdown */}
                {isCountdownActive && (
                    <View style={styles.countdownCard}>
                        <Text style={styles.countdownText}>SOS in: {countdown}s</Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelSOS}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Auto SOS Toggle */}
                <View style={styles.toggleCard}>
                    <Text style={styles.toggleLabel}>Auto-detect screams</Text>
                    <TouchableOpacity
                        style={[styles.toggle, autoSOS && styles.toggleActive]}
                        onPress={() => setAutoSOS(!autoSOS)}
                    >
                        <View style={[styles.toggleCircle, autoSOS && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                </View>

                {/* Emergency Contacts */}
                <View style={styles.contactsCard}>
                    <Text style={styles.cardTitle}>Emergency Contacts</Text>
                    
                    {emergencyContacts.length === 0 ? (
                        <Text style={styles.emptyText}>No contacts added yet</Text>
                    ) : (
                        emergencyContacts.map((contact) => (
                            <View key={contact.id} style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Text style={styles.contactEmoji}>👤</Text>
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactName}>{contact.name}</Text>
                                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                                </View>
                                {contact.isPrimary && (
                                    <View style={styles.primaryBadge}>
                                        <Text style={styles.primaryText}>PRIMARY</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddContact(true)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Add Emergency Contact</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Add Contact Modal */}
            <Modal visible={showAddContact} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Contact</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Name *"
                            value={newContact.name}
                            onChangeText={(text) => setNewContact({...newContact, name: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone *"
                            keyboardType="phone-pad"
                            value={newContact.phone}
                            onChangeText={(text) => setNewContact({...newContact, phone: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Relationship"
                            value={newContact.relationship}
                            onChangeText={(text) => setNewContact({...newContact, relationship: text})}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setShowAddContact(false)}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveModalButton}
                                onPress={addContact}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#95a5a6',
        marginRight: 8,
    },
    statusActive: {
        backgroundColor: '#e74c3c',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    soundMeter: {
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        overflow: 'hidden',
    },
    soundLevel: {
        height: '100%',
        backgroundColor: '#e74c3c',
    },
    sosContainer: {
        marginBottom: 20,
    },
    sosButton: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    sosGradient: {
        padding: 30,
        alignItems: 'center',
    },
    sosEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    sosText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    countdownCard: {
        backgroundColor: '#fdf0ed',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    cancelButton: {
        backgroundColor: '#34495e',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    cancelText: {
        color: 'white',
        fontWeight: 'bold',
    },
    toggleCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 16,
        color: '#2c3e50',
    },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#bdc3c7',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#e74c3c',
    },
    toggleCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'white',
    },
    toggleCircleActive: {
        transform: [{ translateX: 20 }],
    },
    contactsCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    emptyText: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactEmoji: {
        fontSize: 20,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    contactPhone: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    primaryBadge: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    primaryText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 15,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ecf0f1',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    cancelModalButton: {
        flex: 1,
        backgroundColor: '#ecf0f1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveModalButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
});