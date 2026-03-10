import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Callout, Circle, Marker, Polyline } from 'react-native-maps';

// Define types
interface LocationType {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface CrimeSpot {
    id: string;
    latitude: number;
    longitude: number;
    severity: number;
    type: string;
}

interface StreetLight {
    id: string;
    latitude: number;
    longitude: number;
    working: boolean;
}

interface RoutePoint {
    latitude: number;
    longitude: number;
}

export default function MapScreen() {
    const [location, setLocation] = useState<LocationType | null>(null);
    const [destination, setDestination] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [safeRoute, setSafeRoute] = useState<RoutePoint[]>([]);
    const [unsafeRoute, setUnsafeRoute] = useState<RoutePoint[]>([]);
    const [crimeSpots, setCrimeSpots] = useState<CrimeSpot[]>([]);
    const [streetLights, setStreetLights] = useState<StreetLight[]>([]);
    const [showCrime, setShowCrime] = useState(true);
    const [showLights, setShowLights] = useState(true);
    const [safetyScore, setSafetyScore] = useState(0);

    // Generate mock data for demo
    useEffect(() => {
        generateMockData();
    }, []);

    const generateMockData = () => {
        // Base coordinates (Mumbai as example)
        const baseLat = 19.0760;
        const baseLng = 72.8777;

        // Generate crime hotspots
        const crimes: CrimeSpot[] = [];
        const crimeTypes = ['Theft', 'Assault', 'Harassment', 'Robbery', 'Pickpocket'];
        for (let i = 0; i < 8; i++) {
            crimes.push({
                id: `crime-${i}`,
                latitude: baseLat + (Math.random() - 0.5) * 0.05,
                longitude: baseLng + (Math.random() - 0.5) * 0.05,
                severity: Math.random(),
                type: crimeTypes[Math.floor(Math.random() * crimeTypes.length)]
            });
        }
        setCrimeSpots(crimes);

        // Generate street lights
        const lights: StreetLight[] = [];
        for (let i = 0; i < 12; i++) {
            lights.push({
                id: `light-${i}`,
                latitude: baseLat + (Math.random() - 0.5) * 0.08,
                longitude: baseLng + (Math.random() - 0.5) * 0.08,
                working: Math.random() > 0.2
            });
        }
        setStreetLights(lights);
    };

    // Get user location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                
                const userLocation = {
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };
                
                setLocation(userLocation);
                
                // Generate routes based on location
                generateRoutes(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude
                );
                
                setSafetyScore(87);
            } catch (error) {
                setErrorMsg('Error getting location');
                console.log(error);
            }
        })();
    }, []);

    const generateRoutes = (startLat: number, startLng: number) => {
        // Safe route (green) - well lit, low crime
        const safe: RoutePoint[] = [
            { latitude: startLat, longitude: startLng },
            { latitude: startLat + 0.005, longitude: startLng + 0.005 },
            { latitude: startLat + 0.01, longitude: startLng + 0.008 },
            { latitude: startLat + 0.015, longitude: startLng + 0.01 },
            { latitude: startLat + 0.02, longitude: startLng + 0.012 },
        ];
        setSafeRoute(safe);

        // Unsafe route (red) - poorly lit, high crime
        const unsafe: RoutePoint[] = [
            { latitude: startLat, longitude: startLng },
            { latitude: startLat - 0.003, longitude: startLng - 0.004 },
            { latitude: startLat - 0.008, longitude: startLng - 0.008 },
            { latitude: startLat - 0.013, longitude: startLng - 0.012 },
            { latitude: startLat - 0.018, longitude: startLng - 0.016 },
        ];
        setUnsafeRoute(unsafe);
    };

    const findSafeRoute = () => {
        if (!destination.trim()) {
            Alert.alert('Error', 'Please enter a destination');
            return;
        }

        Alert.alert(
            'Route Found',
            `Safe route to "${destination}" calculated!\nSafety Score: ${safetyScore}%`,
            [{ text: 'OK' }]
        );
        
        // Randomize safety score for demo
        setSafetyScore(Math.floor(Math.random() * 20) + 75);
    };

    const getCrimeColor = (severity: number) => {
        if (severity > 0.7) return '#e74c3c'; // Red - high crime
        if (severity > 0.3) return '#f39c12'; // Orange - medium crime
        return '#f1c40f'; // Yellow - low crime
    };

    // Show loading state
    if (!location) {
        return (
            <View style={styles.centerContainer}>
                {errorMsg ? (
                    <>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={() => setErrorMsg(null)}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <ActivityIndicator size="large" color="#e74c3c" />
                        <Text style={styles.loadingText}>Getting your location...</Text>
                    </>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ 
                title: 'Safe Route',
                headerRight: () => (
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={() => setShowCrime(!showCrime)}>
                            <Text style={[styles.headerIcon, showCrime && styles.activeIcon]}>⚠️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowLights(!showLights)}>
                            <Text style={[styles.headerIcon, showLights && styles.activeIcon]}>💡</Text>
                        </TouchableOpacity>
                    </View>
                )
            }} />
            
            <MapView 
                style={styles.map} 
                initialRegion={location}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
            >
                {/* User location marker */}
                <Marker 
                    coordinate={location} 
                    title="You are here" 
                    pinColor="#3498db"
                >
                    <View style={styles.userMarker}>
                        <Text style={styles.userMarkerText}>📍</Text>
                    </View>
                </Marker>

                {/* Safe route (green line) */}
                {safeRoute.length > 0 && (
                    <Polyline
                        coordinates={safeRoute}
                        strokeColor="#2ecc71"
                        strokeWidth={6}
                        lineDashPattern={[0]}
                    />
                )}

                {/* Unsafe route (red line) */}
                {unsafeRoute.length > 0 && (
                    <Polyline
                        coordinates={unsafeRoute}
                        strokeColor="#e74c3c"
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
                    />
                )}

                {/* Crime hotspots */}
{showCrime && crimeSpots.map((crime) => (
  <Marker
    key={crime.id}
    coordinate={{ latitude: crime.latitude, longitude: crime.longitude }}
  >
    <View style={[styles.crimeMarker, { backgroundColor: getCrimeColor(crime.severity) }]}>
      <Text style={styles.crimeEmoji}>⚠️</Text>
    </View>
    <Callout>
      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>{crime.type}</Text>
        <Text>Severity: {Math.round(crime.severity * 100)}%</Text>
      </View>
    </Callout>
  </Marker>
))}

{/* Street lights */}
{showLights && streetLights.map((light) => (
    <Marker
        key={light.id}
        coordinate={{ latitude: light.latitude, longitude: light.longitude }}
    >
        <View style={[
            styles.lightMarker, 
            { backgroundColor: light.working ? '#f1c40f' : '#95a5a6' }
        ]}>
            <Text style={styles.lightEmoji}>💡</Text>
        </View>
    </Marker>
))}

                {/* Crime heatmap circles */}
                {showCrime && crimeSpots.map((crime) => (
                    <Circle
                        key={`circle-${crime.id}`}
                        center={{ latitude: crime.latitude, longitude: crime.longitude }}
                        radius={100 * crime.severity}
                        strokeColor={`rgba(231, 76, 60, ${crime.severity * 0.3})`}
                        fillColor={`rgba(231, 76, 60, ${crime.severity * 0.2})`}
                    />
                ))}
            </MapView>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter destination (e.g., Central Park)"
                    placeholderTextColor="#95a5a6"
                    value={destination}
                    onChangeText={setDestination}
                    onSubmitEditing={findSafeRoute}
                />
                <TouchableOpacity 
                    style={styles.searchButton} 
                    onPress={findSafeRoute}
                >
                    <Text style={styles.searchButtonText}>GO</Text>
                </TouchableOpacity>
            </View>

            {/* Safety score card */}
            <View style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                    <Text style={styles.safetyTitle}>Route Safety Score</Text>
                    <Text style={styles.safetyPercentage}>{safetyScore}%</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${safetyScore}%` }]} />
                </View>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                        <Text style={styles.legendText}>Safe route (well-lit)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                        <Text style={styles.legendText}>Unsafe route (avoid)</Text>
                    </View>
                </View>
            </View>

            {/* Layer toggles (mobile) */}
            <View style={styles.layerContainer}>
                <TouchableOpacity 
                    style={[styles.layerButton, showCrime && styles.layerButtonActive]}
                    onPress={() => setShowCrime(!showCrime)}
                >
                    <Text style={styles.layerIcon}>⚠️</Text>
                    <Text style={styles.layerText}>Crime</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.layerButton, showLights && styles.layerButtonActive]}
                    onPress={() => setShowLights(!showLights)}
                >
                    <Text style={styles.layerIcon}>💡</Text>
                    <Text style={styles.layerText}>Lights</Text>
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 10,
        zIndex: 1000,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    searchButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    safetyCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    safetyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    safetyTitle: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    safetyPercentage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2ecc71',
        borderRadius: 4,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    layerContainer: {
        position: 'absolute',
        top: 80,
        right: 20,
        zIndex: 1000,
        gap: 10,
    },
    layerButton: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 60,
        height: 60,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    layerButtonActive: {
        borderColor: '#e74c3c',
        backgroundColor: '#fff5f5',
    },
    layerIcon: {
        fontSize: 20,
    },
    layerText: {
        fontSize: 10,
        marginTop: 2,
        color: '#34495e',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 15,
        marginRight: 10,
    },
    headerIcon: {
        fontSize: 24,
        opacity: 0.5,
    },
    activeIcon: {
        opacity: 1,
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
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: 'white',
    },
    crimeEmoji: {
        fontSize: 16,
    },
    lightMarker: {
        borderRadius: 15,
        padding: 6,
        borderWidth: 2,
        borderColor: 'white',
    },
    lightEmoji: {
        fontSize: 14,
    },
    callout: {
        padding: 10,
        minWidth: 150,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#34495e',
    },
    errorIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});