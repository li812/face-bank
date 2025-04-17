import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'

// Import unified styling
import styleSheet, { colors, typography, layout, components, transactions } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const FILTERS = ['All', 'Verified', 'Pending']

const ViewTransactions = ({ navigation, username }) => {
  const [transactionsData, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

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
    setRefreshing(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTransactions()
  }

  // Filtering logic
  const filteredTransactions =
    filter === 'All'
      ? transactionsData
      : transactionsData.filter(txn =>
          filter === 'Verified'
            ? txn.is_verified
            : !txn.is_verified
        )

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
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={[typography.heading, { textAlign: 'center' }]}>Transaction History</Text>
          </View>

          <CrossPlatformTouchable 
            onPress={handleRefresh} 
            style={[
              transactions.refreshButton, 
              { position: 'bottom', bottom: -10, alignSelf: 'center' }
            ]} 
            disabled={refreshing}
          >
            <MaterialIcons 
              name="refresh" 
              size={22} 
              color={refreshing ? "#aaa" : colors.primary} 
            />
          </CrossPlatformTouchable>
        </View>
        
        {/* Filter Buttons */}
        <View style={transactions.filterRow}>
          {FILTERS.map(f => (
            <CrossPlatformTouchable
              key={f}
              style={[
                transactions.filterButton,
                filter === f && transactions.filterButtonActive
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={{ 
                color: filter === f ? colors.white : colors.primary, 
                fontWeight: 'bold',
                fontFamily: FONT_FAMILY.bold
              }}>
                {f}
              </Text>
            </CrossPlatformTouchable>
          ))}
        </View>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={[components.errorText, { marginTop: 32 }]}>{error}</Text>
        ) : filteredTransactions.length === 0 ? (
          <Text style={[components.errorText, { marginTop: 32 }]}>No transactions found.</Text>
        ) : (
          filteredTransactions.map((txn, idx) => (
            <View style={transactions.transactionCard} key={idx}>
              <CrossPlatformBlur 
                intensity={80} 
                tint="light" 
                style={StyleSheet.absoluteFill}
                fallbackColor="rgba(255, 255, 255, 0.1)"
              />
              <Text style={transactions.txnLabel}>
                To: <Text style={transactions.txnValue}>{txn.receiver_name}</Text>
              </Text>
              <Text style={transactions.txnLabel}>
                Account: <Text style={transactions.txnValue}>{txn.receiver_account_number}</Text>
              </Text>
              <Text style={transactions.txnLabel}>
                Amount: <Text style={transactions.txnAmount}>
                  ₹ {Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </Text>
              <Text style={transactions.txnLabel}>
                Date: <Text style={transactions.txnValue}>{txn.date}</Text>
              </Text>
              <Text style={transactions.txnLabel}>
                Status: <Text style={[
                  transactions.txnValue, 
                  { color: txn.is_verified ? colors.primary : colors.secondary }
                ]}>
                  {txn.is_verified ? 'Verified' : 'Pending'}
                </Text>
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ViewTransactions