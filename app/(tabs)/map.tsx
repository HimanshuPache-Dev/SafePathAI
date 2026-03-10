import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface RouteOption {
    id: string;
    name: string;
    distance: string;
    time: string;
    safety: number;
    description: string;
    color: string;
    path: any[];
}

interface LocationData {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export default function MapScreen() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [destination, setDestination] = useState('');
    const [recentSearches, setRecentSearches] = useState([
        'Home', 'Office', 'Gym', 'Mom\'s House'
    ]);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [showRouteOptions, setShowRouteOptions] = useState(false);
    
    // Animation
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Mock route options
    const routeOptions: RouteOption[] = [
        {
            id: '1',
            name: '🌟 SAFEST ROUTE',
            distance: '2.4 km',
            time: '32 mins',
            safety: 94,
            description: 'Well-lit • Low crime area • Police patrolling',
            color: '#2ecc71',
            path: []
        },
        {
            id: '2',
            name: '⚡ FASTEST ROUTE',
            distance: '1.8 km',
            time: '22 mins',
            safety: 68,
            description: '⚠️ 2 unsafe zones • Poor lighting',
            color: '#f39c12',
            path: []
        },
        {
            id: '3',
            name: '🚶 SCENIC ROUTE',
            distance: '3.1 km',
            time: '40 mins',
            safety: 82,
            description: 'Park area • Moderate lighting',
            color: '#3498db',
            path: []
        },
    ];

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        } catch (error) {
            console.log('Location error:', error);
        }
    };

    const handleSearch = () => {
        if (!destination.trim()) {
            Alert.alert('Error', 'Please enter a destination');
            return;
        }
        
        setShowRouteOptions(true);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const selectRoute = (route: RouteOption) => {
        setSelectedRoute(route.id);
        Alert.alert(
            'Route Selected',
            `Starting ${route.name}. Safety score: ${route.safety}%`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start Navigation', onPress: () => router.push('/explore') }
            ]
        );
    };

    const getSafetyColor = (score: number) => {
        if (score >= 80) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <View style={styles.container}>
            {/* Map View */}
            {location && (
                <MapView
                    style={styles.map}
                    initialRegion={location}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {/* Crime hotspots */}
                    <Circle
                        center={{ latitude: 19.0760, longitude: 72.8777 }}
                        radius={200}
                        strokeColor="rgba(231, 76, 60, 0.5)"
                        fillColor="rgba(231, 76, 60, 0.2)"
                    />
                    <Circle
                        center={{ latitude: 19.0860, longitude: 72.8877 }}
                        radius={150}
                        strokeColor="rgba(241, 196, 15, 0.5)"
                        fillColor="rgba(241, 196, 15, 0.2)"
                    />
                    
                    {/* Street lights (well-lit areas) */}
                    <Circle
                        center={{ latitude: 19.0800, longitude: 72.8820 }}
                        radius={100}
                        strokeColor="rgba(46, 204, 113, 0.5)"
                        fillColor="rgba(46, 204, 113, 0.2)"
                    />
                </MapView>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#7f8c8d" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter destination..."
                        placeholderTextColor="#95a5a6"
                        value={destination}
                        onChangeText={setDestination}
                        onSubmitEditing={handleSearch}
                    />
                    {destination.length > 0 && (
                        <TouchableOpacity onPress={() => setDestination('')}>
                            <Ionicons name="close-circle" size={20} color="#95a5a6" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Recent Searches */}
            {!showRouteOptions && (
                <View style={styles.recentContainer}>
                    <Text style={styles.recentTitle}>Recent</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {recentSearches.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.recentChip}
                                onPress={() => {
                                    setDestination(item);
                                    handleSearch();
                                }}
                            >
                                <Ionicons name="time-outline" size={16} color="#7f8c8d" />
                                <Text style={styles.recentChipText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.legendText}>Safe</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
                    <Text style={styles.legendText}>Caution</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.legendText}>Avoid</Text>
                </View>
            </View>

            {/* Route Options (Slide-up Panel) */}
            {showRouteOptions && (
                <Animated.View style={[
                    styles.routePanel,
                    {
                        transform: [{
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [300, 0]
                            })
                        }]
                    }
                ]}>
                    <View style={styles.panelHeader}>
                        <View style={styles.panelDrag} />
                        <Text style={styles.panelTitle}>Select Your Route</Text>
                        <TouchableOpacity onPress={() => setShowRouteOptions(false)}>
                            <Ionicons name="close" size={24} color="#7f8c8d" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {routeOptions.map((route) => (
                            <TouchableOpacity
                                key={route.id}
                                style={[
                                    styles.routeCard,
                                    selectedRoute === route.id && styles.routeCardSelected
                                ]}
                                onPress={() => selectRoute(route)}
                            >
                                <View style={styles.routeHeader}>
                                    <Text style={styles.routeName}>{route.name}</Text>
                                    <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor(route.safety) }]}>
                                        <Text style={styles.safetyText}>{route.safety}%</Text>
                                    </View>
                                </View>

                                <Text style={styles.routeDesc}>{route.description}</Text>

                                <View style={styles.routeDetails}>
                                    <View style={styles.routeDetailItem}>
                                        <Ionicons name="map-outline" size={16} color="#7f8c8d" />
                                        <Text style={styles.routeDetailText}>{route.distance}</Text>
                                    </View>
                                    <View style={styles.routeDetailItem}>
                                        <Ionicons name="time-outline" size={16} color="#7f8c8d" />
                                        <Text style={styles.routeDetailText}>{route.time}</Text>
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={[route.color + '20', route.color + '40']}
                                    style={styles.routePreview}
                                >
                                    <Text style={[styles.routePreviewText, { color: route.color }]}>
                                        Tap to select this route
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2c3e50',
    },
    recentContainer: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    recentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7f8c8d',
        marginBottom: 8,
        marginLeft: 5,
    },
    recentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        gap: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    recentChipText: {
        fontSize: 14,
        color: '#34495e',
    },
    legendContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        gap: 5,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#34495e',
    },
    routePanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
        maxHeight: '70%',
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingTop: 5,
    },
    panelDrag: {
        width: 40,
        height: 4,
        backgroundColor: '#ecf0f1',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    routeCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    routeCardSelected: {
        borderColor: '#e74c3c',
        backgroundColor: '#fff5f5',
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    safetyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    safetyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    routeDesc: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 10,
    },
    routeDetails: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    },
    routeDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    routeDetailText: {
        fontSize: 13,
        color: '#34495e',
    },
    routePreview: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    routePreviewText: {
        fontSize: 12,
        fontWeight: '600',
    },
});