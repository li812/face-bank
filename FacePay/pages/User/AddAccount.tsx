import React, { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions, 
  Image, 
  TextInput, 
  Alert, 
  StyleSheet,
  TouchableNativeFeedback
} from 'react-native'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import styleSheet, { colors, typography, layout, components } from '../../appStyleSheet'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const { width, height } = Dimensions.get('window')

const AddAccount = ({ navigation, username }) => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    account_number: '',
    branch_name: '',
    account_type: 'Savings',
    balance: ''
  })

  useEffect(() => {
    // Fetch branches for dropdown
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${API_URL}/branches`, { headers: { Accept: 'application/json' } })
        setBranches(res.data.branches || [])
      } catch (err) {
        setError('Failed to load branches')
      }
      setLoading(false)
    }
    fetchBranches()
  }, [])

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async () => {
    if (!form.account_number || !form.branch_name || !form.account_type || !form.balance) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }
    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('account_number', form.account_number)
      data.append('branch_name', form.branch_name)
      data.append('username', username)
      data.append('account_type', form.account_type)
      data.append('balance', form.balance)
      const res = await axios.post(`${API_URL}/addAccount`, data)
      setSubmitting(false)
      // Clear form fields after success
      setForm({
        account_number: '',
        branch_name: '',
        account_type: 'Savings',
        balance: ''
      })
      if (res.data && res.data.message) {
        Alert.alert('Success', res.data.message)
        navigation.navigate('Dashboard')
      } else {
        Alert.alert('Success', 'Account added successfully!')
        navigation.navigate('Dashboard')
      }
    } catch (err) {
      setSubmitting(false)
      Alert.alert('Error', 'Failed to add account')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
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
          <Text style={typography.heading}>Add Account</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : (
          <View style={components.formCard}>
            <CrossPlatformBlur 
              intensity={80} 
              tint="light" 
              style={StyleSheet.absoluteFill}
              fallbackColor="rgba(255, 255, 255, 0.1)"
            />
            <TextInput
              style={components.input}
              placeholder="Account Number"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.account_number}
              onChangeText={v => handleChange('account_number', v)}
              underlineColorAndroid="transparent"
            />
            <View style={{ width: '100%', marginBottom: 12 }}>
              <Text style={typography.pickerLabel}>Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {branches.map(branch => (
                  <CrossPlatformTouchable
                    key={branch.id}
                    style={[
                      components.branchOption,
                      form.branch_name == branch.id && components.branchOptionSelected
                    ]}
                    onPress={() => handleChange('branch_name', branch.id)}
                    background={
                      IS_IOS
                        ? undefined 
                        : TouchableNativeFeedback.Ripple(colors.primary, true)
                    }
                  >
                    <Text style={{ 
                      color: form.branch_name == branch.id ? colors.white : colors.primary,
                      fontFamily: FONT_FAMILY.medium
                    }}>
                      {branch.branch_name}
                    </Text>
                  </CrossPlatformTouchable>
                ))}
              </ScrollView>
            </View>
            <View style={{ width: '100%', marginBottom: 12 }}>
              <Text style={typography.pickerLabel}>Account Type</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Savings', 'Current'].map(type => (
                  <CrossPlatformTouchable
                    key={type}
                    style={[
                      components.branchOption,
                      form.account_type === type && components.branchOptionSelected
                    ]}
                    onPress={() => handleChange('account_type', type)}
                    background={
                      IS_IOS
                        ? undefined 
                        : TouchableNativeFeedback.Ripple(colors.primary, true)
                    }
                  >
                    <Text style={{ 
                      color: form.account_type === type ? colors.white : colors.primary,
                      fontFamily: FONT_FAMILY.medium 
                    }}>
                      {type}
                    </Text>
                  </CrossPlatformTouchable>
                ))}
              </View>
            </View>
            <TextInput
              style={components.input}
              placeholder="Balance"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.balance}
              onChangeText={v => handleChange('balance', v)}
              underlineColorAndroid="transparent"
            />
            <CrossPlatformTouchable
              style={[components.submitButton, { opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
              background={
                IS_IOS 
                  ? undefined 
                  : TouchableNativeFeedback.Ripple('#fff', false)
              }
            >
              <Text style={components.submitButtonText}>
                {submitting ? 'Adding...' : 'Add Account'}
              </Text>
            </CrossPlatformTouchable>
            {error ? <Text style={components.errorText}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default AddAccount