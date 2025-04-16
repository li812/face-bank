import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { StyleSheet, TouchableOpacity } from 'react-native'

import UserDashboard from './UserDashboard'
import UserMakeTransaction from './UserMakeTransaction'
import UserProfile from './UserProfile'
import ViewAccount from './ViewAccount'
import AddAccount from './AddAccount'
import ViewTransactions from './ViewTransactions'
import ApplyLoan from './ApplyLoan'
import SendComplaints from './SendComplaints'
import ManageComplaints from './ManageComplaints'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TabScreens = ({ username, navigation }) => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#00abe9',
      tabBarInactiveTintColor: 'rgba(75, 75, 75, 0.57)',
      tabBarStyle: { backgroundColor: 'transparent', position: 'absolute', borderTopWidth: 0 },
      tabBarBackground: () => (
        <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
      ),
      tabBarIcon: ({ color, focused }) => {
        const size = 34
        if (route.name === 'Dashboard') {
          return <MaterialIcons name="dashboard" size={size} color={color} />
        }
        if (route.name === 'SendMoney') {
          return <MaterialCommunityIcons name="bank-transfer" size={size} color={color} />
        }
        if (route.name === 'Profile') {
          return <MaterialIcons name="person" size={size} color={color} />
        }
        return null
      },
      tabBarButton: (props) =>
        route.name === 'ViewAccount' ||
        route.name === 'AddAccount' ||
        route.name === 'ViewTransactions' ||
        route.name === 'ApplyLoan' ||
        route.name === 'SendComplaints' ||
        route.name === 'ManageComplaints'
          ? null
          : <TouchableOpacity {...props} />,
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
    <Tab.Screen
      name="ViewAccount"
      options={{ tabBarButton: () => null }}
    >
      {props => <ViewAccount {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen
      name="AddAccount"
      options={{ tabBarButton: () => null }}
    >
      {props => <AddAccount {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen
      name="ViewTransactions"
      options={{ tabBarButton: () => null }}
    >
      {props => <ViewTransactions {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen
      name="ApplyLoan"
      options={{ tabBarButton: () => null }}
    >
      {props => <ApplyLoan {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen
      name="SendComplaints"
      options={{ tabBarButton: () => null }}
    >
      {props => <SendComplaints {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen
      name="ManageComplaints"
      options={{ tabBarButton: () => null }}
    >
      {props => <ManageComplaints {...props} username={username} />}
    </Tab.Screen>
  </Tab.Navigator>
)

const UserBase = ({ route, navigation }: any) => {
  const { username } = route.params || {}

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {props => <TabScreens {...props} username={username} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default UserBase