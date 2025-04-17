import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IS_IOS } from '../utils/platformUtils';

interface CrossPlatformBlurProps {
  intensity?: number;
  tint?: 'light' | 'default' | 'dark';
  style?: any;
  children?: React.ReactNode;
  fallbackColor?: string;
}

const CrossPlatformBlur: React.FC<CrossPlatformBlurProps> = ({
  intensity = 50,
  tint = 'default',
  style,
  children,
  fallbackColor = 'rgba(255, 255, 255, 0.8)'
}) => {
  // For iOS, use native BlurView which works well
  if (IS_IOS) {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.blurContainer, style]}>
        {children}
      </BlurView>
    );
  }
  
  // For Android, we have two options:
  // 1. Use experimental BlurView - may have performance issues
  // 2. Use a semi-transparent background as fallback
  
  if (Platform.OS === 'android') {
    // Option 1: Experimental blur for Android (may cause performance issues)
    return (
      <BlurView 
        intensity={intensity} 
        tint={tint}
        experimentalBlurMethod="dimezisBlurView"
        style={[styles.blurContainer, style]}
      >
        {children}
      </BlurView>
    );
    
    // Option 2: Fallback to semi-transparent view (better performance)
    // Uncomment the following and comment out the above return statement if
    // you prefer better performance over the blur effect
    /*
    return (
      <View 
        style={[
          styles.blurContainer, 
          { 
            backgroundColor: tint === 'dark' 
              ? 'rgba(0, 0, 0, 0.6)' 
              : tint === 'light' 
                ? fallbackColor 
                : 'rgba(255, 255, 255, 0.6)' 
          },
          style
        ]}
      >
        {children}
      </View>
    );
    */
  }
  
  // For Web or other platforms, use backdrop-filter if supported
  return (
    <View 
      style={[
        styles.blurContainer, 
        { 
          backdropFilter: `blur(${intensity / 4}px)`,
          backgroundColor: tint === 'dark' 
            ? 'rgba(0, 0, 0, 0.2)' 
            : tint === 'light' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(255, 255, 255, 0.1)'
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    overflow: 'hidden', // Important for borderRadius to work with BlurView
    flex: 1,
  },
});

export default CrossPlatformBlur;