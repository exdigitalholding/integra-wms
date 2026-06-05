import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/theme';
import type { IoniconName } from '../types';
import { tapMedio } from '../lib/haptics';

type Variant = 'primary' | 'success' | 'ghost' | 'danger';

const BG: Record<Variant, string> = {
  primary: colors.brand,
  success: colors.ok,
  danger: colors.bad,
  ghost: colors.surface,
};
const FG: Record<Variant, string> = {
  primary: colors.onBrand,
  success: colors.onBrand,
  danger: colors.onBrand,
  ghost: colors.brand,
};

/**
 * Botão gigante (mín. 68px de altura). Alvo de toque enorme, ícone + texto,
 * háptico no toque. Pensado para uso com luva.
 */
export function BigButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IoniconName;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={() => {
        tapMedio();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: BG[variant] },
        isGhost && styles.ghostBorder,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={FG[variant]} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={26} color={FG[variant]} />}
            <Text style={[styles.label, { color: FG[variant] }]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 68,
    borderRadius: radius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  ghostBorder: { borderWidth: 2, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  label: { fontSize: type.title, fontWeight: '800', letterSpacing: 0.2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
