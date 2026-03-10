import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        // Validation
        if (!email || !password) {
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (!isLogin && !name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (isLogin) {
                // Login logic
                await AsyncStorage.setItem('userEmail', email);
                await AsyncStorage.setItem('isLoggedIn', 'true');
                
                Alert.alert('Success', 'Logged in successfully!');
                router.replace('/(tabs)'); // Go to main app
            } else {
                // Signup logic
                await AsyncStorage.setItem('userEmail', email);
                await AsyncStorage.setItem('userName', name);
                await AsyncStorage.setItem('userPhone', phone || '');
                await AsyncStorage.setItem('isLoggedIn', 'true');
                
                Alert.alert('Success', 'Account created successfully!');
                router.replace('/(tabs)'); // Go to main app
            }
        } catch (error) {
            Alert.alert('Error', 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Coming Soon', `${provider} login will be available soon!`);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setPhone('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.gradient}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logo}>🛡️</Text>
                        </View>
                        <Text style={styles.title}>
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin 
                                ? 'Sign in to continue your safety journey' 
                                : 'Join Suraksha AI to stay protected 24/7'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {!isLogin && (
                            <>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor="#95a5a6"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone Number (optional)"
                                        placeholderTextColor="#95a5a6"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#95a5a6"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#95a5a6"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color="#7f8c8d" 
                                />
                            </TouchableOpacity>
                        </View>

                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#95a5a6"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        )}

                        {isLogin && (
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                            style={styles.authButton}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <LinearGradient
                                    colors={['#e74c3c', '#c0392b']}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.authButtonText}>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            )}
                        </TouchableOpacity>

                        {/* Social Login */}
                        <View style={styles.socialContainer}>
                            <Text style={styles.socialText}>Or continue with</Text>
                            <View style={styles.socialButtons}>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Google')}
                                >
                                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Facebook')}
                                >
                                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Apple')}
                                >
                                    <Ionicons name="logo-apple" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Toggle between Login/Signup */}
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={toggleMode}>
                                <Text style={styles.toggleLink}>
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 30,
    },
    backButton: {
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 20,
        backdropFilter: 'blur(10px)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        color: 'white',
        fontSize: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#e74c3c',
        fontSize: 14,
    },
    authButton: {
        height: 55,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 20,
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    socialContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    socialText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    toggleText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    toggleLink: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: 'bold',
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