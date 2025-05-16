import {useEffect, useState, useCallback} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import theme from '../utils/theme';

const useTheme = () => {
  const [colors, setColors] = useState(theme.light);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Toggle between dark/light mode
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Set theme based on preference
  const setTheme = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setSystemTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Update colors when theme preference changes
  useEffect(() => {
    const colorScheme = isDarkMode ? 'dark' : systemTheme;
    setColors(colorScheme === 'dark' ? theme.dark : theme.light);
  }, [isDarkMode, systemTheme]);

  return {
    colors,
    isDarkMode,
    toggleTheme,
    setTheme,
    systemTheme
  };
};

export default useTheme;