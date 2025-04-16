import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import UserDashboard from './UserDashboard'
import UserMakeTransaction from './UserMakeTransaction'
import UserProfile from './UserProfile'

const Tab = createBottomTabNavigator()

const UserBase = ({ route, navigation }: any) => {
  // You can get username from route.params if needed
  const { username } = route.params || {}

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00abe9',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#181a20' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <Ionicons name="home" size={size} color={color} />
          }
          if (route.name === 'SendMoney') {
            return <Ionicons name="send" size={size} color={color} />
          }
          if (route.name === 'Profile') {
            return <Ionicons name="person" size={size} color={color} />
          }
        }
      })}
    >
      <Tab.Screen name="Dashboard">
        {props => <UserDashboard {...props} username={username} />}
      </Tab.Screen>
      <Tab.Screen name="SendMoney">
        {props => <UserMakeTransaction {...props} username={username} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <UserProfile {...props} username={username} navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default UserBase