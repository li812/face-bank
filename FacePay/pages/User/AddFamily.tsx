import React, { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, Image, Alert, Modal, KeyboardAvoidingView
} from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'
import axios from 'axios'
import { API_URL } from '../../config'

const { width, height } = Dimensions.get('window')

const AddFamily = ({ navigation, route }) => {
  const primaryUsername = route?.params?.username

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
    if (!image) {
      setError('Please capture a face photo')
      setShowError(true)
      return
    }
    setSubmitting(true)
    setError('')
    console.log('Submitting family member for account_username:', primaryUsername)
    try {
      const data = new FormData()
      data.append('username', form.username)
      data.append('account_username', primaryUsername)
      data.append('name', form.name)
      data.append('email', form.email)
      data.append('phone', form.phone)
      data.append('relationship', form.relationship)
      data.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'family_photo.jpg'
      })
      const res = await axios.post(`${API_URL}/register_family/`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' }
      })
      if (res.data && res.data.message?.toLowerCase().includes('success')) {
        Alert.alert('Success', 'Family member registered successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard', { username: primaryUsername }) }
        ])
      } else {
        setError(res.data.message || 'Registration failed')
        setShowError(true)
      }
    } catch (err) {
      setError('Failed to register family member')
      setShowError(true)
    }
    setSubmitting(false)
  }

  // Camera permission UI
  if (isCameraActive) {
    if (!permission) return <View />
    if (!permission.granted) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.errorText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.captureButton} onPress={requestPermission}>
            <Text style={styles.captureButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreviewContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing={facing}
          />
        </View>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCaptureFace}
          disabled={submitting}
        >
          <Text style={styles.captureButtonText}>{submitting ? 'Capturing...' : 'Capture & Use Photo'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeCameraButton}
          onPress={() => setIsCameraActive(false)}
        >
          <Text style={styles.closeCameraText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={styles.gradient} pointerEvents="none" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="group-add" size={48} color="#00abe9" style={{ marginBottom: 8 }} />
            <Text style={styles.heading}>Add Family Member</Text>
            <Text style={styles.stepIndicator}>Step {currentStep} of 2</Text>
          </View>
          {currentStep === 1 && (
            <View style={styles.formCard}>
              <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
              <TextInput
                style={styles.input}
                placeholder="Family Username"
                placeholderTextColor="#888"
                value={form.username}
                onChangeText={v => handleChange('username', v)}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#888"
                value={form.phone}
                onChangeText={v => handleChange('phone', v)}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship"
                placeholderTextColor="#888"
                value={form.relationship}
                onChangeText={v => handleChange('relationship', v)}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next: Face Capture</Text>
              </TouchableOpacity>
            </View>
          )}
          {currentStep === 2 && (
            <View style={styles.formCard}>
              <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
              <Text style={styles.cameraInstructions}>
                Please look directly at the camera and ensure your face is clearly visible.
              </Text>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => {
                      setImage(null)
                      handleStartCamera()
                    }}
                  >
                    <Text style={styles.retakeButtonText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleStartCamera}
                >
                  <Text style={styles.captureButtonText}>Capture Face Photo</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.6 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Add Family Member'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonOutline}
                onPress={prevStep}
                disabled={submitting}
              >
                <Text style={styles.buttonOutlineText}>Back to Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        {/* Error Modal */}
        <Modal visible={showError} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowError(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
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
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
    zIndex: 2,
    minHeight: height,
    paddingBottom: 90,
  },
  headerContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00abe9',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 0,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  stepIndicator: {
    color: 'rgba(0, 171, 233, 0.7)',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center'
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00abe9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,110,157,0.2)',
    color: '#222',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  nextButton: {
    width: '100%',
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  captureButton: {
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%'
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  buttonOutline: {
    width: '100%',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(0,171,233,0.5)',
    borderWidth: 1,
    borderRadius: 16
  },
  buttonOutlineText: {
    color: '#00abe9',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1
  },
  cameraInstructions: {
    color: '#222',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraPreviewContainer: {
    width: '90%',
    maxWidth: 480,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#000'
  },
  cameraPreview: {
    flex: 1,
  },
  closeCameraButton: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10
  },
  closeCameraText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  }
})

export default AddFamily