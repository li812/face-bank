import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'

// Import unified styling
import styleSheet, { colors, typography, layout, components, account } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS } from '../../utils/platformUtils'

const ViewAccount = ({ navigation, username }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAccounts = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${API_URL}/userAccount`, {
        headers: { Accept: 'application/json' }
      })
      setAccounts(response.data.user_account || [])
      setError('')
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError('Failed to load account data')
    }
    setLoading(false)
    setRefreshing(false)
  }

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("ViewAccount screen in focus - refreshing data");
      fetchAccounts();
      
      // Optional: Return a cleanup function if needed
      return () => {
        // Any cleanup code if necessary
      };
    }, []) // Empty dependency array means this runs every time the screen is focused
  );

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
          <MaterialIcons name="account-balance" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={typography.heading}>Your Accounts</Text>
          
          {/* Add refresh button */}
          <CrossPlatformTouchable
            style={{
              marginTop: 8,
              backgroundColor: colors.primaryLight,
              borderRadius: 20,
              padding: 6,
              width: 36,
              height: 36,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={fetchAccounts}
            disabled={refreshing}
          >
            <MaterialIcons
              name="refresh"
              size={22}
              color={refreshing ? "#aaa" : colors.primary}
              style={{ transform: [{ rotate: refreshing ? '360deg' : '0deg' }] }}
            />
          </CrossPlatformTouchable>
        </View>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={[components.errorText, { marginTop: 32 }]}>{error}</Text>
            <CrossPlatformTouchable
              style={components.submitButton}
              onPress={fetchAccounts}
            >
              <Text style={components.submitButtonText}>Try Again</Text>
            </CrossPlatformTouchable>
          </View>
        ) : accounts.length === 0 ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={[components.errorText, { marginTop: 32 }]}>No accounts found.</Text>
            <CrossPlatformTouchable
              style={components.submitButton}
              onPress={() => navigation.navigate('AddAccount')}
            >
              <Text style={components.submitButtonText}>Add Account</Text>
            </CrossPlatformTouchable>
          </View>
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