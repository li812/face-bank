import React, { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions, 
  Image,
  TouchableNativeFeedback
} from 'react-native'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { BlurView } from 'expo-blur'
import { useNavigation } from '@react-navigation/native'

// Import the unified stylesheet
import styleSheet, { colors, typography, layout, components, dashboard, PLATFORM } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

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
        <View style={[components.headerContainer, { paddingVertical: 16 }]}>
          <CrossPlatformBlur 
            intensity={100} 
            tint="light" 
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.15)"
          />
          <MaterialIcons name="account-circle" size={72} color={colors.primary} style={dashboard.avatar} />
          <Text style={dashboard.welcome}>{fullName}</Text>
          <Text style={dashboard.balanceLabel}>Available Balance</Text>
          
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 12 }} />
          ) : error ? (
            <Text style={[dashboard.balance, { color: colors.error, fontSize: 16 }]}>{error}</Text>
          ) : accounts.length === 0 ? (
            <>
              <Text style={dashboard.balance}>₹ 0.00</Text>
              <Text style={{ color: colors.white, marginTop: 8, marginBottom: 8, fontSize: 16 }}>
                No accounts found.
              </Text>
              <CrossPlatformTouchable
                style={[dashboard.card, { backgroundColor: colors.primary, marginTop: 8 }]}
                onPress={() => navigation.navigate('AddAccount')}
              >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>+ Add Your First Account</Text>
              </CrossPlatformTouchable>
            </>
          ) : (
            <>
              <Text style={dashboard.balance}>₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              <CrossPlatformTouchable
                style={{
                  alignSelf: 'center',
                  marginTop: 4,
                  marginBottom: 8,
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
            </>
          )}
        </View>

        {/* Row 1: Account Management */}
        <View style={dashboard.cardsRow}>
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('ViewAccount')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="account-balance-wallet" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>View Account</Text>
          </CrossPlatformTouchable>
          
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('AddAccount')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="add-card" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Add Account</Text>
          </CrossPlatformTouchable>
          
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('ViewTransactions')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="receipt-long" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Transactions</Text>
          </CrossPlatformTouchable>
        </View>

        {/* Row 2: Financial Services */}
        <View style={dashboard.cardsRow}>
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('AddFamily', { username })}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="group-add" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Add Family</Text>
          </CrossPlatformTouchable>
          
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('ApplyLoan')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="account-balance" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Apply Loan</Text>
          </CrossPlatformTouchable>
          
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('ExchangeRate')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="currency-exchange" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Exchange Rate</Text>
          </CrossPlatformTouchable>
        </View>

        {/* Row 3: Support Services */}
        <View style={dashboard.cardsRow}>
          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('SendComplaints')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="report-problem" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Send Complaint</Text>
          </CrossPlatformTouchable>

          <CrossPlatformTouchable 
            style={dashboard.card} 
            onPress={() => navigation.navigate('ManageComplaints')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialCommunityIcons name="account-cog-outline" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Manage Complaints</Text>
          </CrossPlatformTouchable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Add some supplementary dashboard styles (only needed for this component)
const supplementaryStyles = {
  welcome: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.white,
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  }
};

// Add welcome style to the existing dashboard object
dashboard.welcome = supplementaryStyles.welcome;

export default UserDashboard