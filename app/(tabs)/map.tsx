import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
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
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface RouteOption {
    id: string;
    name: string;
    distance: string;
    time: string;
    safety: number;
    description: string;
    color: string;
}

interface LocationRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export default function MapScreen() {
    const [location, setLocation] = useState<LocationRegion | null>(null);
    const [destination, setDestination] = useState('');
    const [recentSearches] = useState([
        'Home', 'Office', 'Gym', 'Mom\'s House', 'Railway Station'
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
        },
        {
            id: '2',
            name: '⚡ FASTEST ROUTE',
            distance: '1.8 km',
            time: '22 mins',
            safety: 68,
            description: '⚠️ 2 unsafe zones • Poor lighting',
            color: '#f39c12',
        },
        {
            id: '3',
            name: '🚶 SCENIC ROUTE',
            distance: '3.1 km',
            time: '40 mins',
            safety: 82,
            description: 'Park area • Moderate lighting',
            color: '#3498db',
        },
    ];

    // Mock crime hotspots
    const crimeHotspots = [
        { id: '1', lat: 19.0760, lng: 72.8777, severity: 0.9, type: 'Theft' },
        { id: '2', lat: 19.0860, lng: 72.8877, severity: 0.6, type: 'Harassment' },
        { id: '3', lat: 19.0660, lng: 72.8677, severity: 0.8, type: 'Robbery' },
        { id: '4', lat: 19.0960, lng: 72.8977, severity: 0.4, type: 'Suspicious' },
    ];

    // Mock street lights (well-lit areas)
    const wellLitAreas = [
        { id: '1', lat: 19.0800, lng: 72.8820, radius: 150 },
        { id: '2', lat: 19.0700, lng: 72.8720, radius: 200 },
        { id: '3', lat: 19.0900, lng: 72.8920, radius: 100 },
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
                { text: 'Start Navigation', onPress: () => 
                    Alert.alert('Navigation', 'Starting navigation... (Demo)')
                }
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
                    showsCompass={true}
                >
                    {/* User location */}
                    <Marker coordinate={location}>
                        <View style={styles.userMarker}>
                            <Text style={styles.userMarkerText}>📍</Text>
                        </View>
                    </Marker>

                    {/* Crime hotspots */}
                    {crimeHotspots.map((crime) => (
                        <Marker
                            key={crime.id}
                            coordinate={{ latitude: crime.lat, longitude: crime.lng }}
                        >
                            <View style={[styles.crimeMarker, { 
                                backgroundColor: crime.severity > 0.7 ? '#e74c3c' : '#f39c12' 
                            }]}>
                                <Text style={styles.crimeEmoji}>⚠️</Text>
                            </View>
                        </Marker>
                    ))}

                    {/* Well-lit areas */}
                    {wellLitAreas.map((area) => (
                        <Circle
                            key={area.id}
                            center={{ latitude: area.lat, longitude: area.lng }}
                            radius={area.radius}
                            strokeColor="rgba(46, 204, 113, 0.5)"
                            fillColor="rgba(46, 204, 113, 0.2)"
                        />
                    ))}

                    {/* Sample safe route (green line) */}
                    <Polyline
                        coordinates={[
                            { latitude: location.latitude, longitude: location.longitude },
                            { latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 },
                            { latitude: location.latitude + 0.02, longitude: location.longitude + 0.015 },
                        ]}
                        strokeColor="#2ecc71"
                        strokeWidth={5}
                    />

                    {/* Sample unsafe route (red line) */}
                    <Polyline
                        coordinates={[
                            { latitude: location.latitude, longitude: location.longitude },
                            { latitude: location.latitude - 0.005, longitude: location.longitude - 0.01 },
                            { latitude: location.latitude - 0.015, longitude: location.longitude - 0.02 },
                        ]}
                        strokeColor="#e74c3c"
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
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
                    <Text style={styles.recentTitle}>Recent Places</Text>
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
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
                    <Text style={styles.legendText}>Well-lit</Text>
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

            {/* Current Location Button */}
            <TouchableOpacity 
                style={styles.locationButton}
                onPress={getLocation}
            >
                <Ionicons name="locate" size={24} color="#e74c3c" />
            </TouchableOpacity>
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
        flexWrap: 'wrap',
        maxWidth: width - 40,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 6,
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 10,
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
        maxHeight: '60%',
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
    locationButton: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    userMarker: {
        backgroundColor: '#3498db',
        borderRadius: 20,
        padding: 5,
        borderWidth: 2,
        borderColor: 'white',
    },
    userMarkerText: {
        fontSize: 20,
    },
    crimeMarker: {
        borderRadius: 15,
        padding: 5,
        borderWidth: 2,
        borderColor: 'white',
    },
    crimeEmoji: {
        fontSize: 14,
    },
});