import React from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Image 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VideoView, useVideoPlayer } from 'expo-video'

const { width, height } = Dimensions.get('window')

const Home = ({ navigation }: any) => {
  // Create video player
  const player = useVideoPlayer(require('../assets/background/bg1.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.backgroundVideo}
          contentFit="cover"
        />

        {/* Gradient overlay - replaced with solid color */}
        <View style={[styles.gradient, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

        {/* Logo area */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/icons/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Content area */}
          <View style={styles.overlay}>
            <View style={styles.glass}>
              <Text style={styles.heading}>Face Pay</Text>
              <Text style={styles.subheading}>Secure banking with facial recognition</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.7}
                  onPress={() => navigation && navigation.navigate('Login')}
                >
                  <View style={[styles.buttonGradient, { backgroundColor: 'rgb(0, 171, 233)' }]}>
                    <Text style={styles.buttonText}>Login</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.buttonOutline}
                  activeOpacity={0.7}
                  onPress={() => navigation && navigation.navigate('Register')}
                >
                  <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer text */}
          <Text style={styles.footer}>Secure • Fast • Trusted</Text>
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    zIndex: 2
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'black' // This will show in the status bar area
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
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
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3
  },
  logo: {
    width: 80,
    height: 80
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  glass: {
    width: '88%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 30, 40, 0.25)',
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        backdropFilter: 'blur(16px)'
      },
      android: {
        elevation: 8
      }
    })
  },
  heading: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'Roboto'
  },
  subheading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'Roboto'
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 16
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden'
  },
  buttonGradient: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  },
  buttonOutline: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 16
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    letterSpacing: 1,
    zIndex: 3,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto'
  }
})

export default Home