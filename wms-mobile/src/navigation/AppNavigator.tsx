import React from 'react';
import { useNav } from './router';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { FlowScreen } from '../screens/FlowScreen';
import { OccurrenceScreen } from '../screens/OccurrenceScreen';
import { SuccessScreen } from '../screens/SuccessScreen';

/** Mapeia a rota atual da pilha para a tela correspondente. */
export function AppNavigator() {
  const { route } = useNav();
  switch (route.name) {
    case 'login': return <LoginScreen />;
    case 'home': return <HomeScreen />;
    case 'lista': return <TaskListScreen />;
    case 'fluxo': return <FlowScreen />;
    case 'ocorrencia': return <OccurrenceScreen />;
    case 'sucesso': return <SuccessScreen />;
    default: return <LoginScreen />;
  }
}
