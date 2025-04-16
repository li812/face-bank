import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, Platform, Image, Alert, Modal } from 'react-native'
import { BlurView } from 'expo-blur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'

const { width, height } = Dimensions.get('window')

const UserMakeTransaction = ({ navigation, username }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [accounts, setAccounts] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    account_number: '',
    receiver_account_number: '',
    receiver_name: '',
    branch_name: '',
    amount: ''
  })
  const [reviewData, setReviewData] = useState(null)
  const [faceVerified, setFaceVerified] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSubmitting, setOtpSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const cameraRef = useRef(null)
  const [facing, setFacing] = useState(CameraType?.front || 'front')

  // Fetch accounts and branches
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const accRes = await axios.get(`${API_URL}/userAccount`, { headers: { Accept: 'application/json' } })
        setAccounts(accRes.data.user_account || [])
        const branchRes = await axios.get(`${API_URL}/branches`, { headers: { Accept: 'application/json' } })
        setBranches(branchRes.data.branches || [])
      } catch (err) {
        setError('Failed to load accounts or branches')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Step navigation
  const nextStep = () => setCurrentStep(s => s + 1)
  const prevStep = () => setCurrentStep(s => s - 1)

  // Form change handler
  const handleChange = (key, value) => setForm({ ...form, [key]: value })

  // Step 5: Review & Confirm
  const handleReview = () => {
    setReviewData({
      ...form,
      sender_account: accounts.find(a => a.id == form.account_number)?.account_number,
      branch: branches.find(b => b.id == form.branch_name)?.branch_name
    })
    nextStep()
  }

  // Step 6: Face Verification
  const handleFaceVerify = async () => {
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
      const formData = new FormData()
      formData.append('username', username)
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'txn_face.jpg'
      })
      const res = await axios.post(`${API_URL}/face_verification/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data && res.data.success) {
        setFaceVerified(true)
        setIsCameraActive(false)
        nextStep()
      } else {
        setError(res.data.message || 'Face verification failed')
      }
    } catch (err) {
      setError('Face verification failed')
    }
    setSubmitting(false)
  }

  // Step 5: Submit transaction (initiate)
  const handleInitiateTransaction = async () => {
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      data.append('receiver_account_number', form.receiver_account_number)
      data.append('receiver_name', form.receiver_name)
      data.append('account_number', form.account_number)
      data.append('branch_name', form.branch_name)
      data.append('amount', form.amount)
      await axios.post(`${API_URL}/initiate_transaction/`, data)
      nextStep() // Go to face verification
    } catch (err) {
      setError('Failed to initiate transaction')
    }
    setSubmitting(false)
  }

  // Step 7: OTP Verification
  const handleOtpVerify = async () => {
    setOtpSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      data.append('otp', otp)
      const res = await axios.post(`${API_URL}/verify_transaction/`, data, {
        headers: { Accept: 'application/json' }
      })
      console.log('OTP verify response:', res.data)
      if (res.data && (res.data.success || res.data.message?.toLowerCase().includes('success'))) {
        setSuccess(true)
      } else {
        setError(res.data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError('Failed to verify OTP')
    }
    setOtpSubmitting(false)
  }

  // Reset on success
  const handleDone = () => {
    setCurrentStep(1)
    setForm({
      account_number: '',
      receiver_account_number: '',
      receiver_name: '',
      branch_name: '',
      amount: ''
    })
    setFaceVerified(false)
    setOtp('')
    setSuccess(false)
    navigation.navigate('Dashboard')
  }

  const handleCancel = () => {
    setCurrentStep(1)
    setForm({
      account_number: '',
      receiver_account_number: '',
      receiver_name: '',
      branch_name: '',
      amount: ''
    })
    setFaceVerified(false)
    setOtp('')
    setSuccess(false)
    setIsCameraActive(false)
    navigation.navigate('Dashboard')
  }

  // Camera permission UI
  if (isCameraActive) {
    if (!permission) return <View />
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.convertButton} onPress={requestPermission}>
            <Text style={styles.convertButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
        <TouchableOpacity style={styles.captureButton} onPress={handleCaptureFace} disabled={submitting}>
          <Text style={styles.captureButtonText}>{submitting ? 'Verifying...' : 'Capture & Verify'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeCameraButton} onPress={() => setIsCameraActive(false)}>
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="send" size={48} color="#00abe9" style={{ marginBottom: 8 }} />
          <Text style={styles.heading}>Send Money</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : (
          <>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {currentStep === 1 && (
              <View style={styles.formCard}>
                <Text style={styles.label}>Select Your Account</Text>
                {accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.optionButton,
                      form.account_number == acc.id && styles.optionButtonSelected
                    ]}
                    onPress={() => handleChange('account_number', acc.id)}
                  >
                    <Text style={{ color: form.account_number == acc.id ? '#fff' : '#00abe9' }}>
                      {acc.account_number} ({acc.account_type}) - ₹{acc.balance}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={nextStep}
                  disabled={!form.account_number}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 2 && (
              <View style={styles.formCard}>
                <Text style={styles.label}>Receiver Account Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Receiver Account Number"
                  keyboardType="numeric"
                  value={form.receiver_account_number}
                  onChangeText={v => handleChange('receiver_account_number', v)}
                />
                <Text style={styles.label}>Receiver Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Receiver Name"
                  value={form.receiver_name}
                  onChangeText={v => handleChange('receiver_name', v)}
                />
                <View style={styles.stepNavRow}>
                  <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                    <Text style={styles.prevButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={nextStep}
                    disabled={!form.receiver_account_number || !form.receiver_name}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 3 && (
              <View style={styles.formCard}>
                <Text style={styles.label}>Select Branch</Text>
                {branches.map(branch => (
                  <TouchableOpacity
                    key={branch.id}
                    style={[
                      styles.optionButton,
                      form.branch_name == branch.id && styles.optionButtonSelected
                    ]}
                    onPress={() => handleChange('branch_name', branch.id)}
                  >
                    <Text style={{ color: form.branch_name == branch.id ? '#fff' : '#00abe9' }}>
                      {branch.branch_name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.stepNavRow}>
                  <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                    <Text style={styles.prevButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={nextStep}
                    disabled={!form.branch_name}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 4 && (
              <View style={styles.formCard}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={form.amount}
                  onChangeText={v => handleChange('amount', v)}
                />
                <View style={styles.stepNavRow}>
                  <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                    <Text style={styles.prevButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleReview}
                    disabled={!form.amount}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 5 && (
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Review & Confirm</Text>
                <Text style={styles.label}>Sender Account: <Text style={styles.value}>{reviewData?.sender_account}</Text></Text>
                <Text style={styles.label}>Receiver Account: <Text style={styles.value}>{form.receiver_account_number}</Text></Text>
                <Text style={styles.label}>Receiver Name: <Text style={styles.value}>{form.receiver_name}</Text></Text>
                <Text style={styles.label}>Branch: <Text style={styles.value}>{reviewData?.branch}</Text></Text>
                <Text style={styles.label}>Amount: <Text style={styles.value}>₹{form.amount}</Text></Text>
                <View style={styles.stepNavRow}>
                  <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                    <Text style={styles.prevButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleInitiateTransaction}
                    disabled={submitting}
                  >
                    <Text style={styles.nextButtonText}>{submitting ? 'Processing...' : 'Confirm & Continue'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 6 && (
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Face Verification</Text>
                <Text style={styles.label}>Please verify your face to proceed.</Text>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleFaceVerify}
                  disabled={submitting}
                >
                  <Text style={styles.nextButtonText}>Start Face Verification</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 7 && (
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>OTP Verification</Text>
                <Text style={styles.label}>Enter the OTP sent to your email.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={setOtp}
                />
                <View style={styles.stepNavRow}>
                  <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                    <Text style={styles.prevButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleOtpVerify}
                    disabled={otpSubmitting || !otp}
                  >
                    <Text style={styles.nextButtonText}>{otpSubmitting ? 'Verifying...' : 'Verify & Complete'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
            {success && (
              <Modal visible={success} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <MaterialIcons name="check-circle" size={64} color="#00abe9" />
                    <Text style={styles.modalTitle}>Transaction Successful!</Text>
                    <TouchableOpacity style={styles.nextButton} onPress={handleDone}>
                      <Text style={styles.nextButtonText}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </>
        )}
      </ScrollView>
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
  label: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 4
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.47)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 110, 157, 0.42)',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  optionButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00abe9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#00abe9',
    borderColor: '#00abe9',
  },
  nextButton: {
    width: '48%',
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
  prevButton: {
    width: '48%',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  prevButtonText: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  stepNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00abe9',
    marginBottom: 10,
    textAlign: 'center'
  },
  value: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20
  },
  captureButton: {
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 10
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  closeCameraButton: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  closeCameraText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#00abe9',
    textAlign: 'center'
  },
  convertButton: {
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  convertButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
})

export default UserMakeTransaction