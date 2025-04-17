import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Image,
  StyleSheet,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { VideoView, useVideoPlayer } from 'expo-video' // Import VideoView and useVideoPlayer
import axios from 'axios'
import { API_URL } from '../config'

// Import unified styling
import styleSheet, { colors, typography, layout, components, login } from '../appStyleSheet'
import CrossPlatformBlur from '../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../utils/platformUtils'

// Check if username exists in either primary user or family member tables
const checkUsername = async (username) => {
  console.log(`[checkUsername] Checking if username exists: ${username}`);
  
  try {
    // First check if username exists in primary users
    console.log(`[checkUsername] Checking primary user database...`);
    const primaryResponse = await axios.post(`${API_URL}/check_username/`, { username });
    
    console.log(`[checkUsername] Primary check response:`, primaryResponse.data);
    
    if (primaryResponse.data.exists) {
      console.log(`[checkUsername] Found in primary users!`);
      return { exists: true, type: 'primary' };
    }
    
    console.log(`[checkUsername] Not found in primary users, checking family members...`);
    
    // If not found in primary users, we need to check family members
    try {
      console.log(`[checkUsername] Making API call to check family member...`);
      // Use a dedicated endpoint for checking family usernames
      const familyResponse = await axios.post(`${API_URL}/check_family_username/`, { username });
      
      console.log(`[checkUsername] Family check response:`, familyResponse.data);
      
      if (familyResponse.data.exists) {
        console.log(`[checkUsername] Found in family members!`);
        return { exists: true, type: 'family' };
      } else {
        console.log(`[checkUsername] Not found in family members either.`);
        return { exists: false, type: null };
      }
    } catch (err) {
      // Fall back to the old method if our new endpoint isn't available yet
      console.log(`[checkUsername] Error checking family member, falling back to error analysis:`, err.message);
      
      // Create a FormData object for the fallback method
      const familyCheckFormData = new FormData();
      familyCheckFormData.append('username', username);
      
      try {
        // We don't send an actual image - this call will fail but let us know if user exists
        const fallbackResponse = await axios.post(`${API_URL}/family_login/`, familyCheckFormData);
        console.log(`[checkUsername] Fallback check unexpected success:`, fallbackResponse.data);
        return { exists: false, type: null };
      } catch (fallbackErr) {
        console.log(`[checkUsername] Fallback check error:`, fallbackErr.response?.data);
        
        // Check if error response contains data that helps us identify if user exists
        if (fallbackErr.response?.data) {
          const errorMsg = fallbackErr.response.data.message || '';
          console.log(`[checkUsername] Analyzing error message: "${errorMsg}"`);
          
          if (errorMsg.includes('not found') || 
              errorMsg.includes('does not exist') || 
              errorMsg.includes('Invalid data')) {
            console.log(`[checkUsername] Error confirms user doesn't exist`);
            return { exists: false, type: null };
          } 
          
          if (errorMsg.includes('image') || 
              errorMsg.includes('required') || 
              errorMsg.includes('missing')) {
            console.log(`[checkUsername] Error suggests user exists but image is missing`);
            return { exists: true, type: 'family' };
          }
        }
      }
    }
    
    console.log(`[checkUsername] Could not determine if user exists, defaulting to not found`);
    return { exists: false, type: null };
    
  } catch (error) {
    console.error('[checkUsername] Fatal error:', error?.response?.data, error?.message);
    throw error;
  }
};

