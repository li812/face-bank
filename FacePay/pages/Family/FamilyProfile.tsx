import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, Alert, ScrollView, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '../../config'
import { useFocusEffect } from '@react-navigation/native'

// Import unified styling
import styleSheet, { colors, typography, layout, components, profile } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { StyleSheet } from 'react-native'

const FamilyProfile = ({ navigation, username }) => {
  const [familyData, setFamilyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchFamilyDetails = async () => {
        setLoading(true)
        setError('')
        try {
          // Use the family_details endpoint to get family member data
          const res = await axios.get(`${API_URL}/family_details`, {
            params: { username },
            headers: { Accept: 'application/json' }
          });
          
          if (res.data && res.data.family_data) {
            console.log("Family data fetched:", res.data.family_data);
            setFamilyData(res.data.family_data);
          } else {
            setError('Family member data not found');
          }
        } catch (err) {
          console.error("Error fetching family data:", err);
          setError('Failed to load family member data');
        }
        setLoading(false);
      };
      
      fetchFamilyDetails();
    }, [username])
  );

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
          <Text style={typography.heading}>Family Member Profile</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={components.errorText}>{error}</Text>
        ) : familyData ? (
          <View style={profile.profileCard}>
            <CrossPlatformBlur 
              intensity={80} 
              tint="light" 
              style={StyleSheet.absoluteFill}
              fallbackColor="rgba(255, 255, 255, 0.1)"
            />
            <Text style={typography.label}>Username:</Text>
            <Text style={typography.value}>{familyData.username}</Text>
            
            <Text style={typography.label}>Full Name:</Text>
            <Text style={typography.value}>{familyData.name}</Text>
            
            <Text style={typography.label}>Email:</Text>
            <Text style={typography.value}>{familyData.email}</Text>
            
            <Text style={typography.label}>Phone:</Text>
            <Text style={typography.value}>{familyData.phone}</Text>
            
            <Text style={typography.label}>Relationship:</Text>
            <Text style={typography.value}>{familyData.relationship}</Text>
            
            <Text style={typography.label}>Primary Account Holder:</Text>
            <Text style={typography.value}>{familyData.primary_account}</Text>
            
            <Text style={typography.label}>Member Since:</Text>
            <Text style={typography.value}>{familyData.date}</Text>
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

export default FamilyProfile