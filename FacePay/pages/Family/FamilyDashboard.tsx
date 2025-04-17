import React, { useEffect, useState, useCallback } from 'react'
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
import { useNavigation, useFocusEffect } from '@react-navigation/native'

// Import the unified stylesheet
import styleSheet, { colors, typography, layout, components, dashboard, PLATFORM } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const FamilyDashboard = ({ username }) => {
  const navigation = useNavigation()
  const [accounts, setAccounts] = useState([])
  const [, forceUpdate] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [fullName, setFullName] = useState('')

  // Add this effect for multiple re-renders
  useEffect(() => {
    // Force an immediate re-render
    forceUpdate({})
    
    // Create a sequence of re-renders with increasing delays
    const timers = [100, 300, 600].map((delay) => 
      setTimeout(() => {
        forceUpdate({})
      }, delay)
    )
    
    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])

  // Fetch user details for full name
  const fetchUserDetails = async () => {
    try {
      // First try to get family member details
      const familyRes = await axios.post(`${API_URL}/check_family_username/`, 
        { username },
        { headers: { Accept: 'application/json' } }
      );
      
      if (familyRes.data && familyRes.data.exists) {
        // If we confirmed this is a family member, get their specific details
        try {
          // Use the user accounts endpoint to query all accounts
          const userAccRes = await axios.get(`${API_URL}/userAccount`, { 
            headers: { Accept: 'application/json' } 
          });
          
          // If we have both family username and accounts, we can query by the family username
          // This should use the family_login backend to get family member by username
          const res = await axios.get(`${API_URL}/family_details`, { 
            params: { username },
            headers: { Accept: 'application/json' } 
          });
          
          if (res.data && res.data.family_data) {
            // Use the family member's name from the response
            setFullName(res.data.family_data.name);
            return;
          }
        } catch (err) {
          console.log('Could not fetch family details, using username');
        }
      }
      
      // Fallback: Try to extract name from the session data
      const res = await axios.get(`${API_URL}/userPage`, { headers: { Accept: 'application/json' } });
      if (res.data && !res.data.primary_user && res.data.family_data) {
        setFullName(res.data.family_data.name);
      } else {
        // If we still don't have a name, just use the username as a last resort
        setFullName(username);
      }
    } catch (err) {
      console.error('Error fetching user details:', err?.message);
      setFullName(username);
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
      console.error("Error fetching accounts:", err);
      setError('Failed to load account data')
    }
    setLoading(false)
    setRefreshing(false)
  }

  // This will run both on initial mount and whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Dashboard in focus - refreshing data");
      fetchUserDetails();
      fetchAccounts();
      
      // Optional: Return a cleanup function if needed
      return () => {
        // Any cleanup code if necessary
      };
    }, []) // Empty dependency array means this runs every time the screen is focused
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)

  return (
    <SafeAreaView style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* Background Image */}
      <Image
        source={require('../../assets/background/bg5.png')}
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
            onPress={() => navigation.navigate('FamExchangeRate')}
            background={!IS_IOS ? TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.1)', true) : undefined}
          >
            <CrossPlatformBlur intensity={100} tint="light" style={StyleSheet.absoluteFill} fallbackColor="rgba(255, 255, 255, 0.15)" />
            <MaterialIcons name="currency-exchange" size={36} color={colors.primary} style={dashboard.cardIcon} />
            <Text style={dashboard.cardText}>Exchange Rate</Text>
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

export default FamilyDashboard