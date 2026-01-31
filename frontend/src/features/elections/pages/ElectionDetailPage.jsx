import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listCandidates } from '../../candidates/services/candidatesService.js'
import { getElection } from '../services/electionsService.js'
import CandidateCard from '../../candidates/components/CandidateCard.jsx'

function ElectionDetailPage() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [electionData, candidatesData] = await Promise.all([
          getElection(id),
          listCandidates({ electionId: id }),
        ])

        if (isMounted) {
          setElection(electionData)
          setCandidates(candidatesData)
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la informacion de la eleccion.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
        <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
          Cargando informacion de la eleccion...
        </section>
    )
  }

  if (error || !election) {
    return (
        <section className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || 'Eleccion no encontrada.'}
          </div>
          <Link
              to="/"
              className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)]"
          >
            Volver al inicio
          </Link>
        </section>
    )
  }

  return (
      <section className="space-y-8">
        <header className="space-y-3">
          <Link
              to="/"
              className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]"
          >
            ← Volver a elecciones
          </Link>

          <div>
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
              {election.name}
            </h1>
            {election.organizationName ? (
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
                  {election.organizationName}
                </p>
            ) : null}
          </div>

          {election.description ? (
              <p className="max-w-3xl text-sm text-[var(--app-muted)]">
                {election.description}
              </p>
          ) : null}

          <div className="flex flex-wrap gap-2 text-xs text-[var(--app-muted)]">
            {election.type ? (
                <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
              {election.type}
            </span>
            ) : null}
            {election.mode ? (
                <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
              {election.mode === 'organizational' ? 'Organizacional' : election.mode}
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
          </div>

          {/* Botones para comparar y buscar propuestas */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
                to={`/elections/${id}/compare`}
                className="inline-flex items-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--app-accent-strong)] transition hover:border-[color:var(--app-accent)]"
            >
              Comparar candidaturas
            </Link>
            <Link
                to={`/elections/${id}/proposals/search`}
                className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Buscar propuestas
            </Link>
            <Link
                to={`/elections/${id}/interviews`}
                className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Ver entrevistas
            </Link>
          </div>
        </header>

        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-ink)]">
              Candidaturas registradas
            </h2>
            <p className="text-sm text-[var(--app-muted)]">
              Haz clic en cualquier candidato para ver su perfil completo con biografia, plan de
              gobierno y propuestas.
            </p>
          </div>

          {candidates.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} electionId={id} />
                ))}
              </div>
          ) : (
              <div className="rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
                Aun no hay candidaturas registradas para esta eleccion.
              </div>
          )}
        </section>
      </section>
  )
}

export default ElectionDetailPage
