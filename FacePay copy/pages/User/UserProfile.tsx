import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const UserProfile = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>User Profile</Text>
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={() => {
        // Optionally clear session here
        navigation.replace('Login')
      }}
    >
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 24 },
  logoutButton: { backgroundColor: '#e53935', padding: 16, borderRadius: 8 },
  logoutText: { color: 'white', fontWeight: 'bold' }
})

export default UserProfile