import { Platform, StatusBar, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Platform detection
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

// Font families by platform
export const FONT_FAMILY = {
  regular: IS_IOS ? 'System' : 'Roboto',
  medium: IS_IOS ? 'System' : 'Roboto-Medium',
  bold: IS_IOS ? 'System' : 'Roboto-Bold',
};

// Screen dimensions
export const SCREEN = {
  width,
  height,
};

// Platform-specific shadow
export const createShadow = (
  color = '#000',
  opacity = 0.2,
  elevation = 5,
  radius = 3.5,
  offsetX = 0,
  offsetY = 3
) => {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: elevation,
    },
    default: {
      // For web or other platforms
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    }
  });
};

export default {
  IS_IOS,
  IS_ANDROID,
  STATUS_BAR_HEIGHT,
  FONT_FAMILY,
  SCREEN,
  createShadow
};