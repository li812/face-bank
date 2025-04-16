import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Platform, Image } from 'react-native'
import { BlurView } from 'expo-blur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')

const ViewAccount = ({ navigation, route }) => {
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

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard')
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* Background Image */}
      <Image
        source={require('../../assets/background/bg1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      {/* Overlay for glass effect */}
      <View style={styles.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <Text style={styles.heading}>Your Accounts</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>{error}</Text>
        ) : accounts.length === 0 ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>No accounts found.</Text>
        ) : (
          accounts.map((acc, idx) => (
            <View style={styles.accountCard} key={idx}>
              <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
              <Text style={styles.accountNumber}>Account No: {acc.account_number}</Text>
              <Text style={styles.accountType}>Type: {acc.account_type}</Text>
              <Text style={styles.accountBranch}>Branch: {acc.branch_name}</Text>
              <Text style={styles.accountIFSC}>IFSC: {acc.ifsc_code}</Text>
              <Text style={styles.accountBalance}>Balance: ₹ {Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.accountDate}>Opened: {acc.date}</Text>
            </View>
          ))
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
    paddingBottom: 90, // for tab bar
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
  accountCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
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
  accountNumber: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  accountType: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600'
  },
  accountBranch: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600'
  },
  accountIFSC: {
    color: '#444',
    fontSize: 15,
    marginBottom: 2,
  },
  accountBalance: {
    color: '#00abe9',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  accountDate: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  }
})

export default ViewAccount