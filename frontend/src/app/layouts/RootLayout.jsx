import { Link, Outlet } from 'react-router-dom'

function RootLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-ink)]">
      <header className="border-b border-[color:var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold font-[var(--font-display)]">
            Voto Claro
          </Link>
          <div className="flex items-center gap-4 text-sm text-[var(--app-muted)]">
            <span className="hidden sm:inline">Asistente de programas de gobierno</span>
            <Link
              to="/organizers/login"
              className="rounded-full border border-[color:var(--app-border)] px-3 py-1 font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Organizadores
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
