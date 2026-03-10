import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Types
interface ScanResult {
    id: string;
    type: 'breach' | 'photo' | 'url';
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    date: string;
    source: string;
    status?: 'pending' | 'removed' | 'failed';
}

interface BreachData {
    Name: string;
    Domain: string;
    BreachDate: string;
    Description: string;
    DataClasses: string[];
    IsVerified: boolean;
}

export default function PrivacyScreen() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageResults, setImageResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'breach' | 'photos' | 'history'>('breach');
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

    // Load scan history on mount
    useEffect(() => {
        loadScanHistory();
    }, []);

    const loadScanHistory = async () => {
        try {
            const history = await AsyncStorage.getItem('scanHistory');
            if (history) {
                setScanHistory(JSON.parse(history));
            }
        } catch (error) {
            console.log('Error loading history:', error);
        }
    };

    const saveScanResult = async (result: ScanResult) => {
        try {
            const updatedHistory = [result, ...scanHistory].slice(0, 20); // Keep last 20 scans
            setScanHistory(updatedHistory);
            await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.log('Error saving history:', error);
        }
    };

    // Mock API calls for demo
    const checkEmailBreach = async (emailToCheck: string) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock breach data
        const mockBreaches: BreachData[] = [
            {
                Name: "Facebook",
                Domain: "facebook.com",
                BreachDate: "2021-04-14",
                Description: "In 2021, Facebook scraped data appeared containing phone numbers and personal information.",
                DataClasses: ["Email addresses", "Phone numbers", "Names"],
                IsVerified: true
            },
            {
                Name: "LinkedIn",
                Domain: "linkedin.com",
                BreachDate: "2022-06-22",
                Description: "LinkedIn data breach exposed email addresses and passwords.",
                DataClasses: ["Email addresses", "Passwords"],
                IsVerified: true
            },
            {
                Name: "Adobe",
                Domain: "adobe.com",
                BreachDate: "2023-10-04",
                Description: "Adobe Creative Cloud data exposure.",
                DataClasses: ["Email addresses", "Password hints"],
                IsVerified: true
            }
        ];

        return mockBreaches;
    };

    const checkPhoneBreach = async (phoneToCheck: string) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return [
            {
                source: "Truecaller",
                date: "2023-12-01",
                exposed: ["Phone number", "Name", "Location"]
            },
            {
                source: "WhatsApp Leak",
                date: "2023-11-15",
                exposed: ["Phone number", "Status"]
            }
        ];
    };

    const scanForBreaches = async () => {
        if (!email && !phone && !username) {
            Alert.alert('Error', 'Please enter email, phone, or username to scan');
            return;
        }

        setIsScanning(true);
        setScanResults([]);

        try {
            let results: ScanResult[] = [];

            if (email) {
                const breaches = await checkEmailBreach(email);
                breaches.forEach((breach, index) => {
                    results.push({
                        id: `breach-${Date.now()}-${index}`,
                        type: 'breach',
                        title: `${breach.Name} Breach`,
                        description: `Your data was exposed in ${breach.Name} breach on ${breach.BreachDate}`,
                        severity: 'high',
                        date: breach.BreachDate,
                        source: breach.Domain,
                        status: 'pending'
                    });
                });
            }

            if (phone) {
                const phoneBreaches = await checkPhoneBreach(phone);
                phoneBreaches.forEach((breach, index) => {
                    results.push({
                        id: `phone-${Date.now()}-${index}`,
                        type: 'breach',
                        title: `Phone Number Exposed`,
                        description: `Found on ${breach.source}`,
                        severity: 'medium',
                        date: breach.date,
                        source: breach.source,
                        status: 'pending'
                    });
                });
            }

            setScanResults(results);
            
            // Save to history
            results.forEach(result => saveScanResult(result));

            if (results.length === 0) {
                Alert.alert('Good News!', 'No breaches found for the provided information');
            }

        } catch (error) {
            Alert.alert('Error', 'Scan failed. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    // Image picker for fake photo detection
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant gallery access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            scanForFakePhotos(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            scanForFakePhotos(result.assets[0].uri);
        }
    };

    const scanForFakePhotos = async (imageUri: string) => {
        setIsScanning(true);
        setShowImageModal(true);

        // Simulate AI image analysis
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock results
        const mockResults = [
            {
                id: '1',
                website: 'fakebook.com',
                confidence: 98,
                url: 'https://fakebook.com/user123',
                date: '2024-01-15'
            },
            {
                id: '2',
                website: 'insta-fake.net',
                confidence: 85,
                url: 'https://insta-fake.net/profile',
                date: '2024-01-10'
            },
            {
                id: '3',
                website: 'tinder-scam.ru',
                confidence: 72,
                url: 'https://tinder-scam.ru/photos',
                date: '2024-01-05'
            }
        ];

        setImageResults(mockResults);
        setIsScanning(false);

        // Save to history
        const result: ScanResult = {
            id: `photo-${Date.now()}`,
            type: 'photo',
            title: `Found ${mockResults.length} fake images`,
            description: `Your photo appears on ${mockResults.length} websites`,
            severity: mockResults.length > 0 ? 'high' : 'low',
            date: new Date().toISOString().split('T')[0],
            source: 'Image Scan',
            status: 'pending'
        };
        saveScanResult(result);
    };

    const requestRemoval = (item: any) => {
        Alert.alert(
            'Request Removal',
            `Send removal request to ${item.website}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Request',
                    onPress: () => {
                        Alert.alert('Success', `Removal request sent to ${item.website}`);
                        // In real app: API call to request removal
                    }
                }
            ]
        );
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return '#e74c3c';
            case 'medium': return '#f39c12';
            case 'low': return '#f1c40f';
            default: return '#95a5a6';
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Privacy Scanner' }} />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'breach' && styles.activeTab]}
                    onPress={() => setActiveTab('breach')}
                >
                    <Ionicons name="shield" size={20} color={activeTab === 'breach' ? '#e74c3c' : '#7f8c8d'} />
                    <Text style={[styles.tabText, activeTab === 'breach' && styles.activeTabText]}>Breach Scan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
                    onPress={() => setActiveTab('photos')}
                >
                    <Ionicons name="image" size={20} color={activeTab === 'photos' ? '#e74c3c' : '#7f8c8d'} />
                    <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Fake Photos</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Ionicons name="time" size={20} color={activeTab === 'history' ? '#e74c3c' : '#7f8c8d'} />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Breach Scan Tab */}
                {activeTab === 'breach' && (
                    <View style={styles.tabContent}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Check Data Breaches</Text>
                            <Text style={styles.cardSubtitle}>Scan if your info has been exposed online</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#95a5a6"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Phone number (optional)"
                                placeholderTextColor="#95a5a6"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Username (optional)"
                                placeholderTextColor="#95a5a6"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                style={styles.scanButton}
                                onPress={scanForBreaches}
                                disabled={isScanning}
                            >
                                {isScanning ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="scan" size={20} color="white" />
                                        <Text style={styles.scanButtonText}>Start Scan</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Scan Results */}
                        {scanResults.length > 0 && (
                            <View style={styles.resultsContainer}>
                                <Text style={styles.resultsTitle}>Scan Results</Text>
                                {scanResults.map((result) => (
                                    <View key={result.id} style={styles.resultCard}>
                                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(result.severity) }]}>
                                            <Text style={styles.severityText}>
                                                {result.severity.toUpperCase()}
                                            </Text>
                                        </View>
                                        
                                        <View style={styles.resultContent}>
                                            <Text style={styles.resultTitle}>{result.title}</Text>
                                            <Text style={styles.resultDescription}>{result.description}</Text>
                                            <Text style={styles.resultDate}>Date: {result.date}</Text>
                                            
                                            <View style={styles.resultActions}>
                                                <TouchableOpacity 
                                                    style={styles.viewButton}
                                                    onPress={() => Alert.alert('Details', result.description)}
                                                >
                                                    <Text style={styles.viewButtonText}>View Details</Text>
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity 
                                                    style={styles.removeButton}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Request Removal',
                                                            'Request removal from this breach?',
                                                            [
                                                                { text: 'Cancel', style: 'cancel' },
                                                                { 
                                                                    text: 'Request', 
                                                                    onPress: () => Alert.alert('Success', 'Removal request sent') 
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Text style={styles.removeButtonText}>Request Removal</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Fake Photos Tab */}
                {activeTab === 'photos' && (
                    <View style={styles.tabContent}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Fake Photo Detection</Text>
                            <Text style={styles.cardSubtitle}>
                                Upload a photo to check if it's being used elsewhere online
                            </Text>

                            <View style={styles.imageButtons}>
                                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                                    <Ionicons name="images" size={30} color="#e74c3c" />
                                    <Text style={styles.imageButtonText}>Gallery</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                                    <Ionicons name="camera" size={30} color="#e74c3c" />
                                    <Text style={styles.imageButtonText}>Camera</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedImage && (
                                <View style={styles.selectedImageContainer}>
                                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                                    <TouchableOpacity 
                                        style={styles.removeImage}
                                        onPress={() => setSelectedImage(null)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#e74c3c" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Image Scan Modal */}
                        <Modal
                            visible={showImageModal}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setShowImageModal(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Scan Results</Text>
                                        <TouchableOpacity onPress={() => setShowImageModal(false)}>
                                            <Ionicons name="close" size={24} color="#7f8c8d" />
                                        </TouchableOpacity>
                                    </View>

                                    {isScanning ? (
                                        <View style={styles.scanningContainer}>
                                            <ActivityIndicator size="large" color="#e74c3c" />
                                            <Text style={styles.scanningText}>AI is scanning the internet...</Text>
                                            <Text style={styles.scanningSubtext}>This may take a moment</Text>
                                        </View>
                                    ) : (
                                        <>
                                            {selectedImage && (
                                                <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                                            )}
                                            
                                            <Text style={styles.resultsCount}>
                                                Found {imageResults.length} matches
                                            </Text>

                                            {imageResults.map((result) => (
                                                <View key={result.id} style={styles.imageResultCard}>
                                                    <View style={styles.imageResultHeader}>
                                                        <Text style={styles.imageResultWebsite}>{result.website}</Text>
                                                        <View style={styles.confidenceBadge}>
                                                            <Text style={styles.confidenceText}>{result.confidence}% match</Text>
                                                        </View>
                                                    </View>
                                                    
                                                    <Text style={styles.imageResultUrl}>{result.url}</Text>
                                                    <Text style={styles.imageResultDate}>Found: {result.date}</Text>
                                                    
                                                    <View style={styles.imageResultActions}>
                                                        <TouchableOpacity 
                                                            style={styles.visitButton}
                                                            onPress={() => Linking.openURL(result.url)}
                                                        >
                                                            <Text style={styles.visitButtonText}>Visit Site</Text>
                                                        </TouchableOpacity>
                                                        
                                                        <TouchableOpacity 
                                                            style={styles.requestButton}
                                                            onPress={() => requestRemoval(result)}
                                                        >
                                                            <Text style={styles.requestButtonText}>Request Removal</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}

                                            <TouchableOpacity
                                                style={styles.doneButton}
                                                onPress={() => setShowImageModal(false)}
                                            >
                                                <Text style={styles.doneButtonText}>Done</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        </Modal>
                    </View>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <View style={styles.tabContent}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Scan History</Text>
                            <Text style={styles.cardSubtitle}>Your previous privacy scans</Text>

                            {scanHistory.length === 0 ? (
                                <View style={styles.emptyHistory}>
                                    <Ionicons name="time-outline" size={60} color="#bdc3c7" />
                                    <Text style={styles.emptyHistoryText}>No scan history yet</Text>
                                    <Text style={styles.emptyHistorySubtext}>
                                        Run a breach scan or photo check to see results here
                                    </Text>
                                </View>
                            ) : (
                                scanHistory.map((item) => (
                                    <View key={item.id} style={styles.historyItem}>
                                        <View style={[styles.historyIcon, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
                                            <Ionicons 
                                                name={item.type === 'breach' ? 'shield' : 'image'} 
                                                size={24} 
                                                color={getSeverityColor(item.severity)} 
                                            />
                                        </View>
                                        <View style={styles.historyContent}>
                                            <Text style={styles.historyTitle}>{item.title}</Text>
                                            <Text style={styles.historyDescription}>{item.description}</Text>
                                            <Text style={styles.historyDate}>{item.date}</Text>
                                        </View>
                                        <View style={[styles.historyStatus, { backgroundColor: item.status === 'removed' ? '#2ecc71' : '#f39c12' }]}>
                                            <Text style={styles.historyStatusText}>
                                                {item.status === 'removed' ? '✓' : '⋯'}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#fdf0ed',
    },
    tabText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#e74c3c',
    },
    tabContent: {
        padding: 15,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ecf0f1',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    scanButton: {
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    scanButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        marginTop: 20,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    severityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 10,
    },
    severityText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    resultContent: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    resultDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
    },
    resultDate: {
        fontSize: 12,
        color: '#95a5a6',
        marginBottom: 10,
    },
    resultActions: {
        flexDirection: 'row',
        gap: 10,
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#ecf0f1',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#34495e',
        fontSize: 14,
        fontWeight: '500',
    },
    removeButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    imageButton: {
        alignItems: 'center',
        gap: 10,
    },
    imageButtonText: {
        fontSize: 14,
        color: '#34495e',
    },
    selectedImageContainer: {
        alignItems: 'center',
        marginTop: 20,
        position: 'relative',
    },
    selectedImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    removeImage: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'white',
        borderRadius: 15,
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
    scanningContainer: {
        alignItems: 'center',
        padding: 40,
    },
    scanningText: {
        fontSize: 16,
        color: '#34495e',
        marginTop: 20,
    },
    scanningSubtext: {
        fontSize: 14,
        color: '#95a5a6',
        marginTop: 10,
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    imageResultCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    imageResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    imageResultWebsite: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    confidenceBadge: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    confidenceText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    imageResultUrl: {
        fontSize: 12,
        color: '#3498db',
        marginBottom: 5,
    },
    imageResultDate: {
        fontSize: 11,
        color: '#95a5a6',
        marginBottom: 10,
    },
    imageResultActions: {
        flexDirection: 'row',
        gap: 10,
    },
    visitButton: {
        flex: 1,
        backgroundColor: '#ecf0f1',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    visitButtonText: {
        color: '#34495e',
        fontSize: 14,
        fontWeight: '500',
    },
    requestButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    requestButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    doneButton: {
        backgroundColor: '#34495e',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 40,
    },
    emptyHistoryText: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 10,
    },
    emptyHistorySubtext: {
        fontSize: 14,
        color: '#bdc3c7',
        textAlign: 'center',
        marginTop: 5,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    historyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    historyContent: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 2,
    },
    historyDescription: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    historyDate: {
        fontSize: 10,
        color: '#95a5a6',
    },
    historyStatus: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyStatusText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});