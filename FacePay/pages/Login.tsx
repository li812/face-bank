import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { VideoView, useVideoPlayer } from 'expo-video'
import axios from 'axios'
import { API_URL } from '../config'

const { width, height } = Dimensions.get('window')

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
    // Create a direct endpoint for checking family usernames
    try {
      console.log(`[checkUsername] Making API call to check family member...`);
      // Use a dedicated endpoint we'll create for checking family usernames
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

  // Video background
  const player = useVideoPlayer(require('../assets/background/bg2.mp4'), player => {
    player.loop = true
    player.muted = true
    player.playbackRate = 1.0
    player.play()
  })

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
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required for login</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.container}>
        {Platform.OS === 'android' ? (
          <Image source={require('../assets/background/bg2.png')} style={styles.backgroundImage} resizeMode="cover" />
        ) : (
          <VideoView player={player} style={styles.backgroundVideo} contentFit="cover" />
        )}
        <View style={[styles.gradient, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <View style={styles.overlay}>
                <View style={styles.glass}>
                  <Text style={styles.heading}>Login to Face Pay</Text>
                  
                  {currentStep === 1 && (
                    <View style={styles.formContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        returnKeyType="done"
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
                        activeOpacity={0.7}
                        onPress={handleCheckUsername}
                        disabled={loading}
                      >
                        <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                          {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.buttonText}>Next</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {currentStep === 2 && (
                    <View style={styles.formContainer}>
                      {/* Display account type indicator */}
                      <View style={styles.accountTypeIndicator}>
                        <Text style={styles.accountTypeText}>
                          {accountType === 'primary' ? 'Primary Account Login' : 'Family Member Login'}
                        </Text>
                      </View>
                      
                      <Text style={styles.cameraInstructions}>
                        Please look directly at the camera and ensure your face is clearly visible
                      </Text>
                      <View style={styles.cameraPreviewContainer}>
                        {isCameraActive && (
                          <CameraView
                            ref={cameraRef}
                            style={styles.cameraPreview}
                            facing="front"
                          />
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
                        activeOpacity={0.7}
                        onPress={handleFaceVerify}
                        disabled={loading}
                      >
                        <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                          {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.buttonText}>Verify</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.buttonOutline}
                        activeOpacity={0.7}
                        onPress={() => setCurrentStep(1)}
                        disabled={loading}
                      >
                        <Text style={styles.buttonOutlineText}>Back</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={styles.buttonOutline}
                    activeOpacity={0.7}
                    onPress={() => navigation && navigation.navigate('Home')}
                  >
                    <Text style={styles.buttonOutlineText}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          
          <Text style={styles.footer}>Secure • Fast • Trusted</Text>
          
          {/* Error Modal */}
          <Modal visible={showError} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalMessage}>{errorMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowError(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, zIndex: 2 },
  container: { flex: 1, position: 'relative', backgroundColor: 'black' },
  backgroundVideo: { position: 'absolute', top: 0, left: 0, width, height, zIndex: 0 },
  backgroundImage: { position: 'absolute', top: 0, left: 0, width, height, zIndex: 0 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  glass: {
    width: '88%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 30, 40, 0.25)',
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        backdropFilter: 'blur(16px)'
      },
      android: { elevation: 8 }
    })
  },
  heading: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'Roboto'
  },
  formContainer: { width: '100%' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  accountTypeIndicator: {
    backgroundColor: 'rgba(0, 171, 233, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 171, 233, 0.4)',
  },
  accountTypeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  },
  buttonOutline: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 16
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  },
  cameraInstructions: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  cameraPreviewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  cameraPreview: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    letterSpacing: 1,
    zIndex: 3,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  modalButton: {
    backgroundColor: 'rgb(0, 171, 233)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  }
})

export default Login