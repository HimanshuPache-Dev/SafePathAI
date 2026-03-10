import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Contact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
}

export default function ContactsScreen() {
    const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPhonePicker, setShowPhonePicker] = useState(false);
    const [phoneContacts, setPhoneContacts] = useState<any[]>([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

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

    const saveContacts = async (contacts: Contact[]) => {
        try {
            await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
            setEmergencyContacts(contacts);
        } catch (error) {
            console.log('Error saving contacts');
        }
    };

    const pickFromPhone = async () => {
        setLoading(true);
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                });

                if (data.length > 0) {
                    // Filter contacts with phone numbers
                    const contactsWithPhone = data.filter(
                        contact => contact.phoneNumbers && contact.phoneNumbers.length > 0
                    );
                    setPhoneContacts(contactsWithPhone);
                    setShowPhonePicker(true);
                } else {
                    Alert.alert('No Contacts', 'No contacts found on your device');
                }
            } else {
                Alert.alert('Permission Required', 'Please grant contacts permission');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to access contacts');
        } finally {
            setLoading(false);
        }
    };

    const selectPhoneContact = (contact: any) => {
        const phoneNumber = contact.phoneNumbers[0]?.number || '';
        setNewContact({
            name: contact.name || '',
            phone: phoneNumber,
            relationship: ''
        });
        setShowPhonePicker(false);
        setShowAddModal(true);
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
            isPrimary: emergencyContacts.length === 0 // First contact is primary
        };

        const updated = [...emergencyContacts, contact];
        saveContacts(updated);
        setNewContact({ name: '', phone: '', relationship: '' });
        setShowAddModal(false);
        Alert.alert('Success', 'Contact added successfully');
    };

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
                        const updated = emergencyContacts.filter(c => c.id !== id);
                        saveContacts(updated);
                    }
                }
            ]
        );
    };

    const setPrimaryContact = (id: string) => {
        const updated = emergencyContacts.map(c => ({
            ...c,
            isPrimary: c.id === id
        }));
        saveContacts(updated);
        Alert.alert('Success', 'Primary contact updated');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Trusted Contacts</Text>
                <Text style={styles.headerSubtitle}>
                    {emergencyContacts.length} contact{emergencyContacts.length !== 1 ? 's' : ''} added
                </Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {emergencyContacts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={60} color="#bdc3c7" />
                        <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
                        <Text style={styles.emptyText}>
                            Add contacts who will be alerted during emergencies
                        </Text>
                    </View>
                ) : (
                    emergencyContacts.map((contact) => (
                        <View key={contact.id} style={styles.contactCard}>
                            <View style={styles.contactHeader}>
                                <View style={styles.contactInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.contactName}>{contact.name}</Text>
                                        {contact.isPrimary && (
                                            <View style={styles.primaryBadge}>
                                                <Text style={styles.primaryText}>PRIMARY</Text>
                                            </View>
                                        )}
                                    </View>
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
                            
                            {!contact.isPrimary && (
                                <TouchableOpacity
                                    style={styles.setPrimaryButton}
                                    onPress={() => setPrimaryContact(contact.id)}
                                >
                                    <Text style={styles.setPrimaryText}>Set as Primary</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add Emergency Contact</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Add Contact Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Contact</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#7f8c8d" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.pickFromPhoneButton}
                            onPress={pickFromPhone}
                            disabled={loading}
                        >
                            <Ionicons name="phone-portrait-outline" size={20} color="#e74c3c" />
                            <Text style={styles.pickFromPhoneText}>
                                {loading ? 'Loading...' : 'Pick from Phone Contacts'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.orText}>- OR -</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Name *"
                            value={newContact.name}
                            onChangeText={(text) => setNewContact({...newContact, name: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number *"
                            value={newContact.phone}
                            onChangeText={(text) => setNewContact({...newContact, phone: text})}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Relationship (e.g., Mother, Friend)"
                            value={newContact.relationship}
                            onChangeText={(text) => setNewContact({...newContact, relationship: text})}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={addContact}
                            >
                                <Text style={styles.saveText}>Save Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Phone Contacts Picker Modal */}
            <Modal
                visible={showPhonePicker}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Contact</Text>
                            <TouchableOpacity onPress={() => setShowPhonePicker(false)}>
                                <Ionicons name="close" size={24} color="#7f8c8d" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={phoneContacts}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.phoneContactItem}
                                    onPress={() => selectPhoneContact(item)}
                                >
                                    <View style={styles.phoneContactIcon}>
                                        <Text style={styles.phoneContactEmoji}>👤</Text>
                                    </View>
                                    <View style={styles.phoneContactInfo}>
                                        <Text style={styles.phoneContactName}>{item.name}</Text>
                                        <Text style={styles.phoneContactNumber}>
                                            {item.phoneNumbers?.[0]?.number || 'No number'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 30,
    },
    contactCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    contactInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    primaryBadge: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    primaryText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    contactPhone: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    contactRelation: {
        fontSize: 12,
        color: '#95a5a6',
    },
    deleteButton: {
        padding: 8,
    },
    setPrimaryButton: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        alignItems: 'center',
    },
    setPrimaryText: {
        color: '#e74c3c',
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
        marginBottom: 30,
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
        maxWidth: 400,
        maxHeight: '80%',
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
    pickFromPhoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fdf0ed',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    pickFromPhoneText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        color: '#95a5a6',
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ecf0f1',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ecf0f1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#7f8c8d',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    phoneContactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    phoneContactIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    phoneContactEmoji: {
        fontSize: 24,
    },
    phoneContactInfo: {
        flex: 1,
    },
    phoneContactName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    phoneContactNumber: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
});