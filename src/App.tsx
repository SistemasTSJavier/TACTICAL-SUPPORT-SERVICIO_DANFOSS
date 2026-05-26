import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { EvaluacionProvider } from '@/context/EvaluacionProvider'
import { DashboardPage } from '@/pages/DashboardPage'
import { PresentacionPage } from '@/pages/PresentacionPage'

export default function App() {
  return (
    <EvaluacionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/presentacion" element={<PresentacionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </EvaluacionProvider>
  )
}
