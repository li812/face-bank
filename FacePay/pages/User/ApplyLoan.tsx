import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TextInput, Alert } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

// Import unified styling
import styleSheet, { colors, typography, layout, components, loan } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const ApplyLoan = ({ navigation, username }) => {
  const [accounts, setAccounts] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    account_number: '',
    loan_amount: '',
    branch_name: '',
    username: username || ''
  })

  useEffect(() => {
    // Fetch accounts and branches for dropdowns
    const fetchData = async () => {
      try {
        const [accRes, branchRes] = await Promise.all([
          axios.get(`${API_URL}/userAccount`, { headers: { Accept: 'application/json' } }),
          axios.get(`${API_URL}/branches`, { headers: { Accept: 'application/json' } })
        ])
        setAccounts(accRes.data.user_account || [])
        setBranches(branchRes.data.branches || [])
        setError('')
      } catch (err) {
        setError('Failed to load accounts or branches')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async () => {
    if (!form.account_number || !form.loan_amount || !form.branch_name) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }
    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('account_number', form.account_number)
      data.append('loan_amount', form.loan_amount)
      data.append('branch_name', form.branch_name)
      data.append('username', username)
      const res = await axios.post(`${API_URL}/applyLoan`, data)
      setSubmitting(false)
      setForm({
        account_number: '',
        loan_amount: '',
        branch_name: '',
        username: username || ''
      })
      if (res.data && res.data.message) {
        Alert.alert('Success', res.data.message)
        navigation.navigate('Dashboard')
      } else {
        Alert.alert('Success', 'Loan request submitted!')
        navigation.navigate('Dashboard')
      }
    } catch (err) {
      setSubmitting(false)
      Alert.alert('Error', 'Failed to apply for loan')
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
          <Text style={typography.heading}>Apply for Loan</Text>
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
            <View style={loan.pickerWrapper}>
              <Text style={loan.pickerLabel}>Account Number</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {accounts.map(acc => (
                  <CrossPlatformTouchable
                    key={acc.id}
                    style={[
                      loan.branchOption,
                      form.account_number == acc.id && loan.branchOptionSelected
                    ]}
                    onPress={() => handleChange('account_number', acc.id)}
                  >
                    <Text style={{ 
                      color: form.account_number == acc.id ? colors.white : colors.primary,
                      fontFamily: FONT_FAMILY.medium 
                    }}>
                      {acc.account_number}
                    </Text>
                  </CrossPlatformTouchable>
                ))}
              </ScrollView>
            </View>
            <TextInput
              style={components.input}
              placeholder="Loan Amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.loan_amount}
              onChangeText={v => handleChange('loan_amount', v)}
            />
            <View style={loan.pickerWrapper}>
              <Text style={loan.pickerLabel}>Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {branches.map(branch => (
                  <CrossPlatformTouchable
                    key={branch.id}
                    style={[
                      loan.branchOption,
                      form.branch_name == branch.id && loan.branchOptionSelected
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
              </ScrollView>
            </View>
            <CrossPlatformTouchable
              style={[components.submitButton, { opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={components.submitButtonText}>{submitting ? 'Applying...' : 'Apply Loan'}</Text>
            </CrossPlatformTouchable>
            {error ? <Text style={components.errorText}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ApplyLoan