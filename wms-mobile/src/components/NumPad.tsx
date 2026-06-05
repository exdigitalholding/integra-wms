import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/theme';
import { tapLeve } from '../lib/haptics';

/** Teclado numérico grande, reutilizável (quantidade / contagem). */
export function NumPad({ onDigit, onClear }: { onDigit: (d: string) => void; onClear: () => void }) {
  return (
    <View style={styles.pad}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <PadKey key={d} label={d} onPress={() => { tapLeve(); onDigit(d); }} />
      ))}
      <PadKey icon="backspace-outline" onPress={() => { tapLeve(); onClear(); }} />
      <PadKey label="0" onPress={() => { tapLeve(); onDigit('0'); }} />
      <View style={styles.key} />
    </View>
  );
}

function PadKey({ label, icon, onPress }: { label?: string; icon?: any; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'apagar'}
      style={({ pressed }) => [styles.key, styles.keyActive, pressed && { opacity: 0.5 }]}
    >
      {icon ? <Ionicons name={icon} size={28} color={colors.ink} /> : <Text style={styles.keyTxt}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  key: { width: '31%', height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  keyActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  keyTxt: { fontSize: 30, fontWeight: '800', color: colors.ink },
});
