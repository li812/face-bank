import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Platform, 
  Image, 
  Alert, 
  Modal, 
  KeyboardAvoidingView,
  StyleSheet,
  TouchableNativeFeedback
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'
import axios from 'axios'
import { API_URL } from '../../config'
import { useFocusEffect } from '@react-navigation/native'

// Import the unified stylesheet
import styleSheet, { colors, typography, layout, components, camera, PLATFORM } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const AddFamily = ({ navigation, route }) => {
  // 1. Add debugging to see what's being passed
  console.log('Route params:', route?.params);
  
  // 2. Get username from route params or fallback to navigation state
  const primaryUsername = route?.params?.username || 
                         (navigation.getState()?.routes?.find(r => r.name === 'AddFamily')?.params?.username);
  
  // 3. Log primaryUsername to verify it's correct
  console.log('primaryUsername:', primaryUsername);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    relationship: ''
  })
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)

  // Camera state
  const [permission, requestPermission] = useCameraPermissions()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const cameraRef = useRef(null)
  const [facing, setFacing] = useState(CameraType?.front || 'front')

  // Step navigation
  const nextStep = () => setCurrentStep(s => s + 1)
  const prevStep = () => setCurrentStep(s => s - 1)

  // Form change handler
  const handleChange = (key, value) => setForm({ ...form, [key]: value })

  // Define a function to reset the form
  const resetForm = () => {
    setCurrentStep(1)
    setForm({
      username: '',
      name: '',
      email: '',
      phone: '',
      relationship: ''
    })
    setImage(null)
    setError('')
    setShowError(false)
    setSubmitting(false)
    setIsCameraActive(false)
  }
  
  // Use useFocusEffect to reset when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("AddFamily screen in focus - resetting form");
      resetForm();
      
      // Optional: Return a cleanup function if needed
      return () => {
        // Any cleanup code if necessary
      };
    }, []) // Empty dependency array means this runs every time the screen is focused
  );

  // 4. Add validation early - keep this after useFocusEffect to ensure it runs after form reset
  useEffect(() => {
    if (!primaryUsername) {
      Alert.alert(
        "Error", 
        "Missing primary account username. Please try again.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [primaryUsername]);

  // Step 1: Validate and go to face capture
  const handleNext = () => {
    if (!form.username || !form.name || !form.email || !form.phone || !form.relationship) {
      setError('Please fill all fields')
      setShowError(true)
      return
    }
    nextStep()
  }

  // Step 2: Camera logic
  const handleStartCamera = async () => {
    if (!permission?.granted) {
      await requestPermission()
      return
    }
    setIsCameraActive(true)
  }

  const handleCaptureFace = async () => {
    if (!cameraRef.current) return
    setSubmitting(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 })
      if (!photo?.uri) {
        setError('Failed to capture photo')
        setShowError(true)
        setSubmitting(false)
        return
      }
      setImage(photo)
      setIsCameraActive(false)
    } catch (err) {
      setError('Failed to capture photo')
      setShowError(true)
    }
    setSubmitting(false)
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!primaryUsername) {
      setError('Missing primary account username')
      setShowError(true)
      return
    }
    
    if (!image) {
      setError('Please capture a face photo')
      setShowError(true)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      data.append('username', form.username)
      data.append('account_username', primaryUsername) // <-- main user's username
      data.append('name', form.name)
      data.append('email', form.email)
      data.append('phone', form.phone)
      data.append('relationship', form.relationship)
      data.append('image', {
        uri: image.uri,
        type: image.uri.endsWith('.png') ? 'image/png' : 'image/jpeg',
        name: 'family_photo' + (image.uri.endsWith('.png') ? '.png' : '.jpg')
      })

      console.log('POSTing to:', `${API_URL}/api/mobile_register_family/`)
      console.log('Form data:', JSON.stringify({
        username: form.username,
        account_username: primaryUsername,
        name: form.name,
        email: form.email,
        phone: form.phone,
        relationship: form.relationship,
        image: image.uri.substring(0, 30) + '...' // Just log part of the URI to keep logs manageable
      }))

      try {
        const res = await axios.post(`${API_URL}/api/mobile_register_family/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json'
          }
        })
        
        console.log('Response status:', res.status)
        console.log('Response data:', JSON.stringify(res.data))

        if (res.data && res.data.message?.toLowerCase().includes('success')) {
          Alert.alert('Success', 'Family member registered successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Dashboard', { username: primaryUsername }) }
          ])
        } else {
          setError(res.data.message || 'Registration failed')
          setShowError(true)
        }
      } catch (error) {
        console.error('Axios error:', error.message)
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', JSON.stringify(error.response.data))
          console.error('Error response status:', error.response.status)
          console.error('Error response headers:', JSON.stringify(error.response.headers))
          
          // Extract the specific error message from the response if available
          const errorMessage = error.response.data?.message || error.message
          setError(errorMessage)
          setShowError(true)
          
          // Clear form if this is a "family member limit" error
          if (errorMessage.includes("You can only add one family member")) {
            // Reset form data
            setForm({
              username: '',
              name: '',
              email: '',
              phone: '',
              relationship: ''
            });
            // Reset image
            setImage(null);
            // Return to step 1
            setCurrentStep(1);
          }
          
          return // Stop execution and don't rethrow
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request)
          setError('Network error. Please check your connection.')
          setShowError(true)
          return // Stop execution and don't rethrow
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error config:', error.config)
          setError('Request configuration error')
          setShowError(true)
          return // Stop execution and don't rethrow
        }
        throw error; // Only rethrow if none of the above conditions are met
      }
    } catch (err) {
      console.error('Outer error:', err.message)
      setError(`Failed to register family member: ${err.message}`)
      setShowError(true)
    }
    setSubmitting(false)
  }

  // Camera permission UI
  if (isCameraActive) {
    if (!permission) return <View />
    if (!permission.granted) {
      return (
        <View style={camera.cameraContainer}>
          <Text style={components.errorText}>Camera permission is required</Text>
          <TouchableOpacity style={camera.captureButton} onPress={requestPermission}>
            <Text style={camera.captureButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={camera.cameraContainer}>
        <View style={camera.cameraPreviewContainer}>
          <CameraView
            ref={cameraRef}
            style={camera.cameraPreview}
            facing={facing}
          />
        </View>
        <TouchableOpacity
          style={camera.captureButton}
          onPress={handleCaptureFace}
          disabled={submitting}
        >
          <Text style={camera.captureButtonText}>{submitting ? 'Capturing...' : 'Capture & Use Photo'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={camera.closeCameraButton}
          onPress={() => setIsCameraActive(false)}
        >
          <Text style={camera.closeCameraText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={components.gradient} pointerEvents="none" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={layout.container} keyboardShouldPersistTaps="handled">
          <View style={components.headerContainer}>
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="group-add" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={typography.heading}>Add Family Member</Text>
            <Text style={styles.stepIndicator}>Step {currentStep} of 2</Text>
          </View>
          {currentStep === 1 && (
            <View style={components.formCard}>
              <CrossPlatformBlur intensity={80} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.1)" />
              <TextInput
                style={components.input}
                placeholder="Family Username"
                placeholderTextColor="#888"
                value={form.username}
                onChangeText={v => handleChange('username', v)}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                style={components.input}
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                returnKeyType="next"
              />
              <TextInput
                style={components.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <TextInput
                style={components.input}
                placeholder="Phone"
                placeholderTextColor="#888"
                value={form.phone}
                onChangeText={v => handleChange('phone', v)}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              <TextInput
                style={components.input}
                placeholder="Relationship"
                placeholderTextColor="#888"
                value={form.relationship}
                onChangeText={v => handleChange('relationship', v)}
                returnKeyType="done"
              />
              <CrossPlatformTouchable
                style={components.submitButton}
                onPress={handleNext}
                background={!IS_IOS ? TouchableNativeFeedback.Ripple('#fff', false) : undefined}
              >
                <Text style={components.submitButtonText}>Next: Face Capture</Text>
              </CrossPlatformTouchable>
            </View>
          )}
          {currentStep === 2 && (
            <View style={components.formCard}>
              <CrossPlatformBlur intensity={80} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.1)" />
              <Text style={camera.cameraInstructions}>
                Please look directly at the camera and ensure your face is clearly visible.
              </Text>
              {image ? (
                <View style={camera.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={camera.imagePreview} />
                  <CrossPlatformTouchable
                    style={camera.retakeButton}
                    onPress={() => {
                      setImage(null)
                      handleStartCamera()
                    }}
                  >
                    <Text style={camera.retakeButtonText}>Retake Photo</Text>
                  </CrossPlatformTouchable>
                </View>
              ) : (
                <CrossPlatformTouchable
                  style={camera.captureButton}
                  onPress={handleStartCamera}
                  background={!IS_IOS ? TouchableNativeFeedback.Ripple('#fff', false) : undefined}
                >
                  <Text style={camera.captureButtonText}>Capture Face Photo</Text>
                </CrossPlatformTouchable>
              )}
              <CrossPlatformTouchable
                style={[components.submitButton, { opacity: submitting ? 0.6 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
                background={!IS_IOS ? TouchableNativeFeedback.Ripple('#fff', false) : undefined}
              >
                <Text style={components.submitButtonText}>{submitting ? 'Submitting...' : 'Add Family Member'}</Text>
              </CrossPlatformTouchable>
              <CrossPlatformTouchable
                style={components.buttonOutline}
                onPress={prevStep}
                disabled={submitting}
                background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
              >
                <Text style={components.buttonOutlineText}>Back to Details</Text>
              </CrossPlatformTouchable>
            </View>
          )}
        </ScrollView>
        {/* Error Modal */}
        <Modal visible={showError} transparent={true} animationType="fade">
          <View style={components.modalOverlay}>
            <View style={components.modalContainer}>
              <Text style={components.modalTitle}>Error</Text>
              <Text style={components.modalMessage}>{error}</Text>
              <CrossPlatformTouchable
                style={components.modalButton}
                onPress={() => setShowError(false)}
                background={!IS_IOS ? TouchableNativeFeedback.Ripple('#fff', false) : undefined}
              >
                <Text style={components.modalButtonText}>OK</Text>
              </CrossPlatformTouchable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// Only define styles that aren't in the global style sheet
const styles = StyleSheet.create({
  stepIndicator: {
    color: 'rgba(0, 171, 233, 0.7)',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
});

export default AddFamily

