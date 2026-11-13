import React, { useState, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { GoldenWingTheme } from '../../constants/theme';

interface GoldenInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// memo() prevents re-render when parent state changes but this input's props haven't changed
export const GoldenInput: React.FC<GoldenInputProps> = memo(({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={GoldenWingTheme.colors.textSecondary}
          style={[
            styles.textInput,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon ? <View style={styles.iconContainer}>{rightIcon}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inputError: {
    borderColor: GoldenWingTheme.colors.danger,
  },
  textInput: {
    flex: 1,
    color: GoldenWingTheme.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  iconContainer: {
    marginHorizontal: 4,
  },
  errorText: {
    color: GoldenWingTheme.colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
