import colors from './colors';

const theme = {
  light: {
    // Basics
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,

    // Backgrounds
    background: colors.background,
    backgroundSecondary: colors.gray100,
    backgroundTertiary: colors.gray200,

    // Text
    text: colors.textPrimary,
    textColor: 'black',
    textSecondary: colors.textSecondary,
    textTertiary: colors.textLight,
    textInverse: colors.textInverse,

    // Borders
    border: colors.border,
    borderDark: colors.gray400,

    // Status
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    // Components
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    disabled: colors.disabled,
  },
  dark: {
    // Basics
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,

    // Backgrounds
    background: colors.backgroundDark,
    backgroundSecondary: colors.gray800,
    backgroundTertiary: colors.gray700,

    // Text
    text: colors.textInverse,
    textColor: 'white',
    textSecondary: colors.gray400,
    textTertiary: colors.gray500,
    textInverse: colors.textPrimary,

    // Borders
    border: colors.gray700,
    borderDark: colors.gray600,

    // Status
    success: colors.accentLight,
    warning: colors.secondaryLight,
    error: '#FCA5A5', // Red-300 for better dark mode visibility
    info: '#93C5FD', // Blue-300

    // Components
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    accent: colors.accentLight,
    disabled: colors.gray600,
  },
};

export default theme;