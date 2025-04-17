import React from 'react';
import { TouchableOpacity, TouchableNativeFeedback, View } from 'react-native';
import { IS_IOS } from '../utils/platformUtils';

interface TouchableProps {
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  children: React.ReactNode;
  activeOpacity?: number;
  background?: any; // For Android ripple effect
  useForeground?: boolean; // For Android ripple effect
}

const CrossPlatformTouchable = ({
  onPress,
  style,
  disabled = false,
  children,
  activeOpacity = 0.7,
  background = TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.2)', false),
  useForeground = true,
  ...props
}: TouchableProps) => {
  // Use our reliable platform detection
  if (!IS_IOS) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        disabled={disabled}
        background={background}
        useForeground={useForeground}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  // For iOS
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
      disabled={disabled}
      activeOpacity={activeOpacity}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default CrossPlatformTouchable;