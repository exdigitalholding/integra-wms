import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store/useStore'
import Shell from './components/Shell'
import { Toaster } from './components/ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Recebimento from './pages/Recebimento'
import Putaway from './pages/Putaway'
import CrossDocking from './pages/CrossDocking'
import Estoque from './pages/Estoque'
import Inventario from './pages/Inventario'
import Reabastecimento from './pages/Reabastecimento'
import Picking from './pages/Picking'
import Expedicao from './pages/Expedicao'
import Tarefas from './pages/Tarefas'
import Coletor from './pages/Coletor'
import Faturamento from './pages/Faturamento'
import Relatorios from './pages/Relatorios'
import Integracoes from './pages/Integracoes'
import Configuracoes from './pages/Configuracoes'
import TransicaoOperacional from './pages/TransicaoOperacional'

const Mapa3D = lazy(() => import('./pages/Mapa3D'))

export default function App() {
  const autenticado = useStore((s) => s.autenticado)

  return (
    <>
      <Routes>
        <Route path="/login" element={autenticado ? <Navigate to="/" replace /> : <Login />} />
        <Route element={autenticado ? <Shell /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recebimento" element={<Recebimento />} />
          <Route path="/putaway" element={<Putaway />} />
          <Route path="/cross-docking" element={<CrossDocking />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route
            path="/mapa-3d"
            element={
              <Suspense
                fallback={
                  <div className="flex h-[60vh] items-center justify-center text-sm text-ink-muted">
                    Carregando planta 3D…
                  </div>
                }
              >
                <Mapa3D />
              </Suspense>
            }
          />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/reabastecimento" element={<Reabastecimento />} />
          <Route path="/picking" element={<Picking />} />
          <Route path="/expedicao" element={<Expedicao />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/coletor" element={<Coletor />} />
          <Route path="/faturamento" element={<Faturamento />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/integracoes" element={<Integracoes />} />
          <Route path="/transicao-operacional" element={<TransicaoOperacional />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
