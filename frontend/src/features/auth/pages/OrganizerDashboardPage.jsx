import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOutOrganizer } from '../services/authService.js'
import useAuth from '../hooks/useAuth.js'

function OrganizerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutOrganizer()
      navigate('/organizers/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-muted)]">
          Panel de organizadores
        </p>
        <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
          Bienvenido{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--app-muted)]">
          Desde aqui se administran los procesos de eleccion, candidaturas y reportes.
          Esta area solo esta disponible para cuentas autorizadas en Firebase.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Procesos activos',
            description: 'Configura los periodos y la visibilidad de cada eleccion.',
          },
          {
            title: 'Candidaturas',
            description: 'Carga candidatos, propuestas y fuentes verificadas.',
          },
          {
            title: 'Reportes',
            description: 'Genera reportes y resumenes para el equipo electoral.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          >
            <h2 className="text-lg font-semibold text-[var(--app-ink)]">{card.title}</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">{card.description}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
      </button>
    </section>
  )
}

export default OrganizerDashboardPage
