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
  disableAndroidFallback?: boolean; // New prop to disable Android fallback
}

const CrossPlatformBlur: React.FC<CrossPlatformBlurProps> = ({
  intensity = 50,
  tint = 'default',
  style,
  children,
  fallbackColor = 'rgba(255, 255, 255, 0.6)', // Reduce default opacity
  disableAndroidFallback = false
}) => {
  // For iOS, use native BlurView which works well
  if (IS_IOS) {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.blurContainer, style]}>
        {children}
      </BlurView>
    );
  }
  
  // For Android, either use a more subtle background or disable fallback entirely
  return (
    <View 
      style={[
        styles.blurContainer, 
        { 
          // Only apply background if not disabled
          backgroundColor: disableAndroidFallback ? 'transparent' : 
            tint === 'dark' 
              ? 'rgba(0, 0, 0, 0.4)' // Reduced opacity 
              : tint === 'light' 
                ? fallbackColor 
                : 'rgba(255, 255, 255, 0.5)' // Reduced opacity
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
    // Don't apply flex: 1 by default - let parent component control sizing
  },
});

export default CrossPlatformBlur;