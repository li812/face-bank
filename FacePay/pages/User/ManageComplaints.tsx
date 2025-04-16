import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Image, Alert } from 'react-native'
import { BlurView } from 'expo-blur'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')

const ManageComplaints = ({ navigation, username }) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/view_user_complaint_replay`, {
        headers: { Accept: 'application/json' }
      })
      setComplaints(response.data.complaint || [])
      setError('')
    } catch (err) {
      setError('Failed to load complaints')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const handleRefresh = () => {
    fetchComplaints()
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
          <Text style={styles.heading}>Your Complaints</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={{ color: '#00abe9', fontWeight: 'bold' }}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>{error}</Text>
        ) : complaints.length === 0 ? (
          <Text style={[styles.errorText, { marginTop: 32 }]}>No complaints found.</Text>
        ) : (
          complaints.map((item, idx) => (
            <View style={styles.complaintCard} key={idx}>
              <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
              <Text style={styles.label}>Complaint:</Text>
              <Text style={styles.value}>{item.complaint}</Text>
              <Text style={styles.label}>Reply:</Text>
              <Text style={styles.value}>{item.reply || 'No reply yet.'}</Text>
              <Text style={styles.label}>Status: <Text style={{ color: item.status === 'Completed' ? '#00abe9' : '#e91e63' }}>{item.status}</Text></Text>
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
    paddingBottom: 90,
  },
  headerContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingTop: 24,
    paddingBottom: 12,
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
  refreshButton: {
    marginTop: 10,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,171,233,0.08)'
  },
  complaintCard: {
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
  label: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 4
  },
  value: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  }
})

export default ManageComplaints