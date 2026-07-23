import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ToastHost } from '@/components/toast'
import { ModuleScaffold } from '@/pages/Scaffold'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Perfil from '@/pages/Perfil'
import Experiencia from '@/pages/Experiencia'
import Reembolsos from '@/pages/Reembolsos'
import Gamificacao from '@/pages/Gamificacao'
import Comunicados from '@/pages/Comunicados'
import Notificacoes from '@/pages/Notificacoes'
import Notas from '@/pages/Notas'
import Beneficios from '@/pages/Beneficios'
import Eventos from '@/pages/Eventos'
import Ausencias from '@/pages/Ausencias'
import Manual from '@/pages/Manual'
import CentralDuvidas from '@/pages/CentralDuvidas'
import Admin from '@/pages/Admin'
import Assistente from '@/pages/Assistente'
import Gestor from '@/pages/Gestor'
import RH from '@/pages/RH'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/experiencia" element={<Experiencia />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/reembolsos" element={<Reembolsos />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/recesso" element={<Ausencias tipo="recesso" />} />
          <Route path="/folgas" element={<Ausencias tipo="folga" />} />
          <Route path="/beneficios" element={<Beneficios />} />
          <Route path="/comunicados" element={<Comunicados />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/gamificacao" element={<Gamificacao />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          {/* Módulos scaffoldados (roadmap pronto p/ construir) */}
          <Route path="/manual" element={<Manual />} />
          <Route path="/faq" element={<CentralDuvidas />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/treinamentos" element={<ModuleScaffold />} />
          <Route path="/feedback" element={<ModuleScaffold />} />
          <Route path="/onboarding" element={<ModuleScaffold />} />
          <Route path="/offboarding" element={<ModuleScaffold />} />
          <Route path="/gestor" element={<Gestor />} />
          <Route path="/rh" element={<RH />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/seguranca" element={<ModuleScaffold />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  )
}
