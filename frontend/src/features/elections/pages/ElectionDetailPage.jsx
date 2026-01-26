import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listCandidates } from '../../candidates/services/candidatesService.js'
import { getElection } from '../services/electionsService.js'
import { listProposals } from '../../proposals/services/proposalsService.js'

function ElectionDetailPage() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [electionData, candidatesData, proposalsData] = await Promise.all([
          getElection(id),
          listCandidates({ electionId: id }),
          listProposals({ electionId: id }),
        ])

        if (isMounted) {
          setElection(electionData)
          setCandidates(candidatesData)
          setProposals(proposalsData)
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

  const proposalsByCandidate = useMemo(() => {
    return proposals.reduce((acc, proposal) => {
      const key = proposal.candidateId || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(proposal)
      return acc
    }, {})
  }, [proposals])

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
      </header>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--app-ink)]">
            Candidaturas registradas
          </h2>
          <p className="text-sm text-[var(--app-muted)]">
            Informacion oficial de cada candidato, sus propuestas y plan de gobierno.
          </p>
        </div>

        {candidates.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {candidates.map((candidate) => {
              const candidateProposals = proposalsByCandidate[candidate.id] || []
              return (
                <article
                  key={candidate.id}
                  className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex flex-wrap gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[var(--app-bg)]">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--app-muted)]">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--app-ink)]">
                        {candidate.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        {[candidate.party, candidate.origin, candidate.age]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {candidate.education ? (
                        <p className="mt-2 text-sm text-[var(--app-muted)]">
                          {candidate.education}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {candidate.bio ? (
                    <p className="mt-4 text-sm text-[var(--app-muted)]">
                      {candidate.bio}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--app-muted)]">
                    {candidate.websiteUrl ? (
                      <a
                        href={candidate.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[color:var(--app-border)] px-3 py-1 text-[var(--app-accent-strong)]"
                      >
                        Sitio oficial
                      </a>
                    ) : null}
                  </div>

                  {candidate.governmentPlan?.title ||
                  candidate.governmentPlan?.summary ||
                  candidate.governmentPlan?.url ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-4">
                      <h4 className="text-sm font-semibold text-[var(--app-ink)]">
                        Plan de gobierno
                      </h4>
                      {candidate.governmentPlan.title ? (
                        <p className="mt-2 text-sm font-semibold text-[var(--app-ink)]">
                          {candidate.governmentPlan.title}
                        </p>
                      ) : null}
                      {candidate.governmentPlan.summary ? (
                        <p className="mt-2 text-sm text-[var(--app-muted)]">
                          {candidate.governmentPlan.summary}
                        </p>
                      ) : null}
                      {candidate.governmentPlan.url ? (
                        <a
                          href={candidate.governmentPlan.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-xs font-semibold text-[var(--app-accent-strong)]"
                        >
                          Ver plan completo
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <h4 className="text-sm font-semibold text-[var(--app-ink)]">
                      Propuestas destacadas
                    </h4>
                    {candidateProposals.length ? (
                      <div className="mt-3 space-y-3">
                        {candidateProposals.map((proposal) => (
                          <div
                            key={proposal.id}
                            className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-4"
                          >
                            <p className="text-sm font-semibold text-[var(--app-ink)]">
                              {proposal.title}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                              {proposal.topic}
                            </p>
                            {proposal.summary ? (
                              <p className="mt-2 text-sm text-[var(--app-muted)]">
                                {proposal.summary}
                              </p>
                            ) : null}
                            {proposal.sourceUrl ? (
                              <a
                                href={proposal.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-xs font-semibold text-[var(--app-accent-strong)]"
                              >
                                Ver fuente
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[var(--app-muted)]">
                        Sin propuestas registradas.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
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
