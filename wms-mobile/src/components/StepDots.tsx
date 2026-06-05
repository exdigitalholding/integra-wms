import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/theme';

/** Progresso por bolinhas — feedback visual de "quanto falta", sem texto. */
export function StepDots({ total, atual, cor = colors.accent }: { total: number; atual: number; cor?: string }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const feito = i < atual;
        const ativo = i === atual;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              feito && { backgroundColor: cor, width: 12 },
              ativo && { backgroundColor: cor, width: 28 },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { height: 12, width: 12, borderRadius: radius.pill, backgroundColor: colors.line },
});
