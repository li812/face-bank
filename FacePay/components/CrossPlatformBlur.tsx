import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  
  // For Android, use a gradient or semi-transparent background as fallback
  if (Platform.OS === 'android') {
    // Get adjusted colors based on tint and intensity
    const getGradientColors = () => {
      // Convert intensity (0-100) to opacity (0-0.8)
      const baseOpacity = Math.min(intensity / 125, 0.8);
      
      if (tint === 'dark') {
        return [
          `rgba(0, 0, 0, ${baseOpacity})`, 
          `rgba(20, 20, 20, ${baseOpacity + 0.05})`
        ];
      } else if (tint === 'light') {
        // Parse fallbackColor to get the base
        let baseColor = [255, 255, 255]; // Default white
        if (fallbackColor.startsWith('rgba(')) {
          const matches = fallbackColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          if (matches && matches.length === 5) {
            baseColor = [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
          }
        }
        
        return [
          `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${baseOpacity})`,
          `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${baseOpacity + 0.1})`
        ];
      } else {
        // Default tint
        return [
          `rgba(255, 255, 255, ${baseOpacity * 0.7})`,
          `rgba(240, 240, 240, ${baseOpacity + 0.05})`
        ];
      }
    };

    const gradientColors = getGradientColors();
    
    return (
      <LinearGradient 
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blurContainer, style]}
      >
        {children}
      </LinearGradient>
    );
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