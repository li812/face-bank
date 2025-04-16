import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Image, TextInput, Alert } from 'react-native'
import { BlurView } from 'expo-blur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

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
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={styles.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <Text style={styles.heading}>Add Account</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.formCard}>
            <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.account_number}
              onChangeText={v => handleChange('account_number', v)}
            />
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {branches.map(branch => (
                  <TouchableOpacity
                    key={branch.id}
                    style={[
                      styles.branchOption,
                      form.branch_name == branch.id && styles.branchOptionSelected
                    ]}
                    onPress={() => handleChange('branch_name', branch.id)}
                  >
                    <Text style={{ color: form.branch_name == branch.id ? '#fff' : '#00abe9' }}>
                      {branch.branch_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Account Type</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Savings', 'Current'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.branchOption,
                      form.account_type === type && styles.branchOptionSelected
                    ]}
                    onPress={() => handleChange('account_type', type)}
                  >
                    <Text style={{ color: form.account_type === type ? '#fff' : '#00abe9' }}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Balance"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.balance}
              onChangeText={v => handleChange('balance', v)}
            />
            <TouchableOpacity
              style={[styles.submitButton, { opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Account'}</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
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
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 110, 157, 0.42)',
    color: '#222',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  pickerLabel: {
    color: '#00abe9',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 15,
  },
  branchOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00abe9',
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    marginRight: 8,
  },
  branchOptionSelected: {
    backgroundColor: '#00abe9',
    borderColor: '#00abe9',
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
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  }
})

export default AddAccount