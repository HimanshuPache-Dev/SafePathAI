import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    Vibration,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [userName, setUserName] = useState('User');
    const [safetyScore, setSafetyScore] = useState(92);
    const [scoreTrend] = useState('+12');
    const [isTracking] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    
    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const nearbyPlaces = [
        { id: '1', name: 'Police Station', distance: '200m', icon: '👮', color: '#3498db' },
        { id: '2', name: 'Hospital', distance: '500m', icon: '🏥', color: '#e74c3c' },
        { id: '3', name: '24/7 Store', distance: '300m', icon: '🏪', color: '#f39c12' },
    ];

    useEffect(() => {
        // Load user name
        loadUserName();
        
        // Start SOS button pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
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

        // Slide in animation
        Animated.spring(slideAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        getLocation();
    }, []);

    const loadUserName = async () => {
        try {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
        } catch (error) {
            console.log('Error loading name');
        }
    };

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            }
        } catch (error) {
            console.log('Location error:', error);
        }
    };

    const handleSOSPress = () => {
        Vibration.vibrate([0, 500, 200, 500]);
        Alert.alert(
            '🚨 EMERGENCY SOS',
            'Hold for 3 seconds to trigger emergency alert',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'HOLD TO TRIGGER', 
                    onPress: () => {
                        Vibration.vibrate(1000);
                        router.push('/sos');
                    }
                },
            ]
        );
    };

    const QuickAction = ({ icon, label, route, color }: { icon: string; label: string; route: string; color: string }) => (
        <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push(route as any)}
        >
            <LinearGradient
                colors={[color + '20', color + '40']}
                style={styles.quickActionIcon}
            >
                <Text style={styles.quickActionEmoji}>{icon}</Text>
            </LinearGradient>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>👋 Hello, {userName}</Text>
                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreLabel}>Safety Score</Text>
                            <View style={styles.scoreValueContainer}>
                                <Text style={styles.scoreValue}>{safetyScore}</Text>
                                <Text style={styles.scoreMax}>/100</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.trendContainer}>
                    <Ionicons name="trending-up" size={16} color="#4ade80" />
                    <Text style={styles.trendText}>{scoreTrend}% from last week</Text>
                </View>
            </LinearGradient>

            {/* Status Card */}
            <Animated.View style={[
                styles.statusCard,
                { transform: [{ translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                })}]}
            ]}>
                <View style={styles.statusHeader}>
                    <View style={styles.statusTitleContainer}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusTitle}>LIVE TRACKING ACTIVE</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.statusText}>
                    Location shared with Mom • Last update: just now
                </Text>
            </Animated.View>

            {/* SOS Button */}
            <Animated.View style={[
                styles.sosContainer,
                { transform: [{ scale: pulseAnim }] }
            ]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSOSPress}
                    onLongPress={() => {
                        Vibration.vibrate(1000);
                        Alert.alert('🚨 SOS ACTIVATED', 'Emergency contacts notified');
                    }}
                    delayLongPress={3000}
                >
                    <LinearGradient
                        colors={['#e74c3c', '#c0392b']}
                        style={styles.sosButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.sosEmoji}>🆘</Text>
                        <Text style={styles.sosText}>HOLD FOR 3 SECONDS</Text>
                        <Text style={styles.sosSubtext}>Emergency SOS</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickAction icon="📍" label="Safe Route" route="/map" color="#3498db" />
                    <QuickAction icon="👥" label="Contacts" route="/contacts" color="#9b59b6" />
                    <QuickAction icon="🔊" label="Scream Test" route="/sos" color="#e67e22" />
                    <QuickAction icon="🛡️" label="Privacy" route="/privacy" color="#2ecc71" />
                </View>
            </View>

            {/* Map Preview */}
            <View style={styles.mapPreviewContainer}>
                <Text style={styles.sectionTitle}>Nearby Safety</Text>
                <View style={styles.mapPreview}>
                    {location ? (
                        <MapView
                            style={styles.miniMap}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker coordinate={location}>
                                <View style={styles.userMarker}>
                                    <Text style={styles.userMarkerText}>📍</Text>
                                </View>
                            </Marker>
                        </MapView>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Ionicons name="map-outline" size={40} color="#7f8c8d" />
                            <Text style={styles.mapPlaceholderText}>Loading map...</Text>
                        </View>
                    )}

                    {/* Nearby Places List */}
                    <View style={styles.nearbyList}>
                        {nearbyPlaces.map((place) => (
                            <View key={place.id} style={styles.nearbyItem}>
                                <View style={[styles.nearbyIcon, { backgroundColor: place.color + '20' }]}>
                                    <Text style={styles.nearbyEmoji}>{place.icon}</Text>
                                </View>
                                <View style={styles.nearbyInfo}>
                                    <Text style={styles.nearbyName}>{place.name}</Text>
                                    <Text style={styles.nearbyDistance}>{place.distance}</Text>
                                </View>
                                <TouchableOpacity style={styles.nearbyDirection}>
                                    <Ionicons name="navigate" size={20} color={place.color} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={styles.viewFullMap}
                        onPress={() => router.push('/map')}
                    >
                        <Text style={styles.viewFullMapText}>View Full Map →</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Safety Tips */}
            <View style={styles.tipsContainer}>
                <Text style={styles.sectionTitle}>Safety Tips</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🌙</Text>
                        <Text style={styles.tipTitle}>Night Walk</Text>
                        <Text style={styles.tipText}>Stick to well-lit areas</Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🔊</Text>
                        <Text style={styles.tipTitle}>Scream Test</Text>
                        <Text style={styles.tipText}>Test detection weekly</Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>👥</Text>
                        <Text style={styles.tipTitle}>Share Location</Text>
                        <Text style={styles.tipText}>Keep contacts updated</Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🔋</Text>
                        <Text style={styles.tipTitle}>Battery</Text>
                        <Text style={styles.tipText}>Keep phone charged</Text>
                    </View>
                </ScrollView>
            </View>
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    scoreLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    scoreValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreMax: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        marginLeft: 2,
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    trendText: {
        color: '#4ade80',
        fontSize: 14,
    },
    statusCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -20,
        padding: 15,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ade80',
    },
    statusTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
        letterSpacing: 0.5,
    },
    viewDetailsText: {
        fontSize: 12,
        color: '#e74c3c',
        fontWeight: '600',
    },
    statusText: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    sosContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    sosButton: {
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    sosEmoji: {
        fontSize: 32,
        marginBottom: 5,
    },
    sosText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    sosSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    quickActionsContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: (width - 50) / 4,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionEmoji: {
        fontSize: 24,
    },
    quickActionLabel: {
        fontSize: 12,
        color: '#34495e',
        textAlign: 'center',
    },
    mapPreviewContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    mapPreview: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    miniMap: {
        width: '100%',
        height: 150,
    },
    mapPlaceholder: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        marginTop: 10,
        color: '#95a5a6',
    },
    userMarker: {
        backgroundColor: '#3498db',
        borderRadius: 20,
        padding: 5,
    },
    userMarkerText: {
        fontSize: 20,
    },
    nearbyList: {
        padding: 15,
    },
    nearbyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    nearbyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    nearbyEmoji: {
        fontSize: 18,
    },
    nearbyInfo: {
        flex: 1,
    },
    nearbyName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    nearbyDistance: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 2,
    },
    nearbyDirection: {
        padding: 8,
    },
    viewFullMap: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        alignItems: 'center',
    },
    viewFullMapText: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: '600',
    },
    tipsContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
        marginBottom: 30,
    },
    tipCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginRight: 12,
        width: 130,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tipIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 11,
        color: '#7f8c8d',
    },
});