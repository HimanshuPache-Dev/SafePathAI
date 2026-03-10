import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

// Types
interface Contact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
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

    // Load contacts from storage on mount
    useEffect(() => {
        loadContacts();
        requestPermissions();
    }, []);

    // Request permissions on mount
    const requestPermissions = async () => {
        const audioPermission = await Audio.requestPermissionsAsync();
        const locationPermission = await Location.requestForegroundPermissionsAsync();
        
        if (audioPermission.status === 'granted' && locationPermission.status === 'granted') {
            setPermissionGranted(true);
        }
    };

    // Load contacts from AsyncStorage
    const loadContacts = async () => {
        try {
            const savedContacts = await AsyncStorage.getItem('emergencyContacts');
            if (savedContacts) {
                setEmergencyContacts(JSON.parse(savedContacts));
            }
        } catch (error) {
            console.log('Error loading contacts:', error);
        }
    };

    // Save contacts to AsyncStorage
    const saveContacts = async (contacts: Contact[]) => {
        try {
            await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
        } catch (error) {
            console.log('Error saving contacts:', error);
        }
    };

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            if (address[0]) {
                const addr = address[0];
                return `${addr.street || ''}, ${addr.city || ''}, ${addr.country || ''}`;
            }
            return `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
        } catch (error) {
            return 'Location unavailable';
        }
    };

    // Add new contact
    const addContact = () => {
        if (!newContact.name.trim() || !newContact.phone.trim()) {
            Alert.alert('Error', 'Name and phone are required');
            return;
        }

        const contact: Contact = {
            id: Date.now().toString(),
            name: newContact.name,
            phone: newContact.phone,
            relationship: newContact.relationship || 'Not specified'
        };

        const updatedContacts = [...emergencyContacts, contact];
        setEmergencyContacts(updatedContacts);
        saveContacts(updatedContacts);
        
        setNewContact({ name: '', phone: '', relationship: '' });
        setShowAddContact(false);
        
        Alert.alert('Success', 'Contact added successfully');
    };

    // Delete contact
    const deleteContact = (id: string) => {
        Alert.alert(
            'Delete Contact',
            'Are you sure you want to delete this contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedContacts = emergencyContacts.filter(c => c.id !== id);
                        setEmergencyContacts(updatedContacts);
                        saveContacts(updatedContacts);
                    }
                }
            ]
        );
    };

    // Simulate sound monitoring (for demo)
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isListening) {
            interval = setInterval(() => {
                const randomLevel = Math.floor(Math.random() * 100);
                setSoundLevel(randomLevel);
                
                if (randomLevel > 80 && autoSOS && !isCountdownActive && emergencyContacts.length > 0) {
                    startCountdown();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isListening, autoSOS, isCountdownActive, emergencyContacts]);

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

    const startListening = async () => {
        if (!permissionGranted) {
            Alert.alert('Permission Denied', 'Please grant microphone permission in settings');
            return;
        }

        if (emergencyContacts.length === 0) {
            Alert.alert('No Contacts', 'Please add emergency contacts first');
            return;
        }

        setIsListening(true);
        Vibration.vibrate(100);
        Alert.alert('🎤 Listening', 'Scream detection activated');
    };

    const stopListening = () => {
        setIsListening(false);
        setSoundLevel(0);
        Vibration.vibrate(50);
        Alert.alert('⏸️ Stopped', 'Scream detection deactivated');
    };

    const startCountdown = () => {
        Vibration.vibrate([0, 500, 100, 500]);
        setIsCountdownActive(true);
        setCountdown(10);
        Alert.alert(
            '🚨 SOS DETECTED',
            `Scream detected! SOS will trigger in ${countdown} seconds. Tap CANCEL to stop.`,
            [{ text: 'CANCEL', onPress: cancelSOS, style: 'cancel' }]
        );
    };

    const cancelSOS = () => {
        setIsCountdownActive(false);
        setCountdown(10);
        Vibration.vibrate(100);
        Alert.alert('✅ Cancelled', 'SOS alert cancelled');
    };

    const triggerSOS = async () => {
        setIsCountdownActive(false);
        setCountdown(10);
        
        // Get current location
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
        
        // Vibrate pattern for emergency
        Vibration.vibrate([0, 1000, 500, 1000]);
        
        // Show emergency alert
        Alert.alert(
            '🚨 EMERGENCY SOS ACTIVATED 🚨',
            `Alerting ${emergencyContacts.length} emergency contacts...\n\nLocation: ${currentLocation}`,
            [{ text: 'OK' }]
        );

        // In real app, you would:
        // 1. Send SMS to all contacts
        // 2. Share live location
        // 3. Call emergency services
        // 4. Record audio/video
        
        console.log('SOS triggered at:', currentLocation);
        console.log('Notifying contacts:', emergencyContacts);
    };

    const testSOS = () => {
        if (emergencyContacts.length === 0) {
            Alert.alert('No Contacts', 'Please add emergency contacts first');
            return;
        }
        
        Alert.alert(
            '🧪 TEST SOS',
            'This is a TEST. In real emergency, these contacts would be notified:',
            [
                {
                    text: 'Show Contacts',
                    onPress: () => {
                        const contactList = emergencyContacts
                            .map(c => `• ${c.name} (${c.phone})`)
                            .join('\n');
                        Alert.alert('Emergency Contacts', contactList);
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ 
                title: 'SOS Mode',
                headerRight: () => (
                    <TouchableOpacity onPress={() => setShowAddContact(true)}>
                        <Ionicons name="add-circle" size={28} color="#e74c3c" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusTitle}>Emergency Status</Text>
                        <View style={[styles.statusBadge, isListening ? styles.statusActive : styles.statusInactive]}>
                            <Text style={styles.statusBadgeText}>
                                {isListening ? 'ACTIVE' : 'INACTIVE'}
                            </Text>
                        </View>
                    </View>

                    {/* Sound Level Meter */}
                    {isListening && (
                        <View style={styles.soundMeter}>
                            <View style={styles.soundLevelContainer}>
                                <View style={[styles.soundLevelFill, { width: `${soundLevel}%` }]} />
                            </View>
                            <Text style={styles.soundLevelText}>
                                {soundLevel > 80 ? '🔴 LOUD!' : '🟢 Normal'}
                            </Text>
                        </View>
                    )}

                    {/* Countdown Timer */}
                    {isCountdownActive && (
                        <View style={styles.countdownContainer}>
                            <Text style={styles.countdownText}>SOS in: {countdown}s</Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelSOS}>
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Control Buttons */}
                    <View style={styles.buttonRow}>
                        {!isListening ? (
                            <TouchableOpacity style={styles.startButton} onPress={startListening}>
                                <Ionicons name="mic" size={24} color="white" />
                                <Text style={styles.buttonText}>START LISTENING</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.stopButton} onPress={stopListening}>
                                <Ionicons name="stop" size={24} color="white" />
                                <Text style={styles.buttonText}>STOP LISTENING</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity style={styles.testButton} onPress={testSOS}>
                            <Ionicons name="flash" size={24} color="#e74c3c" />
                        </TouchableOpacity>
                    </View>

                    {/* Auto SOS Toggle */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Auto SOS (scream detection)</Text>
                        <Switch
                            value={autoSOS}
                            onValueChange={setAutoSOS}
                            trackColor={{ false: '#767577', true: '#e74c3c' }}
                            thumbColor={autoSOS ? 'white' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Emergency Contacts Section */}
                <View style={styles.contactsSection}>
                    <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                    <Text style={styles.sectionSubtitle}>
                        {emergencyContacts.length} contact{emergencyContacts.length !== 1 ? 's' : ''} added
                    </Text>

                    {emergencyContacts.length === 0 ? (
                        <View style={styles.emptyContacts}>
                            <Ionicons name="people-outline" size={50} color="#bdc3c7" />
                            <Text style={styles.emptyText}>No emergency contacts yet</Text>
                            <Text style={styles.emptySubtext}>Tap + to add contacts</Text>
                        </View>
                    ) : (
                        emergencyContacts.map((contact) => (
                            <View key={contact.id} style={styles.contactCard}>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactName}>{contact.name}</Text>
                                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                                    <Text style={styles.contactRelation}>{contact.relationship}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteContact(contact.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                                </TouchableOpacity>
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

                {/* Instructions */}
                <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>How it works:</Text>
                    <Text style={styles.instructionsText}>• App listens for screams in background</Text>
                    <Text style={styles.instructionsText}>• When detected → 10-second countdown</Text>
                    <Text style={styles.instructionsText}>• If not cancelled → SOS alerts all contacts</Text>
                    <Text style={styles.instructionsText}>• Your location is shared automatically</Text>
                </View>
            </ScrollView>

            {/* Add Contact Modal */}
            <Modal
                visible={showAddContact}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddContact(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
                            <TouchableOpacity onPress={() => setShowAddContact(false)}>
                                <Ionicons name="close" size={24} color="#7f8c8d" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Name *"
                            value={newContact.name}
                            onChangeText={(text) => setNewContact({...newContact, name: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number *"
                            keyboardType="phone-pad"
                            value={newContact.phone}
                            onChangeText={(text) => setNewContact({...newContact, phone: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Relationship (e.g., Mother, Friend)"
                            value={newContact.relationship}
                            onChangeText={(text) => setNewContact({...newContact, relationship: text})}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowAddContact(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={addContact}
                            >
                                <Text style={styles.modalSaveText}>Save Contact</Text>
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
    statusCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: '#e74c3c',
    },
    statusInactive: {
        backgroundColor: '#95a5a6',
    },
    statusBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    soundMeter: {
        marginBottom: 20,
    },
    soundLevelContainer: {
        height: 30,
        backgroundColor: '#ecf0f1',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 5,
    },
    soundLevelFill: {
        height: '100%',
        backgroundColor: '#e74c3c',
    },
    soundLevelText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#7f8c8d',
    },
    countdownContainer: {
        backgroundColor: '#fdf0ed',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    cancelButton: {
        backgroundColor: '#34495e',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    startButton: {
        flex: 1,
        backgroundColor: '#27ae60',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    stopButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    testButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
    },
    toggleLabel: {
        fontSize: 16,
        color: '#34495e',
    },
    contactsSection: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
    },
    emptyContacts: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bdc3c7',
        marginTop: 5,
    },
    contactCard: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
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
        marginTop: 2,
    },
    contactRelation: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 2,
    },
    deleteButton: {
        padding: 10,
    },
    addButton: {
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    instructions: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 30,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    instructionsText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
        paddingLeft: 10,
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
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#ecf0f1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#7f8c8d',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalSaveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});