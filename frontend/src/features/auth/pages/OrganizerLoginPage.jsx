import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInOrganizer } from '../services/authService.js'
import useAuth from '../hooks/useAuth.js'

const errorMessages = {
  'auth/invalid-credential': 'Credenciales invalidas. Revisa tu correo y contrasena.',
  'auth/user-not-found': 'La cuenta no existe o no esta habilitada.',
  'auth/wrong-password': 'Contrasena incorrecta.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentar.',
  'auth/invalid-email': 'Correo no valido.',
  'auth/network-request-failed': 'Conexion inestable. Revisa tu red e intenta de nuevo.',
}

function OrganizerLoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => Boolean(email.trim() && password), [email, password])

  useEffect(() => {
    if (user) {
      navigate('/organizers', { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      await signInOrganizer(email.trim(), password)
      navigate('/organizers', { replace: true })
    } catch (err) {
      const message =
        errorMessages[err?.code] || 'No se pudo iniciar sesion. Intenta de nuevo.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,255,255,0))]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--app-accent)]/25 blur-[120px]" />
      <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[color:var(--app-accent-strong)]/20 blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 animate-fade-rise">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--app-muted)]">
              Acceso exclusivo
            </p>
            <h1 className="text-4xl font-[var(--font-display)] text-[var(--app-ink)] sm:text-5xl">
              Panel seguro para organizadores de procesos electorales
            </h1>
            <p className="max-w-xl text-sm text-[var(--app-muted)] sm:text-base">
              Este portal es solo para equipos autorizados. Inicia sesion con tu cuenta de
              Firebase y administra procesos municipales, empresariales o nacionales.
            </p>
            <div className="grid gap-3 text-sm text-[var(--app-muted)] sm:grid-cols-2">
              {[
                'Controla el calendario de cada eleccion',
                'Actualiza candidaturas y propuestas',
                'Genera reportes con fuentes verificadas',
                'Coordina equipos en tiempo real',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--app-accent-strong)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-rise-delay rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
                Inicio de sesion
              </p>
              <h2 className="text-2xl font-[var(--font-display)] text-[var(--app-ink)]">
                Organizador
              </h2>
              <p className="text-sm text-[var(--app-muted)]">
                Accede con el correo registrado en Firebase Authentication.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-[var(--app-ink)]">
                Correo
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="organizador@votoclaro.com"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm text-[var(--app-ink)] shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                />
              </label>

              <label className="block text-sm font-medium text-[var(--app-ink)]">
                Contrasena
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm text-[var(--app-ink)] shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-[color:var(--app-accent-strong)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Validando acceso...' : 'Ingresar'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-[var(--app-muted)]">
              <span>Solo cuentas autorizadas.</span>
              <Link className="font-semibold text-[var(--app-accent-strong)]" to="/">
                Volver al sitio publico
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default OrganizerLoginPage
