import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'

// Import unified styling
import styleSheet, { colors, typography, layout, components, complaints } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const FILTERS = ['All', 'Pending', 'Processing', 'Completed']

const ManageComplaints = ({ navigation, username }) => {
  const [complaintData, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

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

  // Filter complaints based on selected filter
  const filteredComplaints = filter === 'All'
    ? complaintData
    : complaintData.filter(item => item.status === filter)

  return (
    <SafeAreaView style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={components.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={layout.container}>
        <View style={components.headerContainer}>
          <CrossPlatformBlur 
            intensity={100}
            tint="light"
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.15)" 
          />
          <MaterialIcons name="feedback" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={typography.heading}>Your Complaints</Text>
          <CrossPlatformTouchable 
            onPress={handleRefresh} 
            style={{
              marginTop: 10,
              padding: 6,
              borderRadius: 12,
              backgroundColor: 'rgba(0,171,233,0.08)'
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontFamily: FONT_FAMILY.bold }}>Refresh</Text>
          </CrossPlatformTouchable>
        </View>
        
        {/* Filter Buttons */}
        <View style={complaints.filterRow}>
          {FILTERS.map(f => (
            <CrossPlatformTouchable
              key={f}
              style={[
                complaints.filterButton,
                filter === f && complaints.filterButtonActive
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
        ) : filteredComplaints.length === 0 ? (
          <Text style={[components.errorText, { marginTop: 32 }]}>No complaints found.</Text>
        ) : (
          filteredComplaints.map((item, idx) => (
            <View style={complaints.complaintCard} key={idx}>
              <CrossPlatformBlur 
                intensity={80} 
                tint="light" 
                style={StyleSheet.absoluteFill}
                fallbackColor="rgba(255, 255, 255, 0.1)"
              />
              <Text style={typography.label}>Complaint:</Text>
              <Text style={typography.value}>{item.complaint}</Text>
              <Text style={typography.label}>Reply:</Text>
              <Text style={typography.value}>{item.reply || 'No reply yet.'}</Text>
              <Text style={typography.label}>Status: <Text style={{ 
                color: item.status === 'Completed' ? colors.primary : colors.secondary,
                fontWeight: 'bold',
                fontFamily: FONT_FAMILY.bold
              }}>
                {item.status}
              </Text></Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ManageComplaints