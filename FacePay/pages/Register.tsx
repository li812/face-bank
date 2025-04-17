import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import ModalSelector from 'react-native-modal-selector'
import axios from 'axios'
import { VideoView, useVideoPlayer } from 'expo-video'
import { API_URL } from '../config'

const { width, height } = Dimensions.get('window')

const genderOptions = [
  { key: 0, label: 'Male' },
  { key: 1, label: 'Female' },
  { key: 2, label: 'Other' },
]

const Register = ({ navigation }: any) => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  
  // Camera state
  const [facing, setFacing] = useState<CameraType>('front')
  const [permission, requestPermission] = useCameraPermissions()
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  // Add a ref for CameraView
  const cameraRef = useRef<CameraView>(null);

  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    gender: 'Male',
    address: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: ''
  })
  
  // Picker focus state
  const [pickerFocused, setPickerFocused] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false)
  
  // Error handling
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  
  // Create video player
  const player = useVideoPlayer(require('../assets/background/bg3.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.playbackRate = 1.0;
    player.play();
  });

  // Enable camera when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      setIsCameraActive(true)
    } else {
      setIsCameraActive(false)
    }
  }, [currentStep])
  
  // Handle form input changes
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }
  
  // Add this function to validate email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Add this function to validate phone
  const isValidPhone = (phone: string) => {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(phone);
  };

  // Move to next step
  const goToNextStep = () => {
    // Step 1: Personal details validation
    if (currentStep === 1) {
      const { username, first_name, last_name, gender, address, email, phone } = formData
      if (!username || !first_name || !last_name || !gender || !address || !email || !phone) {
        setErrorMessage('Please fill all personal details')
        setShowError(true)
        return
      }
      if (!isValidEmail(email)) {
        setErrorMessage('Please enter a valid email address')
        setShowError(true)
        return
      }
      if (!isValidPhone(phone)) {
        setErrorMessage('Please enter a valid phone number')
        setShowError(true)
        return
      }
      setCurrentStep(2)
      return
    }
    // Step 2: Location details validation
    if (currentStep === 2) {
      const { city, state, country } = formData
      if (!city || !state || !country) {
        setErrorMessage('Please fill all location details')
        setShowError(true)
        return
      }
      setCurrentStep(3)
      return
    }
  }

  // Go back to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  // Handle registration submission
  const handleRegister = async () => {
    if (!cameraRef.current) {
      setErrorMessage('Camera not ready');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!photo?.uri) {
        setErrorMessage('Failed to capture photo');
        setShowError(true);
        setLoading(false);
        return;
      }

      // Prepare form data for submission
      const apiFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        apiFormData.append(key, value.toString());
      });
      apiFormData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'face_capture.jpg'
      });

      // Submit to API
      const response = await axios.post(`${API_URL}/register/`, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);

      if (response.data && response.data.message) {
        Alert.alert(
          'Registration Successful',
          response.data.message,
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      let message = 'Registration failed. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      setErrorMessage(message);
      setShowError(true);
    }
  };

  // If camera permission not granted
  if (!permission) return <View />
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required for registration</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <View style={styles.container}>
        {/* Background Video */}
        <VideoView
          player={player}
          style={styles.backgroundVideo}
          contentFit="cover"
        />

        {/* Gradient overlay */}
        <View
          style={[styles.gradient, { backgroundColor: 'rgba(0, 0, 0, 0.67)' }]}
          pointerEvents={Platform.OS === 'ios' && pickerFocused ? 'none' : 'auto'}
        />
        
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Content area */}
              <View style={styles.overlay}>
                <View style={styles.glass}>
                  <Text style={styles.heading}>Register</Text>
                  <Text style={styles.stepIndicator}>Step {currentStep} of 3</Text>
                  
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <View style={styles.formContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.username}
                        onChangeText={(text) => handleChange('username', text)}
                        returnKeyType="next"
                        autoCapitalize="none"
                      />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.first_name}
                        onChangeText={(text) => handleChange('first_name', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.last_name}
                        onChangeText={(text) => handleChange('last_name', text)}
                        returnKeyType="next"
                      />
                      
                      <ModalSelector
                        data={genderOptions}
                        initValue="Select Gender"
                        accessible={true}
                        keyExtractor={item => item.key}
                        labelExtractor={item => item.label}
                        onChange={(option) => handleChange('gender', option.label)}
                      >
                        <TextInput
                          style={styles.input}
                          editable={false}
                          placeholder="Gender"
                          value={formData.gender}
                        />
                      </ModalSelector>


                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        keyboardType="email-address"
                        returnKeyType="next"
                        autoCapitalize="none"
                      />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        keyboardType="phone-pad"
                        returnKeyType="next"
                      />
                      
                      <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.7}
                        onPress={goToNextStep}
                      >
                        <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                          <Text style={styles.buttonText}>Next</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Step 2: Location Details */}
                  {currentStep === 2 && (
                    <View style={styles.formContainer}>

                      <TextInput
                        style={styles.input}
                        placeholder="Address"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        returnKeyType="next"
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.city}
                        onChangeText={(text) => handleChange('city', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="State"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.state}
                        onChangeText={(text) => handleChange('state', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Country"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={formData.country}
                        onChangeText={(text) => handleChange('country', text)}
                        returnKeyType="done"
                      />
                      
                      <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.7}
                        onPress={goToNextStep}
                      >
                        <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                          <Text style={styles.buttonText}>Next</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.buttonOutline}
                        activeOpacity={0.7}
                        onPress={goToPreviousStep}
                      >
                        <Text style={styles.buttonOutlineText}>Back</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Step 3: Face Capture */}
                  {currentStep === 3 && (
                    <View style={styles.formContainer}>
                      <Text style={styles.cameraInstructions}>
                        Please look directly at the camera and ensure your face is clearly visible
                      </Text>
                      <View style={styles.cameraPreviewContainer}>
                        {isCameraActive && (
                          <CameraView
                            ref={cameraRef}
                            style={styles.cameraPreview}
                            facing={facing}
                          />
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
                        activeOpacity={0.7}
                        onPress={handleRegister}
                        disabled={loading}
                      >
                        <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                          {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.buttonText}>Register</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.buttonOutline}
                        activeOpacity={0.7}
                        onPress={goToPreviousStep}
                        disabled={loading}
                      >
                        <Text style={styles.buttonOutlineText}>Back to Location Details</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Footer text */}
          <Text style={styles.footer}>Secure • Fast • Trusted</Text>
          
          {/* Error Modal */}
          <Modal
            visible={showError}
            transparent={true}
            animationType="fade"
          >
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
  safeArea: {
    flex: 1,
    zIndex: 2
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'black' 
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 0
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingVertical: 20
  },
  glass: {
    width: '88%',
    paddingVertical: 30,
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
      android: {
        elevation: 8
      }
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
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
  },
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
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  picker: {
    color: 'white',
    height: 50,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  faceContainer: {
    marginTop: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(0, 171, 233, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  cameraPreview: {
    flex: 1,
  },
  faceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  faceOverlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnailPreview: {
    width: 80,
    height: 80,
  },
  cameraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: 'white',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 10,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  capturePhotoButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  flipCameraButton: {
    position: 'absolute',
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  flipCameraText: {
    color: 'white',
    fontSize: 14,
  },
  closeCameraButton: {
    position: 'absolute',
    left: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeCameraText: {
    color: 'white',
    fontSize: 14,
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
  footer: {
    position: 'absolute',
    bottom: 20,
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

export default Register
