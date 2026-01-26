import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

function OrganizerProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--app-muted)]">
        Verificando sesion...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/organizers/login" replace />
  }

  return <Outlet />
}

export default OrganizerProtectedRoute
