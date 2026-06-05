import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavProvider } from './src/navigation/router';
import { SessionProvider } from './src/navigation/session';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Integra Coletor — App do operador de chão (React Native + Expo).
 * Sem backend nesta fase: todos os dados vêm de src/data/mock.ts.
 *
 * Providers:
 *  - SafeAreaProvider: respeita notch / barra de status
 *  - SessionProvider: operador logado (mock)
 *  - NavProvider: roteador em pilha de estado (sem libs externas)
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <NavProvider initial="login">
          <AppNavigator />
        </NavProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
