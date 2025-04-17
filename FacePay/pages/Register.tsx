import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'
import { VideoView, useVideoPlayer } from 'expo-video'
import axios from 'axios'
import { API_URL } from '../config'
import ModalSelector from 'react-native-modal-selector'

// Import unified styling
import styleSheet, { colors, typography, layout, components, register } from '../appStyleSheet'
import CrossPlatformBlur from '../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../utils/platformUtils'

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
      const { username, first_name, last_name, gender, email, phone } = formData
      if (!username || !first_name || !last_name || !gender || !email || !phone) {
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
      const { address, city, state, country } = formData
      if (!address ||!city || !state || !country) {
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
      <View style={layout.fullScreen}>
        <Text style={[typography.heading, { color: colors.white, textAlign: 'center', marginTop: 20 }]}>
          Camera permission is required for registration
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
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <View style={layout.fullScreen}>
        {/* Background Video */}
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* Gradient overlay */}
        <View 
          style={[components.gradient, { backgroundColor: 'rgba(0, 0, 0, 0.67)', zIndex: 1 }]}
          pointerEvents={IS_IOS && pickerFocused ? 'none' : 'auto'}
        />
        
        <SafeAreaView style={layout.safeArea}>
          <KeyboardAvoidingView
            behavior={IS_IOS ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Content area */}
              <View style={layout.overlay}>
                <View style={components.glass}>
                  <Text style={typography.mainHeading}>Register</Text>
                  <Text style={register.stepIndicator}>Step {currentStep} of 3</Text>
                  
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <View style={register.formContainer}>
                      <TextInput
                        style={components.input}
                        placeholder="Username"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.username}
                        onChangeText={(text) => handleChange('username', text)}
                        returnKeyType="next"
                        autoCapitalize="none"
                      />
                      
                      <TextInput
                        style={components.input}
                        placeholder="First Name"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.first_name}
                        onChangeText={(text) => handleChange('first_name', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={components.input}
                        placeholder="Last Name"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
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
                        onModalOpen={() => setPickerFocused(true)}
                        onModalClose={() => setPickerFocused(false)}
                      >
                        <TextInput
                          style={components.input}
                          editable={false}
                          placeholder="Gender"
                          value={formData.gender}
                          placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        />
                      </ModalSelector>

                      <TextInput
                        style={components.input}
                        placeholder="Email"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        keyboardType="email-address"
                        returnKeyType="next"
                        autoCapitalize="none"
                      />
                      
                      <TextInput
                        style={components.input}
                        placeholder="Phone Number"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        keyboardType="phone-pad"
                        returnKeyType="next"
                      />
                      
                      <CrossPlatformTouchable
                        style={components.submitButton}
                        onPress={goToNextStep}
                      >
                        <Text style={components.submitButtonText}>Next</Text>
                      </CrossPlatformTouchable>
                    </View>
                  )}
                  
                  {/* Step 2: Location Details */}
                  {currentStep === 2 && (
                    <View style={register.formContainer}>
                      <TextInput
                        style={components.input}
                        placeholder="Address"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        returnKeyType="next"
                      />

                      <TextInput
                        style={components.input}
                        placeholder="City"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.city}
                        onChangeText={(text) => handleChange('city', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={components.input}
                        placeholder="State"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.state}
                        onChangeText={(text) => handleChange('state', text)}
                        returnKeyType="next"
                      />
                      
                      <TextInput
                        style={components.input}
                        placeholder="Country"
                        placeholderTextColor="rgba(0, 0, 0, 0.7)"
                        value={formData.country}
                        onChangeText={(text) => handleChange('country', text)}
                        returnKeyType="done"
                      />
                      
                      <CrossPlatformTouchable
                        style={components.submitButton}
                        onPress={goToNextStep}
                      >
                        <Text style={components.submitButtonText}>Next</Text>
                      </CrossPlatformTouchable>
                      
                      <CrossPlatformTouchable
                        style={components.buttonOutline}
                        onPress={goToPreviousStep}
                      >
                        <Text style={components.buttonOutlineText}>Back</Text>
                      </CrossPlatformTouchable>
                    </View>
                  )}
                  
                  {/* Step 3: Face Capture */}
                  {currentStep === 3 && (
                    <View style={register.formContainer}>
                      <Text style={register.cameraInstructions}>
                        Please look directly at the camera and ensure your face is clearly visible
                      </Text>
                      <View style={register.cameraPreviewContainer}>
                        {isCameraActive && (
                          <CameraView
                            ref={cameraRef}
                            style={register.cameraPreview}
                            facing={facing}
                          />
                        )}
                      </View>
                      <CrossPlatformTouchable
                        style={[components.submitButton, { opacity: loading ? 0.5 : 1 }]}
                        onPress={handleRegister}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={components.submitButtonText}>Register</Text>
                        )}
                      </CrossPlatformTouchable>
                      <CrossPlatformTouchable
                        style={components.buttonOutline}
                        onPress={goToPreviousStep}
                        disabled={loading}
                      >
                        <Text style={components.buttonOutlineText}>Back to Location Details</Text>
                      </CrossPlatformTouchable>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Footer text */}
          <Text style={components.footer}>Secure • Fast • Trusted</Text>
          
          {/* Error Modal */}
          <Modal
            visible={showError}
            transparent={true}
            animationType="fade"
          >
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

export default Register
