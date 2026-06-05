import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

/** Container base de toda tela: safe-area + fundo do app. */
export function Screen({
  children,
  bg = colors.bg,
  edges = ['top', 'bottom'],
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  edges?: Edge[];
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
