import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Journal from './pages/Journal'
import Lab from './pages/Lab'
import LabDetail from './pages/LabDetail'
import Manual from './pages/Manual'
import NotFound from './pages/NotFound'

// Estas páginas cargan el renderizador de Markdown o el buscador: se descargan solo al visitarlas
const Herbario = lazy(() => import('./pages/Herbario'))
const JournalPost = lazy(() => import('./pages/JournalPost'))
const ManualDoc = lazy(() => import('./pages/ManualDoc'))
const Legal = lazy(() => import('./pages/Legal'))
// La página de Nexus trae sus propias fuentes: tampoco entra en el bundle inicial
const Nexus = lazy(() => import('./pages/Nexus'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDoc = lazy(() => import('./pages/ProjectDoc'))

export default function App() {
  return (
    // reducedMotion="user": si el sistema pide menos movimiento, se omiten las animaciones de desplazamiento
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="laboratorio" element={<Lab />} />
            <Route path="laboratorio/:slug" element={<LabDetail />} />
            <Route path="manual" element={<Manual />} />
            <Route path="manual/:category/:slug" element={<ManualDoc />} />
            <Route path="bitacora" element={<Journal />} />
            <Route path="bitacora/:slug" element={<JournalPost />} />
            <Route path="herbario" element={<Herbario />} />
            <Route path="nexus" element={<Nexus />} />
            <Route path="proyectos" element={<Projects />} />
            <Route path="proyectos/:slug" element={<ProjectDoc />} />
            <Route path="terminos" element={<Legal slug="terminos" />} />
            <Route path="privacidad" element={<Legal slug="privacidad" />} />
            <Route path="proteccion-de-datos" element={<Legal slug="proteccion-de-datos" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
