import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  TextInput, 
  Alert 
} from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'

// Import unified styling
import styleSheet, { colors, typography, layout, components, complaints } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const SendComplaints = ({ navigation, username }) => {
  const [complaint, setComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!complaint) {
      Alert.alert('Error', 'Please enter your complaint')
      return
    }
    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('username', username)
      data.append('complaint', complaint)
      await axios.post(`${API_URL}/user_complaint`, data)
      setSubmitting(false)
      setComplaint('') // Clear the input after success
      Alert.alert('Success', 'Complaint submitted successfully!')
      navigation.navigate('Dashboard')
    } catch (err) {
      setSubmitting(false)
      setError('Failed to submit complaint')
    }
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
      <ScrollView contentContainerStyle={layout.container}>
        <View style={components.headerContainer}>
          <CrossPlatformBlur 
            intensity={100} 
            tint="light" 
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.15)"
          />
          <MaterialIcons name="report-problem" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={typography.heading}>Send Complaint</Text>
          <Text style={[typography.subHeading, { textAlign: 'center' }]}>
            Tell us about any issues you're experiencing
          </Text>
        </View>
        
        <View style={components.formCard}>
          <CrossPlatformBlur 
            intensity={80} 
            tint="light" 
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.1)"
          />
          <TextInput
            style={complaints.input}
            placeholder="Enter your complaint"
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={complaint}
            onChangeText={setComplaint}
          />
          <CrossPlatformTouchable
            style={[components.submitButton, { opacity: submitting ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={components.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Text>
          </CrossPlatformTouchable>
          {error ? <Text style={components.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SendComplaints