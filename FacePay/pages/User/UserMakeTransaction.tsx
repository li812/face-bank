import React, { useEffect, useRef, useState, useCallback } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  Dimensions, 
  Platform, 
  Image, 
  Alert, 
  Modal 
} from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'
import { useFocusEffect } from '@react-navigation/native'

// Import unified styling
import styleSheet, { 
  colors, 
  typography, 
  layout, 
  components, 
  camera, 
  transaction 
} from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

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
  const [renderKey, setRenderKey] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const accRes = await axios.get(`${API_URL}/userAccount`, { 
        headers: { Accept: 'application/json' } 
      })
      const userAccounts = accRes.data.user_account || [];
      setAccounts(userAccounts)
      
      const branchRes = await axios.get(`${API_URL}/branches`, { 
        headers: { Accept: 'application/json' } 
      })
      const allBranches = branchRes.data.branches || [];
      
      const userBranchNames = new Set(userAccounts.map(acc => acc.branch_name));
      
      const userBranches = allBranches.filter(branch => 
        userBranchNames.has(branch.branch_name)
      );
      
      console.log(`Filtered to ${userBranches.length} branches out of ${allBranches.length} total branches`);
      setBranches(userBranches)
      setError('')
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load accounts or branches')
    }
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      console.log("Transaction screen in focus - refreshing data");
      setRenderKey(prevKey => prevKey + 1);
      fetchData();
      
      return () => {
        // Any cleanup code if necessary
      };
    }, []) 
  );

  const nextStep = () => setCurrentStep(s => s + 1)
  const prevStep = () => setCurrentStep(s => s - 1)

  const handleChange = (key, value) => setForm({ ...form, [key]: value })

  const handleReview = () => {
    setReviewData({
      ...form,
      sender_account: accounts.find(a => a.id == form.account_number)?.account_number,
      branch: branches.find(b => b.id == form.branch_name)?.branch_name
    })
    nextStep()
  }

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
      
      console.log('Face verification response:', res.data);
      
      if (res.data && res.data.success) {
        setFaceVerified(true)
        setIsCameraActive(false)
        nextStep()
      } else {
        setIsCameraActive(false)
        const errorMsg = res.data?.message || 'Face verification failed';
        Alert.alert(
          'Verification Failed',
          errorMsg,
          [
            { 
              text: 'Cancel Transaction', 
              style: 'cancel',
              onPress: () => handleCancel() 
            },
            { 
              text: 'Try Again', 
              onPress: () => setIsCameraActive(true) 
            }
          ]
        )
        setError(errorMsg)
      }
    } catch (err) {
      setIsCameraActive(false)
      const errorMsg = 'Face verification failed. Please try again or cancel the transaction.';
      Alert.alert(
        'Verification Error',
        errorMsg,
        [
          { 
            text: 'Cancel Transaction', 
            style: 'cancel',
            onPress: () => handleCancel() 
          },
          { 
            text: 'Try Again', 
            onPress: () => setIsCameraActive(true) 
          }
        ]
      )
      setError(errorMsg)
    }
    setSubmitting(false)
  }

  const handleInitiateTransaction = async () => {
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      data.append('receiver_account_number', String(form.receiver_account_number))
      data.append('receiver_name', String(form.receiver_name))
      data.append('account_number', String(form.account_number))
      data.append('branch_name', String(form.branch_name))
      data.append('amount', String(form.amount)
      )
      console.log('Sending data:', {
        receiver_account_number: form.receiver_account_number,
        receiver_name: form.receiver_name,
        account_number: form.account_number,
        branch_name: form.branch_name,
        amount: form.amount
      });

      const res = await axios.post(`${API_URL}/initiate_transaction/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      })
      
      console.log('Response:', res.data);
      
      nextStep()
    } catch (err) {
      console.error('Transaction error:', err.message);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(`Failed to initiate transaction: ${err.response.data.message || err.message}`);
      } else {
        setError('Failed to initiate transaction. Please check your connection.');
      }
    }
    setSubmitting(false)
  }

  const handleOtpVerify = async () => {
    setOtpSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      data.append('otp', String(otp))

      console.log('Sending OTP data:', {
        otp: otp
      });

      const res = await axios.post(`${API_URL}/verify_transaction/`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json' 
        }
      })
      
      console.log('OTP Response:', res.data);
      
      if (res.data && (res.data.success || res.data.message?.toLowerCase().includes('success'))) {
        setSuccess(true)
      } else {
        setError(res.data.message || 'Invalid OTP')
      }
    } catch (err) {
      console.error('OTP verification error:', err.message);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(`Failed to verify OTP: ${err.response.data.message || err.message}`);
      } else {
        setError('Failed to verify OTP. Please check your connection.');
      }
    }
    setOtpSubmitting(false)
  }

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

  if (isCameraActive) {
    if (!permission) return <View />
    if (!permission.granted) {
      return (
        <View style={layout.container}>
          <Text style={components.errorText}>Camera permission is required</Text>
          <CrossPlatformTouchable 
            style={components.submitButton} 
            onPress={requestPermission}
          >
            <Text style={components.submitButtonText}>Grant Permission</Text>
          </CrossPlatformTouchable>
        </View>
      )
    }
    return (
      <View style={[camera.cameraContainer, { zIndex: 999 }]}>
        <Image
          source={require('../../assets/background/bg1.png')}
          style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
          resizeMode="cover"
          pointerEvents="none"
        />
        <StatusBar style="light" backgroundColor="rgba(0,0,0,0.7)" translucent />
        <SafeAreaView style={{ flex: 1, width: '100%' }}>
          <View style={camera.cameraHeader}>
            <Text style={camera.cameraTitle}>Face Verification</Text>
          </View>
          <View style={camera.cameraPreviewContainer}>
            <CameraView
              ref={cameraRef}
              style={camera.cameraPreview}
              facing={facing}
            />
          </View>
          <View style={camera.cameraControls}>
            <CrossPlatformTouchable 
              style={camera.captureButton} 
              onPress={handleCaptureFace} 
              disabled={submitting}
            >
              <Text style={camera.captureButtonText}>
                {submitting ? 'Verifying...' : 'Capture & Verify'}
              </Text>
            </CrossPlatformTouchable>
            <CrossPlatformTouchable 
              style={camera.closeCameraButton} 
              onPress={() => setIsCameraActive(false)}
            >
              <Text style={camera.closeCameraText}>Cancel</Text>
            </CrossPlatformTouchable>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <SafeAreaView key={renderKey} style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={components.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={layout.container}>
        <View style={components.headerContainer}>
          <CrossPlatformBlur 
            intensity={100} 
            tint="light" 
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.15)" 
          />
          <MaterialIcons name="send" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={typography.heading}>Send Money</Text>
          <Text style={transaction.stepIndicator}>Step {currentStep} of 7</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : (
          <>
            {error ? <Text style={components.errorText}>{error}</Text> : null}
            {currentStep === 1 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={typography.label}>Select Your Account</Text>
                {accounts.map(acc => (
                  <CrossPlatformTouchable
                    key={acc.id}
                    style={[
                      transaction.optionButton,
                      form.account_number == acc.id && transaction.optionButtonSelected
                    ]}
                    onPress={() => handleChange('account_number', acc.id)}
                  >
                    <Text style={{ 
                      color: form.account_number == acc.id ? colors.white : colors.primary,
                      fontFamily: FONT_FAMILY.medium
                    }}>
                      {acc.account_number} ({acc.account_type}) - ₹{acc.balance}
                    </Text>
                  </CrossPlatformTouchable>
                ))}
                <CrossPlatformTouchable
                  style={transaction.nextButton}
                  onPress={nextStep}
                  disabled={!form.account_number}
                >
                  <Text style={transaction.nextButtonText}>Next</Text>
                </CrossPlatformTouchable>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 2 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={typography.label}>Receiver Account Number</Text>
                <TextInput
                  style={components.input}
                  placeholder="Receiver Account Number"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={form.receiver_account_number}
                  onChangeText={v => handleChange('receiver_account_number', v)}
                />
                <Text style={typography.label}>Receiver Name</Text>
                <TextInput
                  style={components.input}
                  placeholder="Receiver Name"
                  placeholderTextColor="#888"
                  value={form.receiver_name}
                  onChangeText={v => handleChange('receiver_name', v)}
                />
                <View style={transaction.stepNavRow}>
                  <CrossPlatformTouchable style={transaction.prevButton} onPress={prevStep}>
                    <Text style={transaction.prevButtonText}>Back</Text>
                  </CrossPlatformTouchable>
                  <CrossPlatformTouchable
                    style={transaction.nextButton}
                    onPress={nextStep}
                    disabled={!form.receiver_account_number || !form.receiver_name}
                  >
                    <Text style={transaction.nextButtonText}>Next</Text>
                  </CrossPlatformTouchable>
                </View>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 3 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={typography.label}>Select Branch</Text>
                {branches.map(branch => (
                  <CrossPlatformTouchable
                    key={branch.id}
                    style={[
                      transaction.optionButton,
                      form.branch_name == branch.id && transaction.optionButtonSelected
                    ]}
                    onPress={() => handleChange('branch_name', branch.id)}
                  >
                    <Text style={{ 
                      color: form.branch_name == branch.id ? colors.white : colors.primary,
                      fontFamily: FONT_FAMILY.medium
                    }}>
                      {branch.branch_name}
                    </Text>
                  </CrossPlatformTouchable>
                ))}
                <View style={transaction.stepNavRow}>
                  <CrossPlatformTouchable style={transaction.prevButton} onPress={prevStep}>
                    <Text style={transaction.prevButtonText}>Back</Text>
                  </CrossPlatformTouchable>
                  <CrossPlatformTouchable
                    style={transaction.nextButton}
                    onPress={nextStep}
                    disabled={!form.branch_name}
                  >
                    <Text style={transaction.nextButtonText}>Next</Text>
                  </CrossPlatformTouchable>
                </View>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 4 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={typography.label}>Amount</Text>
                <TextInput
                  style={components.input}
                  placeholder="Amount"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={form.amount}
                  onChangeText={v => handleChange('amount', v)}
                />
                <View style={transaction.stepNavRow}>
                  <CrossPlatformTouchable style={transaction.prevButton} onPress={prevStep}>
                    <Text style={transaction.prevButtonText}>Back</Text>
                  </CrossPlatformTouchable>
                  <CrossPlatformTouchable
                    style={transaction.nextButton}
                    onPress={handleReview}
                    disabled={!form.amount}
                  >
                    <Text style={transaction.nextButtonText}>Next</Text>
                  </CrossPlatformTouchable>
                </View>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 5 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={transaction.sectionTitle}>Review & Confirm</Text>
                <Text style={typography.label}>Sender Account: <Text style={transaction.value}>{reviewData?.sender_account}</Text></Text>
                <Text style={typography.label}>Receiver Account: <Text style={transaction.value}>{form.receiver_account_number}</Text></Text>
                <Text style={typography.label}>Receiver Name: <Text style={transaction.value}>{form.receiver_name}</Text></Text>
                <Text style={typography.label}>Branch: <Text style={transaction.value}>{reviewData?.branch}</Text></Text>
                <Text style={typography.label}>Amount: <Text style={transaction.value}>₹{form.amount}</Text></Text>
                <View style={transaction.stepNavRow}>
                  <CrossPlatformTouchable style={transaction.prevButton} onPress={prevStep}>
                    <Text style={transaction.prevButtonText}>Back</Text>
                  </CrossPlatformTouchable>
                  <CrossPlatformTouchable
                    style={transaction.nextButton}
                    onPress={handleInitiateTransaction}
                    disabled={submitting}
                  >
                    <Text style={transaction.nextButtonText}>
                      {submitting ? 'Processing...' : 'Confirm & Continue'}
                    </Text>
                  </CrossPlatformTouchable>
                </View>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 6 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={transaction.sectionTitle}>Face Verification</Text>
                <Text style={typography.label}>Please verify your face to proceed.</Text>
                <CrossPlatformTouchable
                  style={transaction.nextButton}
                  onPress={handleFaceVerify}
                  disabled={submitting}
                >
                  <Text style={transaction.nextButtonText}>Start Face Verification</Text>
                </CrossPlatformTouchable>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {currentStep === 7 && (
              <View style={components.formCard}>
                <CrossPlatformBlur 
                  intensity={80} 
                  tint="light" 
                  style={StyleSheet.absoluteFill}
                  fallbackColor="rgba(255, 255, 255, 0.1)" 
                />
                <Text style={transaction.sectionTitle}>OTP Verification</Text>
                <Text style={typography.label}>Enter the OTP sent to your email.</Text>
                <TextInput
                  style={components.input}
                  placeholder="Enter OTP"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={setOtp}
                />
                <View style={transaction.stepNavRow}>
                  <CrossPlatformTouchable style={transaction.prevButton} onPress={prevStep}>
                    <Text style={transaction.prevButtonText}>Back</Text>
                  </CrossPlatformTouchable>
                  <CrossPlatformTouchable
                    style={transaction.nextButton}
                    onPress={handleOtpVerify}
                    disabled={otpSubmitting || !otp}
                  >
                    <Text style={transaction.nextButtonText}>
                      {otpSubmitting ? 'Verifying...' : 'Verify & Complete'}
                    </Text>
                  </CrossPlatformTouchable>
                </View>
                <CrossPlatformTouchable
                  style={transaction.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={transaction.cancelButtonText}>Cancel Transaction</Text>
                </CrossPlatformTouchable>
              </View>
            )}
            {success && (
              <Modal visible={success} transparent animationType="slide">
                <View style={transaction.modalOverlay}>
                  <View style={transaction.modalContainer}>
                    <MaterialIcons name="check-circle" size={64} color={colors.primary} />
                    <Text style={transaction.modalTitle}>Transaction Successful!</Text>
                    <CrossPlatformTouchable style={transaction.nextButton} onPress={handleDone}>
                      <Text style={transaction.nextButtonText}>OK</Text>
                    </CrossPlatformTouchable>
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

export default UserMakeTransaction