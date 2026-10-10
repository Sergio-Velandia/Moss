import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Journal from './pages/Journal'
import Lab from './pages/Lab'
import LabDetail from './pages/LabDetail'
import Manual from './pages/Manual'

// Estas páginas cargan el renderizador de Markdown o el buscador: se descargan solo al visitarlas
const Herbario = lazy(() => import('./pages/Herbario'))
const JournalPost = lazy(() => import('./pages/JournalPost'))
const ManualDoc = lazy(() => import('./pages/ManualDoc'))

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
