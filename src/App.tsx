import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Lab from './pages/Lab'
import LabDetail from './pages/LabDetail'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="laboratorio" element={<Lab />} />
          <Route path="laboratorio/:slug" element={<LabDetail />} />
          <Route path="manual" element={<Placeholder title="El Manual" desc="Documentación técnica, configuraciones y guías paso a paso." />} />
          <Route path="bitacora" element={<Placeholder title="La Bitácora" desc="Artículos, aprendizajes y decisiones de arquitectura." />} />
          <Route path="herbario" element={<Placeholder title="El Herbario" desc="Búsqueda global sobre todo el conocimiento del jardín." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
