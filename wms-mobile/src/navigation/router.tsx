import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Roteador mínimo baseado em pilha de estado — sem dependência externa.
 * Combina com o modelo do coletor: poucas telas, sempre "uma de cada vez".
 */
export type RouteName = 'login' | 'home' | 'lista' | 'fluxo' | 'ocorrencia' | 'sucesso';

export interface Route {
  name: RouteName;
  params?: Record<string, any>;
}

interface NavApi {
  route: Route;
  stackDepth: number;
  navigate: (name: RouteName, params?: Record<string, any>) => void;
  replace: (name: RouteName, params?: Record<string, any>) => void;
  back: () => void;
  reset: (name: RouteName, params?: Record<string, any>) => void;
  /** Substitui a pilha inteira por uma sequência — útil pra deixar "home" como base e abrir uma tela em cima (back volta pra home). */
  resetStack: (routes: Route[]) => void;
}

const NavContext = createContext<NavApi | null>(null);

export function NavProvider({ children, initial = 'login' }: { children: React.ReactNode; initial?: RouteName }) {
  const [stack, setStack] = useState<Route[]>([{ name: initial }]);

  const navigate = useCallback((name: RouteName, params?: Record<string, any>) => {
    setStack((s) => [...s, { name, params }]);
  }, []);

  const replace = useCallback((name: RouteName, params?: Record<string, any>) => {
    setStack((s) => [...s.slice(0, -1), { name, params }]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const reset = useCallback((name: RouteName, params?: Record<string, any>) => {
    setStack([{ name, params }]);
  }, []);

  const resetStack = useCallback((routes: Route[]) => {
    setStack(routes.length > 0 ? routes : [{ name: 'home' }]);
  }, []);

  const value = useMemo<NavApi>(
    () => ({ route: stack[stack.length - 1], stackDepth: stack.length, navigate, replace, back, reset, resetStack }),
    [stack, navigate, replace, back, reset, resetStack],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav fora do NavProvider');
  return ctx;
}
