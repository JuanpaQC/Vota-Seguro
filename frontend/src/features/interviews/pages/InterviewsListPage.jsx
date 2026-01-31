import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listInterviews } from '../services/interviewsService.js'
import { listCandidates } from '../../candidates/services/candidatesService.js'
import { getElection } from '../../elections/services/electionsService.js'

function InterviewsListPage() {
  const { electionId } = useParams()
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [election, setElection] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [interviewsData, candidatesData, electionData] = await Promise.all([
          listInterviews({ electionId }),
          listCandidates({ electionId }),
          getElection(electionId),
        ])

        if (!isMounted) return

        setInterviews(interviewsData)
        setCandidates(candidatesData)
        setElection(electionData)
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar las entrevistas.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [electionId])

  const getCandidateById = (candidateId) => {
    return candidates.find((c) => c.id === candidateId)
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando entrevistas...
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
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

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <Link
          to={`/elections/${electionId}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--app-muted)] hover:text-[var(--app-accent-strong)]"
        >
          ← Volver a la eleccion
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
            Entrevistas
          </p>
          <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
            {election?.name || 'Entrevistas de candidatos'}
          </h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Conoce más sobre los candidatos a través de sus entrevistas.
          </p>
        </div>
      </header>

      {interviews.length ? (
        <div className="space-y-6">
          {interviews.map((interview) => {
            const candidate = getCandidateById(interview.candidateId)
            return (
              <article
                key={interview.id}
                className="overflow-hidden rounded-3xl border border-[color:var(--app-border)] bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
              >
                <div className="flex flex-col md:flex-row">
                  {interview.photoUrl && (
                    <div className="h-48 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-[color:var(--app-accent)]/10 to-[color:var(--app-accent)]/5 md:h-auto md:w-56">
                      <img
                        src={interview.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--app-ink)]">
                        {interview.description}
                      </h2>
                      {candidate && (
                        <p className="mt-2 text-sm text-[var(--app-muted)]">
                          {candidate.name}
                          {candidate.party && ` - ${candidate.party}`}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <a
                        href={interview.interviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full bg-[color:var(--app-accent-strong)] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)]"
                      >
                        Ver entrevista →
                      </a>
                      {candidate && (
                        <Link
                          to={`/elections/${electionId}/candidates/${candidate.id}`}
                          className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                        >
                          Ver perfil del candidato
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/80 p-8 text-center text-sm text-[var(--app-muted)]">
          Aun no hay entrevistas registradas para esta eleccion.
        </div>
      )}
    </section>
  )
}

export default InterviewsListPage
