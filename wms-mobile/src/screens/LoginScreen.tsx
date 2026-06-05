import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { colors, radius, spacing, type } from '../theme/theme';
import { OPERADORES } from '../data/mock';
import type { Operador } from '../types';
import { useSession } from '../navigation/session';
import { useNav } from '../navigation/router';
import { erro, sucesso, tapLeve } from '../lib/haptics';

/** Operador visitante — entra sem escolher nome nem PIN (modo demo/anônimo). */
const VISITANTE: Operador = {
  id: 'guest', nome: 'Visitante', pin: '', iniciais: 'VI', cor: colors.accent, turno: 'Modo demonstração',
};

/**
 * Login em 2 passos, SEM teclado de texto:
 * 1) toca no seu rosto/nome   2) digita PIN de 4 dígitos grandes.
 * Operador de baixa alfabetização não digita usuário/senha.
 */
export function LoginScreen() {
  const { entrar } = useSession();
  const { reset } = useNav();
  const [sel, setSel] = useState<Operador | null>(null);
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const digitar = (d: string) => {
    tapLeve();
    if (pin.length >= 4) return;
    const novo = pin + d;
    setPin(novo);
    if (novo.length === 4) validar(novo);
  };

  const validar = (valor: string) => {
    if (sel && valor === sel.pin) {
      sucesso();
      entrar(sel);
      reset('home');
    } else {
      erro();
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  };

  const apagar = () => {
    tapLeve();
    setPin((p) => p.slice(0, -1));
  };

  const entrarVisitante = () => {
    sucesso();
    entrar(VISITANTE);
    reset('home');
  };

  return (
    <LinearGradient colors={[colors.brand, colors.brandDark]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Screen bg="transparent">
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImg}
              resizeMode="contain"
              accessibilityLabel="Integra WMS"
            />
          </View>
          <View>
            <Text style={styles.brandName}>INTEGRA <Text style={{ color: colors.accent }}>WMS</Text></Text>
            <Text style={styles.brandSub}>COLETOR</Text>
          </View>
        </View>

        {!sel ? (
          <View style={styles.body}>
            <Text style={styles.h1}>Quem é você?</Text>
            <Text style={styles.h2}>Toque no seu nome</Text>
            <View style={styles.grid}>
              {OPERADORES.map((op) => (
                <Pressable
                  key={op.id}
                  onPress={() => { tapLeve(); setSel(op); }}
                  accessibilityRole="button"
                  accessibilityLabel={op.nome}
                  style={({ pressed }) => [styles.opCard, pressed && { opacity: 0.8 }]}
                >
                  <View style={[styles.avatar, { backgroundColor: op.cor }]}>
                    <Text style={styles.avatarTxt}>{op.iniciais}</Text>
                  </View>
                  <Text style={styles.opNome}>{op.nome}</Text>
                  <Text style={styles.opTurno}>{op.turno}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.divisor}>
              <View style={styles.linha} />
              <Text style={styles.divisorTxt}>ou</Text>
              <View style={styles.linha} />
            </View>

            <Pressable
              onPress={entrarVisitante}
              accessibilityRole="button"
              accessibilityLabel="Entrar como visitante"
              style={({ pressed }) => [styles.visitante, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="flash" size={22} color={colors.brand} />
              <Text style={styles.visitanteTxt}>Entrar como visitante</Text>
            </Pressable>
            <Text style={styles.visitanteDica}>Acesso direto, sem senha — modo demonstração</Text>
          </View>
        ) : (
          <View style={styles.body}>
            <Pressable onPress={() => { tapLeve(); setSel(null); setPin(''); }} style={styles.voltarOp} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
              <Text style={styles.voltarTxt}>Trocar</Text>
            </Pressable>

            <View style={[styles.avatar, styles.avatarBig, { backgroundColor: sel.cor }]}>
              <Text style={styles.avatarTxtBig}>{sel.iniciais}</Text>
            </View>
            <Text style={styles.h1}>Olá, {sel.nome}</Text>
            <Text style={styles.h2}>Digite sua senha de 4 números</Text>

            <View style={[styles.pinRow, shake && styles.pinShake]}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotOn, shake && styles.pinDotErr]} />
              ))}
            </View>

            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <Key key={d} label={d} onPress={() => digitar(d)} />
              ))}
              <View style={styles.key} />
              <Key label="0" onPress={() => digitar('0')} />
              <Key icon="backspace-outline" onPress={apagar} />
            </View>
            <Text style={styles.dica}>Dica do demo: a senha é 1234</Text>
          </View>
        )}
      </Screen>
    </LinearGradient>
  );
}

function Key({ label, icon, onPress }: { label?: string; icon?: any; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'apagar'}
      style={({ pressed }) => [styles.key, styles.keyActive, pressed && { opacity: 0.6 }]}
    >
      {icon ? <Ionicons name={icon} size={28} color={colors.onBrand} /> : <Text style={styles.keyTxt}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  logoBox: { height: 48, width: 48, borderRadius: radius.md, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoImg: { height: 34, width: 34 },
  brandName: { color: colors.onBrand, fontSize: type.title, fontWeight: '900', letterSpacing: 0.5 },
  brandSub: { color: 'rgba(255,255,255,0.55)', fontSize: type.caption, fontWeight: '700', letterSpacing: 3 },

  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, alignItems: 'center' },
  h1: { color: colors.onBrand, fontSize: type.display, fontWeight: '900', marginTop: spacing.sm },
  h2: { color: 'rgba(255,255,255,0.7)', fontSize: type.body, fontWeight: '600', marginTop: spacing.xs, marginBottom: spacing.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg },
  opCard: {
    width: '44%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.xl,
    paddingVertical: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  avatar: { height: 72, width: 72, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarBig: { height: 96, width: 96 },
  avatarTxt: { color: '#fff', fontSize: type.title, fontWeight: '900' },
  avatarTxtBig: { color: '#fff', fontSize: 40, fontWeight: '900' },
  opNome: { color: colors.onBrand, fontSize: type.title, fontWeight: '800', marginTop: spacing.md },
  opTurno: { color: 'rgba(255,255,255,0.55)', fontSize: type.caption, fontWeight: '600', marginTop: 2 },

  divisor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, width: '90%' },
  linha: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  divisorTxt: { color: 'rgba(255,255,255,0.6)', fontSize: type.label, fontWeight: '700' },
  visitante: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: '#fff', borderRadius: radius.lg, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, marginTop: spacing.lg, minHeight: 64, alignSelf: 'stretch' },
  visitanteTxt: { color: colors.brand, fontSize: type.title, fontWeight: '800' },
  visitanteDica: { color: 'rgba(255,255,255,0.5)', fontSize: type.caption, fontWeight: '600', marginTop: spacing.md, textAlign: 'center' },

  voltarOp: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: spacing.md },
  voltarTxt: { color: colors.onBrand, fontSize: type.body, fontWeight: '700' },

  pinRow: { flexDirection: 'row', gap: spacing.lg, marginVertical: spacing.xl },
  pinShake: { transform: [{ translateX: 0 }] },
  pinDot: { height: 22, width: 22, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  pinDotOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  pinDotErr: { borderColor: colors.bad, backgroundColor: colors.bad },

  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 300, justifyContent: 'center', gap: spacing.md },
  key: { width: 88, height: 72, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  keyActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  keyTxt: { color: colors.onBrand, fontSize: 32, fontWeight: '800' },
  dica: { color: 'rgba(255,255,255,0.45)', fontSize: type.caption, marginTop: spacing.xl, fontWeight: '600' },
});
