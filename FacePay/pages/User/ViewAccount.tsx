import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

// Import unified styling
import styleSheet, { colors, typography, layout, components, account } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import { IS_IOS } from '../../utils/platformUtils'

const ViewAccount = ({ navigation, username }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/userAccount`, {
        headers: { Accept: 'application/json' }
      })
      setAccounts(response.data.user_account || [])
      setError('')
    } catch (err) {
      setError('Failed to load account data')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <SafeAreaView style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* Background Image */}
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      {/* Overlay for glass effect */}
      <View style={components.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={layout.container}>
        <View style={components.headerContainer}>
          <CrossPlatformBlur 
            intensity={100} 
            tint="light" 
            style={StyleSheet.absoluteFill} 
            fallbackColor="rgba(255, 255, 255, 0.15)"
          />
          <Text style={typography.heading}>Your Accounts</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={[components.errorText, { marginTop: 32 }]}>{error}</Text>
        ) : accounts.length === 0 ? (
          <Text style={[components.errorText, { marginTop: 32 }]}>No accounts found.</Text>
        ) : (
          accounts.map((acc, idx) => (
            <View style={account.accountCard} key={idx}>
              <CrossPlatformBlur 
                intensity={80} 
                tint="light" 
                style={StyleSheet.absoluteFill} 
                fallbackColor="rgba(255, 255, 255, 0.1)"
              />
              <Text style={account.accountNumber}>Account No: {acc.account_number}</Text>
              <Text style={account.accountType}>Type: {acc.account_type}</Text>
              <Text style={account.accountBranch}>Branch: {acc.branch_name}</Text>
              <Text style={account.accountIFSC}>IFSC: {acc.ifsc_code}</Text>
              <Text style={account.accountBalance}>Balance: ₹ {Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              <Text style={account.accountDate}>Opened: {acc.date}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ViewAccount