const Login = ({ navigation }: any) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [username, setUsername] = useState('')
  const [accountType, setAccountType] = useState(null) // 'primary' or 'family'
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)
  
  // Create a video player using the same approach as Register.tsx
  const player = useVideoPlayer(require('../assets/background/bg2.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.playbackRate = 1.0;
    player.play();
  });
  
  // For backward compatibility, keep the videoRef for now
  const videoRef = useRef(null)

  // Step 1: Check username and determine account type
  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setErrorMessage('Please enter your username')
      setShowError(true)
      return
    }
    setLoading(true)
    try {
      const { exists, type } = await checkUsername(username)
      if (exists) {
        setAccountType(type)
        setCurrentStep(2)
        setIsCameraActive(true)
      } else {
        setErrorMessage('Username not found')
        setShowError(true)
      }
    } catch (error) {
      setErrorMessage('Network or server error')
      setShowError(true)
    }
    setLoading(false)
  }

  // Step 2: Face verification - use different endpoints based on account type
  const handleFaceVerify = async () => {
    if (!cameraRef.current) {
      setErrorMessage('Camera not ready')
      setShowError(true)
      return
    }
    
    setLoading(true)
    
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 })
      
      if (!photo?.uri) {
        setErrorMessage('Failed to capture photo')
        setShowError(true)
        setLoading(false)
        return
      }
      
      const formData = new FormData()
      formData.append('username', username)
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'login_photo.jpg'
      })
      
      // Choose API endpoint based on account type
      const endpoint = accountType === 'primary' ? '/login/' : '/family_login/';
      console.log(`Attempting ${accountType} login at endpoint: ${endpoint}`);
      
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setLoading(false)
      
      if (response.data && response.data.redirect) {
        // Navigate to the appropriate dashboard
        navigation.reset({
          index: 0,
          routes: [{ 
            name: accountType === 'primary' ? 'UserBase' : 'FamilyBase',
            params: { username }
          }],
        });
      } else {
        setErrorMessage(response.data.message || 'Face verification failed')
        setShowError(true)
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      setLoading(false)
      setErrorMessage('Login failed. Please try again.')
      setShowError(true)
    }
  }

  // Camera permission
  if (!permission) return <View />
  if (!permission.granted) {
    return (
      <View style={layout.fullScreen}>
        <Text style={[typography.heading, { color: colors.white, textAlign: 'center', marginTop: 20 }]}>
          Camera permission is required for login
        </Text>
        <CrossPlatformTouchable 
          style={[components.submitButton, { width: '80%', marginTop: 20 }]}
          onPress={requestPermission}
        >
          <Text style={components.submitButtonText}>Grant Permission</Text>
        </CrossPlatformTouchable>
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={layout.fullScreen}>
        {/* Use the same approach as Register.tsx - VideoView with useVideoPlayer */}
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        
        <View style={[components.gradient, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }]} />
        
        <SafeAreaView style={layout.safeArea}>
          <KeyboardAvoidingView
            behavior={IS_IOS ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <View style={layout.overlay}>
                <View style={components.glass}>
                  <Text style={typography.mainHeading}>Sign in {'\n'}Face Pay{'\n'}{'\n'}
                  </Text>
                  
                  {currentStep === 1 && (
                    <View style={{ width: '100%' }}>
                      <TextInput
                        style={components.input}
                        placeholder="Enter your username"
                        placeholderTextColor="rgba(83, 83, 83, 0.54)"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        returnKeyType="done"
                        editable={!loading}
                      />
                      <CrossPlatformTouchable
                        style={[components.submitButton, { opacity: loading ? 0.5 : 1 }]}
                        onPress={handleCheckUsername}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={components.submitButtonText}>Next</Text>
                        )}
                      </CrossPlatformTouchable>
                    </View>
                  )}
                  
                  {currentStep === 2 && (
                    <View style={{ width: '100%' }}>
                      {/* Display account type indicator */}
                      <View style={login.accountTypeIndicator}>
                        <Text style={login.accountTypeText}>
                          {accountType === 'primary' ? 'Primary Account Login' : 'Family Member Login'}
                        </Text>
                      </View>
                      
                      <Text style={login.cameraInstructions}>
                        Please look directly at the camera and ensure your face is clearly visible
                      </Text>
                      <View style={login.cameraPreviewContainer}>
                        {isCameraActive && (
                          <CameraView
                            ref={cameraRef}
                            style={login.cameraPreview}
                            facing="front"
                          />
                        )}
                      </View>
                      <CrossPlatformTouchable
                        style={[components.submitButton, { opacity: loading ? 0.5 : 1 }]}
                        onPress={handleFaceVerify}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={components.submitButtonText}>Verify</Text>
                        )}
                      </CrossPlatformTouchable>
                      <CrossPlatformTouchable
                        style={components.buttonOutline}
                        onPress={() => setCurrentStep(1)}
                        disabled={loading}
                      >
                        <Text style={components.buttonOutlineText}>Back</Text>
                      </CrossPlatformTouchable>
                    </View>
                  )}
                  
                  <CrossPlatformTouchable
                    style={components.buttonOutline}
                    onPress={() => navigation && navigation.navigate('Home')}
                  >
                    <Text style={components.buttonOutlineText}>Back to Home</Text>
                  </CrossPlatformTouchable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          
          <Text style={components.footer}>Secure • Fast • Trusted</Text>
          
          {/* Error Modal */}
          <Modal visible={showError} transparent={true} animationType="fade">
            <View style={components.modalOverlay}>
              <View style={components.modalContainer}>
                <Text style={components.modalTitle}>Error</Text>
                <Text style={components.modalMessage}>{errorMessage}</Text>
                <CrossPlatformTouchable
                  style={components.modalButton}
                  onPress={() => setShowError(false)}
                >
                  <Text style={components.modalButtonText}>OK</Text>
                </CrossPlatformTouchable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </>
  )
}

export default Login