import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCandidate } from '../services/candidatesService.js'
import { listProposals } from '../../proposals/services/proposalsService.js'
import { getElection } from '../../elections/services/electionsService.js'

function CandidateDetailPage() {
  const { electionId, candidateId } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [election, setElection] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('biografia')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [candidateData, electionData, proposalsData] = await Promise.all([
          getCandidate(candidateId),
          getElection(electionId),
          listProposals({ candidateId }),
        ])

        if (isMounted) {
          setCandidate(candidateData)
          setElection(electionData)
          setProposals(proposalsData)
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la informacion del candidato.')
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
  }, [candidateId, electionId])

  if (loading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando informacion del candidato...
      </section>
    )
  }

  if (error || !candidate) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Candidato no encontrado.'}
        </div>
        <Link
          to={`/elections/${electionId}`}
          className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)]"
        >
          Volver a la eleccion
        </Link>
      </section>
    )
  }

  const tabs = [
    { id: 'biografia', label: 'Biografia' },
    { id: 'plan', label: 'Plan de gobierno' },
    { id: 'propuestas', label: 'Propuestas' },
    { id: 'ideologia', label: 'Ideologia' },
  ]

  return (
    <section className="space-y-6">
      {/* Header - Volver */}
      <Link
        to={`/elections/${electionId}`}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--app-muted)] transition hover:text-[var(--app-ink)]"
      >
        ← Volver a {election?.name || 'la eleccion'}
      </Link>

      {/* Hero Section con foto y datos básicos */}
      <div className="rounded-3xl border border-[color:var(--app-border)] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 bg-white/10 shadow-xl md:h-40 md:w-40">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                Sin foto
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-[var(--font-display)] md:text-4xl">
                {candidate.name}
              </h1>
              {candidate.age ? (
                <p className="mt-1 text-sm text-white/70">Edad: {candidate.age}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {candidate.party ? (
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                  Partido: {candidate.party}
                </span>
              ) : null}
              {candidate.origin ? (
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                  Origen: {candidate.origin}
                </span>
              ) : null}
            </div>

            {candidate.websiteUrl ? (
              <a
                href={candidate.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
              >
                Sitio web oficial →
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[color:var(--app-accent-strong)] text-white shadow-md'
                : 'text-[var(--app-muted)] hover:bg-white/70 hover:text-[var(--app-ink)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:p-8">
        {activeTab === 'biografia' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-[var(--font-display)] text-[var(--app-ink)]">
              Trayectoria y Experiencia
            </h2>
            {candidate.education ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  Educacion
                </h3>
                <p className="text-sm text-[var(--app-ink)]">{candidate.education}</p>
              </div>
            ) : null}
            {candidate.bio ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  Biografia
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--app-ink)]">
                  {candidate.bio}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--app-muted)]">
                No hay informacion biografica disponible.
              </p>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-[var(--font-display)] text-[var(--app-ink)]">
              Plan de gobierno
            </h2>
            {candidate.governmentPlan?.title ||
            candidate.governmentPlan?.summary ||
            candidate.governmentPlan?.url ? (
              <div className="space-y-4">
                {candidate.governmentPlan.title ? (
                  <h3 className="text-lg font-semibold text-[var(--app-ink)]">
                    {candidate.governmentPlan.title}
                  </h3>
                ) : null}
                {candidate.governmentPlan.summary ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--app-ink)]">
                    {candidate.governmentPlan.summary}
                  </p>
                ) : null}
                {candidate.governmentPlan.url ? (
                  <a
                    href={candidate.governmentPlan.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--app-accent-strong)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[color:var(--app-accent)]"
                  >
                    Ver plan completo →
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--app-muted)]">
                No hay plan de gobierno disponible.
              </p>
            )}
          </div>
        )}

        {activeTab === 'propuestas' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-[var(--font-display)] text-[var(--app-ink)]">
              Propuestas destacadas
            </h2>
            {proposals.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-2xl border border-[color:var(--app-border)] bg-white/90 p-5 transition hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="flex-1 text-base font-semibold text-[var(--app-ink)]">
                        {proposal.title}
                      </h3>
                    </div>
                    {proposal.topic ? (
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                        {proposal.topic}
                      </p>
                    ) : null}
                    {proposal.summary ? (
                      <p className="text-sm leading-relaxed text-[var(--app-muted)]">
                        {proposal.summary}
                      </p>
                    ) : null}
                    {proposal.sourceUrl ? (
                      <a
                        href={proposal.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-semibold text-[var(--app-accent-strong)] transition hover:underline"
                      >
                        Ver fuente →
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--app-muted)]">
                No hay propuestas registradas.
              </p>
            )}
          </div>
        )}

        {activeTab === 'ideologia' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-[var(--font-display)] text-[var(--app-ink)]">
              Ideologia
            </h2>
            {candidate.ideology ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--app-ink)]">
                {candidate.ideology}
              </p>
            ) : (
              <p className="text-sm text-[var(--app-muted)]">
                No hay informacion ideologica disponible.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default CandidateDetailPage
