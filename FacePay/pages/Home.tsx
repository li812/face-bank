import React from 'react'
import { 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity,
  StatusBar,
  Image 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Import unified styling
import styleSheet, { colors, typography, layout, components, home } from '../appStyleSheet'
import CrossPlatformBlur from '../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../components/CrossPlatformTouchable'
import { IS_IOS } from '../utils/platformUtils'

const Home = ({ navigation }: any) => {
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      <View style={home.container}>
        {/* Background Image */}
        <Image
          source={require('../assets/background/bg2.png')}
          style={home.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <View style={home.gradient} />

        {/* Logo area */}
        <View style={home.logoContainer}>
          <Image 
            source={require('../assets/icons/logo.png')} 
            style={home.logo}
            resizeMode="contain"
          />
        </View>

        <SafeAreaView style={layout.safeArea}>
          {/* Content area */}
          <View style={layout.overlay}>
            <View style={home.glass}>
              <Text style={home.heading}>Face Pay</Text>
              <Text style={home.subheading}>Secure banking with facial recognition</Text>

              <View style={home.buttonGroup}>
                <CrossPlatformTouchable
                  style={home.button}
                  onPress={() => navigation && navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <View style={[components.buttonGradient, { backgroundColor: colors.primary }]}>
                    <Text style={components.buttonText}>Login</Text>
                  </View>
                </CrossPlatformTouchable>
                
                <CrossPlatformTouchable
                  style={home.buttonOutline}
                  onPress={() => navigation && navigation.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text style={home.buttonOutlineText}>Register</Text>
                </CrossPlatformTouchable>
              </View>
            </View>
          </View>

          {/* Footer text */}
          <Text style={components.footer}>Secure • Fast • Trusted</Text>
        </SafeAreaView>
      </View>
    </>
  )
}

export default Home