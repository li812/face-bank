import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Dimensions, Image } from 'react-native'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { BlurView } from 'expo-blur'
import { useNavigation } from '@react-navigation/native'

import AddAccount from './AddAccount'
import ViewAccount from './ViewAccount'
import ExchangeRate from './ExchangeRate'
import AddFamily from './AddFamily'

const { width, height } = Dimensions.get('window')

const UserDashboard = ({ username }) => {
  const navigation = useNavigation()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [fullName, setFullName] = useState('')

  // Fetch user details for full name
  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/userPage`, { headers: { Accept: 'application/json' } })
      if (res.data && res.data.user_data) {
        setFullName(`${res.data.user_data.first_name} ${res.data.user_data.last_name}`)
      } else {
        setFullName(username)
      }
    } catch {
      setFullName(username)
    }
  }

  const fetchAccounts = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${API_URL}/userAccount`, {
        headers: { Accept: 'application/json' }
      })
      setAccounts(response.data.user_account || [])
      setError('')
    } catch (err) {
      setError('Failed to load account data')
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchUserDetails()
    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* Background Image */}
      <Image
        source={require('../../assets/background/bg1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none" // <-- Add this
      />
      {/* Overlay for glass effect */}
      <View
        style={[styles.gradient, { backgroundColor: 'rgba(0, 0, 0, 0)' }]}
        pointerEvents="none" // <-- Add this
      />
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.headerContainer}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="account-circle" size={72} color="#00abe9" style={styles.avatar} />
          <Text style={styles.welcome}>Welcome, {fullName}!</Text>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {loading ? (
            <ActivityIndicator color="#00abe9" size="large" style={{ marginVertical: 12 }} />
          ) : error ? (
            <Text style={[styles.balance, { color: 'red', fontSize: 16 }]}>{error}</Text>
          ) : accounts.length === 0 ? (
            <>
              <Text style={styles.balance}>₹ 0.00</Text>
              <Text style={{ color: '#fff', marginTop: 8, marginBottom: 8, fontSize: 16 }}>
                No accounts found.
              </Text>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#00abe9', marginTop: 8 }]}
                onPress={() => navigation.navigate('AddAccount')}
              >
                <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Your First Account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.balance}>₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  marginTop: 4,
                  marginBottom: 8,
                  backgroundColor: 'rgba(0,171,233,0.08)',
                  borderRadius: 20,
                  padding: 6,
                  width: 36,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={fetchAccounts}
                disabled={refreshing}
                accessibilityLabel="Refresh Balance"
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={refreshing ? "#aaa" : "#00abe9"}
                  style={{ transform: [{ rotate: refreshing ? '360deg' : '0deg' }] }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewAccount')}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="account-balance-wallet" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>View Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddAccount')}>
            <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="add-card" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Add Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewTransactions')}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="receipt-long" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Transactions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddFamily', { username })}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="group-add" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Add Family</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ApplyLoan')}>
            <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="account-balance" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Apply Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ExchangeRate')}>
            <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="currency-exchange" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Exchange Rate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SendComplaints')}>
            <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="report-problem" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Send Complaint</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageComplaints')}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="account-cog-outline" size={36} color="#00abe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Manage Complaints</Text>
          </TouchableOpacity>
        </View>


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
    paddingVertical: 1,
    paddingHorizontal: 10, // Reduce horizontal padding for small screens
    zIndex: 2,
    minHeight: height,
  },
  headerContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#00abe9',
    backgroundColor: '#fff'
  },
  welcome: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center'
  },
  balanceLabel: {
    color: 'rgba(25, 25, 25, 0.7)',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 1,
    textAlign: 'center'
  },
  balance: {
    color: '#00abe9',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0,171,233,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center'
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 480,
    marginBottom: 10,
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 15,
    marginHorizontal: 2,
    marginBottom: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.13)',
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
  cardIcon: {
    marginBottom: 8,
    opacity: 0.7
  },
  cardText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  actionButton: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#00abe9',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
})

export default UserDashboard