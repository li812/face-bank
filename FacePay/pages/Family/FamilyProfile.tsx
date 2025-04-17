import React, { useEffect, useState } from 'react'
import { View, Text, Alert, ScrollView, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '../../config'

// Import unified styling
import styleSheet, { colors, typography, layout, components, profile } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { StyleSheet } from 'react-native'

const UserProfile = ({ navigation, username }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`${API_URL}/userPage`, { headers: { Accept: 'application/json' } })
        if (res.data && res.data.user_data) {
          setUser(res.data.user_data)
        } else {
          setError('User data not found')
        }
      } catch {
        setError('Failed to load user data')
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }
    ]);
  }

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
          <MaterialIcons name="account-circle" size={90} color={colors.primary} style={profile.avatar} />
          <Text style={typography.heading}>User Profile</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={components.errorText}>{error}</Text>
        ) : user ? (
          <View style={profile.profileCard}>
            <CrossPlatformBlur 
              intensity={80} 
              tint="light" 
              style={StyleSheet.absoluteFill}
              fallbackColor="rgba(255, 255, 255, 0.1)"
            />
            <Text style={typography.label}>Username:</Text>
            <Text style={typography.value}>{user.username}</Text>
            
            <Text style={typography.label}>Full Name:</Text>
            <Text style={typography.value}>{user.first_name} {user.last_name}</Text>
            
            <Text style={typography.label}>Gender:</Text>
            <Text style={typography.value}>{user.gender}</Text>
            
            <Text style={typography.label}>Address:</Text>
            <Text style={typography.value}>{user.address}</Text>
            
            <Text style={typography.label}>City:</Text>
            <Text style={typography.value}>{user.city}</Text>
            
            <Text style={typography.label}>State:</Text>
            <Text style={typography.value}>{user.state}</Text>
            
            <Text style={typography.label}>Country:</Text>
            <Text style={typography.value}>{user.country}</Text>
            
            <Text style={typography.label}>Email:</Text>
            <Text style={typography.value}>{user.email}</Text>
            
            <Text style={typography.label}>Phone:</Text>
            <Text style={typography.value}>{user.phone}</Text>
            
            <Text style={typography.label}>Member Since:</Text>
            <Text style={typography.value}>{user.date}</Text>
          </View>
        ) : null}
      </ScrollView>

      <CrossPlatformTouchable
        style={profile.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <MaterialIcons name="logout" size={22} color="#fff" />
        <Text style={profile.logoutText}>Logout</Text>
      </CrossPlatformTouchable>
    </SafeAreaView>
  )
}

export default UserProfile