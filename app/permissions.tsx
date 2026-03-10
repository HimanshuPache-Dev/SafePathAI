import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking
} from 'react-native';

interface Permission {
    id: string;
    icon: string;
    title: string;
    description: string;
    granted: boolean;
    required: boolean;
}

export default function PermissionsScreen() {
    const [permissions, setPermissions] = useState<Permission[]>([
        {
            id: 'location',
            icon: '📍',
            title: 'Location',
            description: 'Always-on for safe routing and emergency location sharing',
            granted: false,
            required: true,
        },
        {
            id: 'microphone',
            icon: '🎤',
            title: 'Microphone',
            description: 'For scream detection and voice commands',
            granted: false,
            required: true,
        },
        {
            id: 'notifications',
            icon: '🔔',
            title: 'Notifications',
            description: 'Emergency alerts and safety reminders',
            granted: false,
            required: true,
        },
        {
            id: 'contacts',
            icon: '👥',
            title: 'Contacts',
            description: 'To add trusted emergency contacts',
            granted: false,
            required: false,
        },
    ]);

    const [progress, setProgress] = useState(0);

    const requestPermission = async (permission: Permission) => {
        try {
            let granted = false;

            switch (permission.id) {
                case 'location':
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    granted = status === 'granted';
                    break;
                case 'microphone':
                    const audioStatus = await Audio.requestPermissionsAsync();
                    granted = audioStatus.status === 'granted';
                    break;
                case 'notifications':
                    const notifStatus = await Notifications.requestPermissionsAsync();
                    granted = notifStatus.status === 'granted';
                    break;
                case 'contacts':
                    const contactStatus = await Contacts.requestPermissionsAsync();
                    granted = contactStatus.status === 'granted';
                    break;
            }

            if (granted) {
                updatePermission(permission.id, true);
                Alert.alert('✅ Granted', `${permission.title} permission granted`);
            } else {
                Alert.alert(
                    '⚠️ Permission Required',
                    `${permission.title} is ${permission.required ? 'required' : 'recommended'} for app functionality. You can enable it later in settings.`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Settings', onPress: () => Linking.openSettings() }
                    ]
                );
            }
        } catch (error) {
            console.log('Permission error:', error);
        }
    };

    const updatePermission = (id: string, granted: boolean) => {
        setPermissions(prev => {
            const updated = prev.map(p => 
                p.id === id ? { ...p, granted } : p
            );
            
            // Calculate progress
            const grantedCount = updated.filter(p => p.granted).length;
            const totalRequired = updated.filter(p => p.required).length;
            const progressValue = (grantedCount / totalRequired) * 100;
            setProgress(Math.min(progressValue, 100));
            
            return updated;
        });
    };

    const handleContinue = () => {
        const requiredGranted = permissions
            .filter(p => p.required)
            .every(p => p.granted);

        if (requiredGranted) {
            router.push('/explore');
        } else {
            Alert.alert(
                '⚠️ Permissions Needed',
                'Please grant all required permissions to continue',
                [{ text: 'OK' }]
            );
        }
    };

    const grantAll = () => {
        permissions.forEach(p => {
            if (!p.granted) {
                requestPermission(p);
            }
        });
    };

    return (
        <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/explore')}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>🔐 Permissions Needed</Text>
                <Text style={styles.subtitle}>
                    We need these permissions to keep you safe
                </Text>
            </View>

            {/* Permissions List */}
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {permissions.map((perm) => (
                    <View key={perm.id} style={styles.permissionCard}>
                        <View style={styles.permissionHeader}>
                            <View style={styles.permissionIconContainer}>
                                <Text style={styles.permissionIcon}>{perm.icon}</Text>
                            </View>
                            <View style={styles.permissionInfo}>
                                <View style={styles.permissionTitleRow}>
                                    <Text style={styles.permissionTitle}>{perm.title}</Text>
                                    {perm.required && (
                                        <View style={styles.requiredBadge}>
                                            <Text style={styles.requiredText}>Required</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.permissionDesc}>{perm.description}</Text>
                            </View>
                        </View>

                        <View style={styles.permissionFooter}>
                            <TouchableOpacity
                                style={styles.whyButton}
                                onPress={() => Alert.alert(
                                    `Why we need ${perm.title}`,
                                    `${perm.description}. This helps us ${perm.id === 'location' ? 'guide you safely' : 
                                      perm.id === 'microphone' ? 'detect emergencies' :
                                      perm.id === 'notifications' ? 'alert you instantly' :
                                      'notify your trusted contacts'}`
                                )}
                            >
                                <Ionicons name="help-circle-outline" size={18} color="#e74c3c" />
                                <Text style={styles.whyText}>Why?</Text>
                            </TouchableOpacity>

                            {perm.granted ? (
                                <View style={styles.grantedBadge}>
                                    <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                                    <Text style={styles.grantedText}>Granted</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.allowButton}
                                    onPress={() => requestPermission(perm)}
                                >
                                    <Text style={styles.allowText}>Allow</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.grantAllButton}
                    onPress={grantAll}
                >
                    <Text style={styles.grantAllText}>Enable All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        progress === 100 ? styles.continueActive : styles.continueInactive
                    ]}
                    onPress={handleContinue}
                    disabled={progress < 100}
                >
                    <Text style={styles.continueText}>
                        {progress === 100 ? 'Continue →' : 'Grant all permissions'}
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    skipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#e74c3c',
        borderRadius: 2,
    },
    progressText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    titleContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    scrollView: {
        flex: 1,
        marginBottom: 20,
    },
    permissionCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    permissionHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    permissionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    permissionIcon: {
        fontSize: 24,
    },
    permissionInfo: {
        flex: 1,
    },
    permissionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    permissionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    requiredBadge: {
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    requiredText: {
        color: '#e74c3c',
        fontSize: 10,
        fontWeight: 'bold',
    },
    permissionDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 16,
    },
    permissionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12,
    },
    whyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    whyText: {
        color: '#e74c3c',
        fontSize: 14,
    },
    allowButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
    },
    allowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    grantedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    grantedText: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: 'bold',
    },
    bottomContainer: {
        gap: 10,
        marginBottom: 20,
    },
    grantAllButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    grantAllText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButton: {
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
    },
    continueActive: {
        backgroundColor: '#e74c3c',
    },
    continueInactive: {
        backgroundColor: 'rgba(231, 76, 60, 0.3)',
    },
    continueText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});