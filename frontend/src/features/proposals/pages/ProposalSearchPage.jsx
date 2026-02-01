import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { searchProposals } from '../services/proposalsService.js'
import { listCandidates } from '../../candidates/services/candidatesService.js'

function ProposalSearchPage() {
  const { electionId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [selectedCandidates, setSelectedCandidates] = useState(() => {
    const ids = searchParams.get('candidates')
    return ids ? ids.split(',').filter(Boolean) : []
  })
  const [candidates, setCandidates] = useState([])
  const [showCandidateFilter, setShowCandidateFilter] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Load candidates for the election
  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await listCandidates({ electionId })
        setCandidates(data)
      } catch (err) {
        console.error('Error loading candidates:', err)
      }
    }
    loadCandidates()
  }, [electionId])

  useEffect(() => {
    const nextQuery = (searchParams.get('q') || '').trim()
    const candidatesParam = searchParams.get('candidates') || ''
    const nextSelectedCandidates = candidatesParam ? candidatesParam.split(',').filter(Boolean) : []
    
    setQuery(nextQuery)
    setSelectedCandidates(nextSelectedCandidates)

    if (!nextQuery) {
      setResults([])
      setHasSearched(false)
      return
    }

    async function runSearch() {
      setLoading(true)
      setError('')
      try {
        const data = await searchProposals({
          electionId,
          query: nextQuery,
          candidateIds: nextSelectedCandidates,
        })
        setResults(data.results || [])
        setHasSearched(true)
      } catch (err) {
        console.error(err)
        setError('No se pudo completar la busqueda.')
      } finally {
        setLoading(false)
      }
    }

    runSearch()
  }, [electionId, searchParams])

  function handleSubmit(event) {
    event.preventDefault()
    const nextQuery = query.trim()
    const params = {}
    if (nextQuery) {
      params.q = nextQuery
    }
    if (selectedCandidates.length > 0) {
      params.candidates = selectedCandidates.join(',')
    }
    setSearchParams(Object.keys(params).length ? params : {})
  }

  function toggleCandidate(candidateId) {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId)
      }
      return [...prev, candidateId]
    })
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <Link
          to={`/elections/${electionId}`}
          className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]"
        >
          {'<- Volver a la eleccion'}
        </Link>
        <div>
          <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--app-ink)]">
            Buscar propuestas
          </h1>
          <p className="text-sm text-[var(--app-muted)]">
            Escribe palabras clave para encontrar propuestas y ver el candidato
            relacionado.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ejemplo: salud, educacion, seguridad"
            className="flex-1 rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm text-[var(--app-ink)] shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[color:var(--app-accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Filtro de candidatos */}
        {candidates.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCandidateFilter(!showCandidateFilter)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)] transition hover:text-[var(--app-accent-strong)]"
            >
              <span>Filtrar por candidato {selectedCandidates.length > 0 && `(${selectedCandidates.length})`}</span>
              <span className="text-base">{showCandidateFilter ? '−' : '+'}</span>
            </button>
            {showCandidateFilter && (
              <div className="flex flex-wrap gap-2">
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidates.includes(candidate.id)
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => toggleCandidate(candidate.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'border-[color:var(--app-accent-strong)] bg-[color:var(--app-accent-strong)] text-white'
                          : 'border-[color:var(--app-border)] bg-white/70 text-[var(--app-muted)] hover:border-[color:var(--app-accent-strong)] hover:text-[var(--app-accent-strong)]'
                      }`}
                    >
                      {candidate.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {hasSearched ? (
        results.length ? (
          <div className="grid gap-4">
            {results.map((item) => {
              const proposal = item.proposal || {}
              const candidate = item.candidate
              const topic = item.topic || proposal.topic || proposal.type

              return (
                <Link
                  key={proposal.id}
                  to={`/elections/${electionId}/proposals/${proposal.id}`}
                  className="group rounded-3xl border border-[color:var(--app-border)] bg-white/90 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                        {topic || 'Tema sin definir'}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-[var(--app-ink)] group-hover:text-[var(--app-accent-strong)]">
                        {proposal.title || 'Propuesta'}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-[var(--app-accent-strong)]">
                      Ver detalle -{'>'}
                    </span>
                  </div>

                  {proposal.summary || proposal.detail ? (
                    <p className="mt-3 text-sm leading-relaxed text-[var(--app-muted)]">
                      {proposal.summary || proposal.detail}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--app-muted)]">
                      Sin descripcion disponible.
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3 text-sm text-[var(--app-muted)]">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[color:var(--app-border)] bg-[var(--app-bg)]">
                      {candidate?.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--app-muted)]">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-ink)]">
                        {candidate?.name || proposal.candidateId || 'Candidato'}
                      </p>
                      <p className="text-xs text-[var(--app-muted)]">
                        {candidate?.party || 'Partido no disponible'}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--app-muted)]">
            No hay resultados para esa busqueda.
          </p>
        )
      ) : (
        <p className="text-sm text-[var(--app-muted)]">
          Ingresa una palabra clave para iniciar la busqueda.
        </p>
      )}
    </section>
  )
}

export default ProposalSearchPage
