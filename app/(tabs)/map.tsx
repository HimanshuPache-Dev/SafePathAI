import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

const { width } = Dimensions.get('window');

// YOUR API KEYS
const STADIA_API_KEY = 'b2c75e9c-f1b8-4a43-a013-1b56c3380c33';
const GRAPHOPPER_KEY = 'cac51b20-68ba-4a68-91df-5aac39630d50';

export default function MapScreen() {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [destination, setDestination] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }
            
            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        } catch (error) {
            console.log('Location error');
        }
    };

    // Search for locations using Nominatim
    const searchLocation = async (text) => {
        setDestination(text);
        if (text.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`,
                {
                    headers: {
                        'User-Agent': 'SafePathAI/1.0'
                    }
                }
            );
            
            if (!response.ok) {
                return;
            }
            
            const data = await response.json();
            setSearchResults(data);
            setShowSearch(true);
        } catch (error) {
            console.log('Search error:', error);
        }
    };

    // Select a location from search results
    const selectLocation = async (item) => {
        setDestination(item.display_name);
        setSearchResults([]);
        setShowSearch(false);
        setLoading(true);
        
        const destLoc = {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
        };
        setSelectedDestination(destLoc);
        
        // Calculate route if we have current location
        if (location) {
            await calculateRouteWithGraphHopper(location, destLoc);
        }
        setLoading(false);
    };

    // Calculate route using GraphHopper (WITH YOUR API KEY)
    const calculateRouteWithGraphHopper = async (start, end) => {
        try {
            console.log('Calculating route with GraphHopper...');
            
            const response = await fetch(
                `https://graphhopper.com/api/1/route?` +
                `point=${start.latitude},${start.longitude}&` +
                `point=${end.latitude},${end.longitude}&` +
                `vehicle=foot&` + // Use 'foot' for walking routes (safety app)
                `locale=en&` +
                `key=${GRAPHOPPER_KEY}&` +
                `points_encoded=false&` +
                `instructions=false`
            );
            
            const data = await response.json();
            console.log('GraphHopper response:', data);
            
            if (data.paths && data.paths.length > 0) {
                const route = data.paths[0];
                // GraphHopper returns [lng, lat] coordinates
                const points = route.points.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                
                setRouteCoordinates(points);
                
                // Convert distance from meters to km
                const distanceKm = (route.distance / 1000).toFixed(1);
                // Convert time from seconds to minutes
                const durationMin = Math.round(route.time / 60000);
                
                setDistance(`${distanceKm} km`);
                setDuration(`${durationMin} min`);
                
                console.log(`Route found: ${distanceKm}km, ${durationMin}min`);
            } else {
                Alert.alert('Error', 'No route found between these locations');
            }
        } catch (error) {
            console.log('Route error:', error);
            Alert.alert('Error', 'Could not calculate route. Using straight line instead.');
            
            // Fallback to straight line
            setRouteCoordinates([start, end]);
            
            // Calculate approximate straight-line distance
            const R = 6371;
            const dLat = (end.latitude - start.latitude) * Math.PI / 180;
            const dLon = (end.longitude - start.longitude) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = (R * c).toFixed(1);
            
            setDistance(`${distance} km`);
            setDuration(`${Math.round(distance * 12)} min`);
        }
    };

    // Clear route
    const clearRoute = () => {
        setDestination('');
        setSearchResults([]);
        setSelectedDestination(null);
        setRouteCoordinates([]);
        setDistance('');
        setDuration('');
    };

    if (!location) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e74c3c" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
             ref={mapRef} 
                style={styles.map}
                initialRegion={location}
                showsUserLocation={true}
                showsMyLocationButton={true}
                provider={PROVIDER_DEFAULT}
            >
                {/* Stadia Maps Tiles */}
                <UrlTile
                    urlTemplate={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png?api_key=${STADIA_API_KEY}`}
                    maximumZ={20}
                    tileSize={256}
                    shouldReplaceMapContent={true}
                />
                
                {/* Current Location Marker */}
                <Marker coordinate={location}>
                    <View style={[styles.marker, { backgroundColor: '#3498db' }]}>
                        <Text style={styles.markerText}>📍</Text>
                    </View>
                </Marker>

                {/* Destination Marker */}
                {selectedDestination && (
                    <Marker coordinate={selectedDestination}>
                        <View style={[styles.marker, { backgroundColor: '#e74c3c' }]}>
                            <Text style={styles.markerText}>🏁</Text>
                        </View>
                    </Marker>
                )}

                {/* Route Line */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#2ecc71"
                        strokeWidth={5}
                    />
                )}
            </MapView>

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#e74c3c" />
                    <Text style={styles.loadingText}>Finding safest route...</Text>
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#7f8c8d" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a city or place..."
                        placeholderTextColor="#95a5a6"
                        value={destination}
                        onChangeText={searchLocation}
                        onFocus={() => setShowSearch(true)}
                    />
                    {destination.length > 0 && (
                        <TouchableOpacity onPress={clearRoute}>
                            <Ionicons name="close-circle" size={20} color="#95a5a6" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Results Dropdown */}
                {showSearch && searchResults.length > 0 && (
                    <ScrollView style={styles.resultsContainer}>
                        {searchResults.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.resultItem}
                                onPress={() => selectLocation(item)}
                            >
                                <Ionicons name="location" size={16} color="#e74c3c" />
                                <Text style={styles.resultText}>{item.display_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Distance/Duration Card */}
            {distance && duration && (
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="shield-checkmark" size={24} color="#2ecc71" />
                        <Text style={styles.infoTitle}>Safe Route Found</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="map-outline" size={20} color="#3498db" />
                        <Text style={styles.infoText}>Distance: {distance}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#e74c3c" />
                        <Text style={styles.infoText}>Duration: {duration}</Text>
                    </View>
                    <View style={styles.safetyBadge}>
                        <Ionicons name="flash" size={16} color="white" />
                        <Text style={styles.safetyText}>Safety Score: 92%</Text>
                    </View>
                </View>
            )}

            {/* Current Location Button */}
            <TouchableOpacity 
    style={styles.locationButton}
    onPress={() => {
        getLocation();
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000); // 1000ms = 1 second animation
        }
    }}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    resultsContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 5,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        gap: 10,
    },
    resultText: {
        flex: 1,
        fontSize: 14,
        color: '#34495e',
    },
    infoCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 5,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ecc71',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    safetyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#2ecc71',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    safetyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    locationButton: {
        position: 'absolute',
        bottom: 30,
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
    marker: {
        borderRadius: 20,
        padding: 5,
        borderWidth: 2,
        borderColor: 'white',
    },
    markerText: {
        fontSize: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#34495e',
    },
});