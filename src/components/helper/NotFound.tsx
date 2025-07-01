import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, Button, Icon, useTheme } from 'react-native-paper';

const NotFound = ({
  icon = 'alert-circle-outline',
  title = 'Not Found',
  description = 'The content you are looking for is not available',
  actionText,
  onActionPress,
  children,
}) => {
    console.log('called')
  const theme = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.colors.background,
        }
      ]}
    >
      <View style={styles.content}>
        <Icon 
          source={icon} 
          size={48} 
          color={theme.colors.primary}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        <Text style={[styles.description, { color: theme.colors.secondary }]}>
          {description}
        </Text>

        {actionText && (
          <Button 
            mode="contained" 
            onPress={onActionPress}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {actionText}
          </Button>
        )}

        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    maxWidth: 200,
  },
  buttonContent: {
    height: 48,
  },
  childrenContainer: {
    width: '100%',
    marginTop: 24,
  },
});

export default NotFound;