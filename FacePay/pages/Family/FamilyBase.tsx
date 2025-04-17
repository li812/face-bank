import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, Image } from 'react-native'

// Import components from the app
import FamilyDashboard from './FamilyDashboard'
import FamilyMakeTransaction from './FamilyMakeTransaction'
import UserProfile from './FamilyProfile'
import ExchangeRate from './ExchangeRate'


// Import the unified stylesheet and components
import styleSheet, { colors, typography, layout, components, PLATFORM } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TabScreens = ({ username, first_name, last_name, navigation }) => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: 'rgba(75, 75, 75, 0.57)',
      tabBarStyle: { 
        backgroundColor: 'transparent', 
        position: 'absolute', 
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        height: 75,
        paddingBottom: 1,
      },
      tabBarBackground: () => (
        <CrossPlatformBlur 
          tint="light" 
          intensity={80} 
          style={StyleSheet.absoluteFill}
          fallbackColor="rgba(255, 255, 255, 0.8)" 
        />
      ),
      tabBarIcon: ({ color, focused }) => {
        const size = 32
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
      tabBarLabelStyle: {
        fontFamily: FONT_FAMILY.medium,
        fontSize: 15,
        height: 35,
      },
      // Only allow tab buttons for the main tabs
      tabBarButton: (props) => {
        if (
          route.name === 'ViewAccount' ||
          route.name === 'AddAccount' ||
          route.name === 'ViewTransactions' ||
          route.name === 'ApplyLoan' ||
          route.name === 'SendComplaints' ||
          route.name === 'ManageComplaints' ||
          route.name === 'ExchangeRate' ||
          route.name === 'AddFamily'
        ) {
          return null;
        }
        
        // Use CrossPlatformTouchable for consistent behavior
        return <CrossPlatformTouchable {...props} activeOpacity={0.6} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard">
      {props => <FamilyDashboard {...props} username={username} first_name={first_name} last_name={last_name} />}
    </Tab.Screen>
    <Tab.Screen name="SendMoney">
      {props => <FamilyMakeTransaction {...props} username={username} />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {props => <UserProfile {...props} username={username} navigation={navigation} />}
    </Tab.Screen>
  </Tab.Navigator>
)

const UserBase = ({ route, navigation }: any) => {
  const { username, first_name, last_name } = route.params || {}

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image - Place it here so it's visible across all screens */}
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      {/* Overlay for glass effect */}
      <View style={components.gradient} pointerEvents="none" />
      
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { 
            backgroundColor: 'transparent' // Make Stack screen backgrounds transparent
          },
          animation: 'fade',
          animationDuration: 200
        }}
      >
        <Stack.Screen name="Tabs">
          {props => <TabScreens {...props} username={username} first_name={first_name} last_name={last_name} navigation={navigation} />}
        </Stack.Screen>
        
        {/* Additional screens that need to be outside the tab navigator */}
        <Stack.Screen 
          name="AddFamily" 
          component={AddFamily}
          initialParams={{ username }}
        />
      </Stack.Navigator>
    </View>
  )
}

export default UserBase