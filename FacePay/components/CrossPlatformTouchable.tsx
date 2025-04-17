import React from 'react';
import { 
  TouchableOpacity, 
  TouchableNativeFeedback, 
  Platform, 
  View 
} from 'react-native';

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
  // On Android, use TouchableNativeFeedback for the ripple effect
  if (Platform.OS === 'android' && Platform.Version >= 21) {
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

  // On iOS and older Android versions, use TouchableOpacity
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