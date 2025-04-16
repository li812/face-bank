import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Platform, Image } from 'react-native'
import { BlurView } from 'expo-blur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')

const ViewTransactions = ({ navigation, username }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/user_transaction`, {
        headers: { Accept: 'application/json' }
      })
      setTransactions(response.data.transaction_history || [])
      setError('')
    } catch (err) {
      setError('Failed to load transactions')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

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
          <Text style={styles.heading}>Transaction History</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>{error}</Text>
        ) : transactions.length === 0 ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>No transactions found.</Text>
        ) : (
          transactions.map((txn, idx) => (
            <View style={styles.transactionCard} key={idx}>
              <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
              <Text style={styles.txnLabel}>To: <Text style={styles.txnValue}>{txn.receiver_name}</Text></Text>
              <Text style={styles.txnLabel}>Account: <Text style={styles.txnValue}>{txn.receiver_account_number}</Text></Text>
              <Text style={styles.txnLabel}>Amount: <Text style={styles.txnAmount}>₹ {Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Text>
              <Text style={styles.txnLabel}>Date: <Text style={styles.txnValue}>{txn.date}</Text></Text>
              <Text style={styles.txnLabel}>Status: <Text style={[styles.txnValue, { color: txn.is_verified ? '#00abe9' : '#e91e63' }]}>{txn.is_verified ? 'Verified' : 'Pending'}</Text></Text>
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
  transactionCard: {
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
  txnLabel: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600'
  },
  txnValue: {
    color: '#00abe9',
    fontWeight: 'bold'
  },
  txnAmount: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  }
})

export default ViewTransactions