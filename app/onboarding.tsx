import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Start animations when screen loads
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const features = [
        { icon: '⚠️', text: 'AI Scream Detection' },
        { icon: '🗺️', text: 'Safe Route Planning' },
        { icon: '🛡️', text: 'Digital Protection' },
        { icon: '🚨', text: '24/7 Emergency Alerts' },
    ];

    return (
        <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            
            {/* Animated Logo */}
            <Animated.View style={[
                styles.logoContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <View style={styles.logoGlow}>
                    <Text style={styles.logo}>🛡️</Text>
                </View>
                <Text style={styles.appName}>SURAKSHA AI</Text>
                <Text style={styles.tagline}>Your 24/7 Safety Companion</Text>
            </Animated.View>

            {/* Features List */}
            <Animated.View style={[
                styles.featuresContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                {features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                        </View>
                        <Text style={styles.featureText}>{feature.text}</Text>
                        <View style={styles.checkmark}>
                            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                        </View>
                    </View>
                ))}
            </Animated.View>

            {/* CTA Buttons */}
            <Animated.View style={[
                styles.bottomContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={() => router.push('/register')} 
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#e74c3c', '#c0392b']}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.getStartedText}>GET STARTED</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/login')}
                    style={styles.signInButton}
                >
                    <Text style={styles.signInText}>
                        Already have an account? <Text style={styles.signInBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>

                {/* Terms & Privacy */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoGlow: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        fontSize: 60,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.5,
    },
    featuresContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 20,
        marginVertical: 30,
        backdropFilter: 'blur(10px)',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    featureIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureIcon: {
        fontSize: 20,
    },
    featureText: {
        flex: 1,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    checkmark: {
        marginLeft: 10,
    },
    bottomContainer: {
        width: '100%',
    },
    getStartedButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    getStartedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    signInButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    signInText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    signInBold: {
        color: 'white',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    termsContainer: {
        alignItems: 'center',
    },
    termsText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
    },
    termsLink: {
        color: '#e74c3c',
        textDecorationLine: 'underline',
    },
});