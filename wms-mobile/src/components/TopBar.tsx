import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../theme/theme';

/**
 * Barra superior: voltar grande + título + slot direito.
 * Respeita o inset superior (Dynamic Island / notch / barra de status) — o cabeçalho
 * colorido sangra até o topo, mas o conteúdo desce o suficiente para o botão voltar
 * ficar sempre clicável.
 */
export function TopBar({
  title,
  subtitle,
  onBack,
  right,
  tint = colors.brand,
  onTint = colors.onBrand,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  tint?: string;
  onTint?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={16}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={30} color={onTint} />
        </Pressable>
      ) : (
        <View style={styles.backBtn} />
      )}

      <View style={styles.titleBox}>
        <Text numberOfLines={1} style={[styles.title, { color: onTint }]}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: onTint }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleBox: { flex: 1 },
  title: { fontSize: type.title, fontWeight: '800' },
  subtitle: { fontSize: type.caption, opacity: 0.7, marginTop: 1, fontWeight: '600' },
  right: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
});
