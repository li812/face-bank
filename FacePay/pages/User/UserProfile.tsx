import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, ActivityIndicator, Dimensions, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { BlurView } from 'expo-blur'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '../../config'

const { width, height } = Dimensions.get('window')

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
          <MaterialIcons name="account-circle" size={90} color="#00abe9" style={styles.avatar} />
          <Text style={styles.heading}>User Profile</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : user ? (
          <View style={styles.profileCard}>
            <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{user.username}</Text>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{user.gender}</Text>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{user.address}</Text>
            <Text style={styles.label}>City:</Text>
            <Text style={styles.value}>{user.city}</Text>
            <Text style={styles.label}>State:</Text>
            <Text style={styles.value}>{user.state}</Text>
            <Text style={styles.label}>Country:</Text>
            <Text style={styles.value}>{user.country}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
            <Text style={styles.label}>Member Since:</Text>
            <Text style={styles.value}>{user.date}</Text>

            
          </View>
          
        ) : null}


      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

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
    paddingBottom: 120,
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
  avatar: {
    marginBottom: 8,
    opacity: 0.9
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
  profileCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom:35,
    padding: 24,
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
  label: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 2,
  },
  value: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center'
  },
  logoutButton: {
    position: 'absolute',
    bottom: 92,
    left: 24,
    right: 24,
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#e53935',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 4
      }
    })
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10
  }
})

export default UserProfile