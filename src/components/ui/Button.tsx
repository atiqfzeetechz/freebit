import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

interface ButtonProps {
    title: string;
    loading?: boolean;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    icon?: React.ReactNode;
    fullWidth?: boolean;
    // Custom style props
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    iconPosition?: 'left' | 'right';
}

export default function MyButton(props: ButtonProps) {
  const { 
    title, 
    loading = false, 
    onPress, 
    disabled = false, 
    variant = 'primary',
    icon,
    fullWidth = false,
    buttonStyle,
    textStyle,
    iconPosition = 'left'
  } = props;

  const getButtonStyle = () => {
    let baseStyle;
    switch (variant) {
      case 'secondary':
        baseStyle = [styles.button, styles.secondaryButton];
        break;
      case 'outline':
        baseStyle = [styles.button, styles.outlineButton];
        break;
      case 'danger':
        baseStyle = [styles.button, styles.dangerButton];
        break;
      default:
        baseStyle = [styles.button, styles.primaryButton];
    }

    return [
      ...baseStyle,
      disabled && styles.disabledButton,
      fullWidth && styles.fullWidth,
      buttonStyle // Merge custom button style
    ];
  };

  const getTextStyle = () => {
    let baseStyle;
    switch (variant) {
      case 'secondary':
        baseStyle = [styles.buttonText, styles.secondaryButtonText];
        break;
      case 'outline':
        baseStyle = [styles.buttonText, styles.outlineButtonText];
        break;
      case 'danger':
        baseStyle = [styles.buttonText, styles.dangerButtonText];
        break;
      default:
        baseStyle = [styles.buttonText, styles.primaryButtonText];
    }

    return [
      ...baseStyle,
      textStyle // Merge custom text style
    ];
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {icon && iconPosition === 'left' && (
        <View style={[styles.iconContainer, { marginRight: 8 }]}>{icon}</View>
      )}
      <Text style={getTextStyle()}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <View style={[styles.iconContainer, { marginLeft: 8 }]}>{icon}</View>
      )}
    </View>
  );

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator 
          color={
            variant === 'outline' ? '#6e45e2' : 
            variant === 'danger' ? '#fff' :
            '#fff'
          } 
        />
      ) : (
        renderContent()
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    flexDirection: 'row',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#6e45e2',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#2c3e50',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6e45e2',
  },
  outlineButtonText: {
    color: '#6e45e2',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    // margin is now handled dynamically based on position
  },
  fullWidth: {
    width: '100%',
  },
});