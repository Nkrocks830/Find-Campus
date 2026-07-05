import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import ReportItem from './pages/ReportItem'
import Browse from './pages/Browse'
import ItemDetail from './pages/ItemDetail'
import ClaimFlow from './pages/ClaimFlow'
import Dashboard from './pages/Dashboard'
import Heatmap from './pages/Heatmap'
import VerifyQR from './pages/VerifyQR'
import useAuthStore from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
    },
  },
})

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function App() {
  const initialize = useAuthStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/report" element={
              <ProtectedRoute><ReportItem /></ProtectedRoute>
            } />
            <Route path="/claim/:itemId" element={
              <ProtectedRoute><ClaimFlow /></ProtectedRoute>
            } />
            <Route path="/verify/:token" element={
              <ProtectedRoute><VerifyQR /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              color: '#e2e8f0',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0b14' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0b14' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
