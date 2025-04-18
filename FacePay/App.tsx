import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui' // Import SystemUI

// Import your screens
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import UserBase from './pages/User/UserBase'
import FamilyBase from './pages/Family/FamilyBase'

const Stack = createNativeStackNavigator()

const App = () => {
  // Set background color to match your app theme
  useEffect(() => {
    // Force the background color to be consistent with your app's theme
    SystemUI.setBackgroundColorAsync('#000000')
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home" 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="UserBase" component={UserBase} />
          <Stack.Screen name="FamilyBase" component={FamilyBase} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

export default App