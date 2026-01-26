import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listElections } from '../services/electionsService.js'

function ElectionListPage() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchElections = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listElections({ isActive: true })
        if (isMounted) {
          setElections(data)
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar las elecciones activas.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchElections()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--app-ink)]">
          Elecciones disponibles
        </h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          Selecciona un proceso para ver candidaturas, propuestas y comparaciones.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
          Cargando elecciones activas...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : elections.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {elections.map((election) => (
            <article
              key={election.id}
              className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--app-ink)]">
                    {election.name}
                  </h2>
                  {election.organizationName ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[var(--app-muted)]">
                      {election.organizationName}
                    </p>
                  ) : null}
                </div>
                {election.isActive ? (
                  <span className="rounded-full bg-[color:var(--app-accent)]/20 px-3 py-1 text-xs font-semibold text-[var(--app-accent-strong)]">
                    Activa
                  </span>
                ) : null}
              </div>

              {election.description ? (
                <p className="mt-3 text-sm text-[var(--app-muted)]">
                  {election.description}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--app-muted)]">
                {election.type ? (
                  <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                    {election.type}
                  </span>
                ) : null}
                {election.mode ? (
                  <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                    {election.mode === 'organizational'
                      ? 'Organizacional'
                      : election.mode}
                  </span>
                ) : null}
                {election.date ? (
                  <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                    {election.date}
                  </span>
                ) : null}
                {election.positions?.length ? (
                  <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                    {election.positions.join(', ')}
                  </span>
                ) : null}
                <Link
                  to={`/elections/${election.id}`}
                  className="ml-auto rounded-full border border-[color:var(--app-border)] px-3 py-1 text-xs font-semibold text-[var(--app-accent-strong)] transition hover:border-[color:var(--app-accent)]"
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
          Aun no hay elecciones activas publicadas. Vuelve pronto.
        </div>
      )}
    </section>
  )
}

export default ElectionListPage
