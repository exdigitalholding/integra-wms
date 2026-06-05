import React, { createContext, useContext, useState } from 'react';
import type { Operador } from '../types';

/** Sessão do operador logado (mock — sem auth real nesta fase). */
interface SessionApi {
  operador: Operador | null;
  entrar: (op: Operador) => void;
  sair: () => void;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [operador, setOperador] = useState<Operador | null>(null);
  return (
    <SessionContext.Provider value={{ operador, entrar: setOperador, sair: () => setOperador(null) }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession fora do SessionProvider');
  return ctx;
}
