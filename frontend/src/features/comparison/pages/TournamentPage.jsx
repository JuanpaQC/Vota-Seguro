import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  compareCandidates,
  getCandidates,
  getElectionTopics,
} from '../../../services/comparison.service'

function nextPowerOfTwo(value) {
  if (value <= 1) return 1
  let result = 1
  while (result < value) {
    result *= 2
  }
  return result
}

function buildRounds(candidateIds, decisions) {
  if (!candidateIds.length) return []
  const size = nextPowerOfTwo(candidateIds.length)
  const slots = [...candidateIds, ...Array(size - candidateIds.length).fill(null)]
  const rounds = []
  let currentSlots = slots
  let roundIndex = 0

  while (currentSlots.length > 1) {
    const matches = []
    for (let i = 0; i < currentSlots.length; i += 2) {
      const a = currentSlots[i]
      const b = currentSlots[i + 1]
      const key = `${roundIndex}-${i / 2}`
      let winner = null

      if (a && !b) {
        winner = a
      } else if (b && !a) {
        winner = b
      } else if (a && b) {
        const decided = decisions[key]
        if (decided === a || decided === b) {
          winner = decided
        }
      }

      matches.push({ key, a, b, winner })
    }

    rounds.push(matches)
    currentSlots = matches.map((match) => match.winner)
    roundIndex += 1
  }

  return rounds
}

function TournamentPage() {
  const { electionId } = useParams()
  const [searchParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [topicValue, setTopicValue] = useState(
    () => searchParams.get('topic') || ''
  )
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectionInitialized, setSelectionInitialized] = useState(false)
  const [tournamentIds, setTournamentIds] = useState([])
  const [decisions, setDecisions] = useState({})
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentTopic = useMemo(() => {
    if (!topicValue) return null
    return topics.find((t) => (t.value ?? t.id) === topicValue) ?? null
  }, [topics, topicValue])

  const candidateById = useMemo(() => {
    return new Map(candidates.map((candidate) => [candidate.id, candidate]))
  }, [candidates])

  const proposalsByCandidate = useMemo(() => {
    const map = new Map()
    const list = comparison?.comparison ?? []
    list.forEach((item) => {
      map.set(item.candidateId, item.proposals || [])
    })
    return map
  }, [comparison])

  const selectedCandidates = useMemo(() => {
    return candidates.filter((candidate) => selectedIds.has(candidate.id))
  }, [candidates, selectedIds])

  const rounds = useMemo(
    () => buildRounds(tournamentIds, decisions),
    [tournamentIds, decisions]
  )

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await getElectionTopics(electionId)
        setTopics(data.topics || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los temas')
      }
    }

    if (electionId) loadTopics()
  }, [electionId])

  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await getCandidates(electionId)
        setCandidates(data.candidates || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las candidaturas')
      }
    }

    if (electionId) loadCandidates()
  }, [electionId])

  useEffect(() => {
    if (candidates.length && !selectionInitialized) {
      setSelectedIds(new Set(candidates.map((candidate) => candidate.id)))
      setSelectionInitialized(true)
    }
  }, [candidates, selectionInitialized])

  function toggleCandidate(candidateId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(candidateId)) {
        next.delete(candidateId)
      } else {
        next.add(candidateId)
      }
      return next
    })
  }

  function handleSelectTopic(nextValue) {
    setTopicValue(nextValue)
    setTopicsOpen(false)
    setError('')
  }

  function handleSelectAll() {
    setSelectedIds(new Set(candidates.map((candidate) => candidate.id)))
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  async function startTournament() {
    setError('')
    setComparison(null)
    setDecisions({})

    if (!topicValue) {
      setError('Debe seleccionar un tema para iniciar el torneo')
      return
    }

    if (selectedCandidates.length < 2) {
      setError('Seleccione al menos 2 candidatos para iniciar el torneo')
      return
    }

    const ids = selectedCandidates.map((candidate) => candidate.id)
    setTournamentIds(ids)

    setLoading(true)
    try {
      const data = await compareCandidates({
        topicValue,
        electionId,
        candidateIds: ids,
      })
      setComparison(data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las propuestas del tema')
    } finally {
      setLoading(false)
    }
  }

  function resetTournament() {
    setTournamentIds([])
    setDecisions({})
    setComparison(null)
  }

  function chooseWinner(roundIndex, matchIndex, candidateId) {
    const key = `${roundIndex}-${matchIndex}`
    setDecisions((prev) => ({
      ...prev,
      [key]: candidateId,
    }))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-3">
        <Link
          to={`/elections/${electionId}/compare`}
          className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]"
        >
          {'<- Volver al comparador'}
        </Link>
        <div>
          <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--app-ink)]">
            Torneo de candidatos
          </h1>
          <p className="text-sm text-[var(--app-muted)]">
            Selecciona un tema, elige los candidatos que quieras y define quien
            avanza en cada ronda.
          </p>
        </div>
      </header>

      <section className="space-y-4 rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
            Configuracion del torneo
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)]"
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)]"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setTopicsOpen((v) => !v)}
            className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-4 py-3 text-left"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--app-muted)]">
              Tema del torneo
            </div>
            <div className="mt-1 font-semibold text-[var(--app-ink)]">
              {currentTopic
                ? currentTopic.label ??
                  currentTopic.title ??
                  currentTopic.name ??
                  currentTopic.id
                : 'Seleccione un tema'}
            </div>
          </button>

          {topicsOpen ? (
            <div className="mt-3 rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-3">
              <p className="mb-2 text-xs text-[var(--app-muted)]">
                El tema define que propuestas se muestran en cada enfrentamiento.
              </p>

              {topics.length === 0 ? (
                <div className="text-sm text-[var(--app-muted)]">
                  No hay temas disponibles para esta eleccion.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const value = topic.value ?? topic.id
                    const label = topic.label ?? topic.title ?? topic.name ?? topic.id
                    const active = value === topicValue

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleSelectTopic(value)}
                        className={[
                          'rounded-full border px-3 py-1 text-sm font-semibold transition',
                          active
                            ? 'border-[color:var(--app-accent)] bg-[color:var(--app-accent)]/15 text-[var(--app-accent-strong)]'
                            : 'border-[color:var(--app-border)] text-[var(--app-ink)] hover:border-[color:var(--app-accent)]',
                        ].join(' ')}
                        title={label}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-[var(--app-muted)]">
            <span>Participantes seleccionados: {selectedCandidates.length}</span>
            <span>
              Puedes jugar con 4, 8, 16, 20 o el numero que prefieras.
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="mt-3 text-sm text-[var(--app-muted)]">
              No hay candidaturas registradas para esta eleccion.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => {
                const active = selectedIds.has(candidate.id)
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => toggleCandidate(candidate.id)}
                    className={[
                      'flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition',
                      active
                        ? 'border-[color:var(--app-accent)] bg-[color:var(--app-accent)]/10'
                        : 'border-[color:var(--app-border)] bg-white/80 hover:border-[color:var(--app-accent)]',
                    ].join(' ')}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[color:var(--app-border)] bg-[var(--app-bg)]">
                      {candidate.photoUrl ? (
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
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--app-ink)]">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-[var(--app-muted)]">
                        {candidate.party ?? 'Partido no disponible'}
                      </p>
                    </div>
                    <div
                      className={[
                        'h-4 w-4 rounded-full border text-[10px]',
                        active
                          ? 'border-[color:var(--app-accent-strong)] bg-[color:var(--app-accent-strong)]'
                          : 'border-[color:var(--app-border)]',
                      ].join(' ')}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startTournament}
            disabled={loading}
            className="rounded-full bg-[color:var(--app-accent-strong)] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.3)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Cargando...' : 'Iniciar torneo'}
          </button>
          <button
            type="button"
            onClick={resetTournament}
            className="rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
          >
            Reiniciar
          </button>
          {comparison ? (
            <span className="text-xs text-[var(--app-muted)]">
              Propuestas cargadas para {comparison.candidates?.length ?? 0} candidatos.
            </span>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      {rounds.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--app-ink)]">
            Llave del torneo
          </h2>
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-6 pb-4">
              {rounds.map((round, roundIndex) => (
                <div key={`round-${roundIndex}`} className="space-y-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
                    {rounds.length === 1
                      ? 'Final'
                      : roundIndex === rounds.length - 1
                      ? 'Final'
                      : `Ronda ${roundIndex + 1}`}
                  </div>
                  {round.map((match, matchIndex) => (
                    <div
                      key={match.key}
                      className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-3 shadow-sm"
                    >
                      {[match.a, match.b].map((candidateId, slotIndex) => {
                        if (!candidateId) {
                          return (
                            <div
                              key={`empty-${slotIndex}`}
                              className="rounded-xl border border-dashed border-[color:var(--app-border)] px-3 py-2 text-xs text-[var(--app-muted)]"
                            >
                              Sin rival
                            </div>
                          )
                        }

                        const candidate = candidateById.get(candidateId)
                        const proposals =
                          proposalsByCandidate.get(candidateId) || []
                        const isWinner = match.winner === candidateId

                        return (
                          <button
                            key={candidateId}
                            type="button"
                            onClick={() =>
                              chooseWinner(roundIndex, matchIndex, candidateId)
                            }
                            className={[
                              'mt-2 flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition',
                              isWinner
                                ? 'border-[color:var(--app-accent-strong)] bg-[color:var(--app-accent)]/15'
                                : 'border-[color:var(--app-border)] hover:border-[color:var(--app-accent)]',
                            ].join(' ')}
                          >
                            <div className="mt-1 h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[color:var(--app-border)] bg-[var(--app-bg)]">
                              {candidate?.photoUrl ? (
                                <img
                                  src={candidate.photoUrl}
                                  alt={candidate?.name ?? 'Candidato'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--app-muted)]">
                                  Sin foto
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--app-ink)]">
                                    {candidate?.name ?? candidateId}
                                  </p>
                                  <p className="text-xs text-[var(--app-muted)]">
                                    {candidate?.party ?? 'Partido no disponible'}
                                  </p>
                                </div>
                                {isWinner ? (
                                  <span className="rounded-full bg-[color:var(--app-accent-strong)] px-2 py-0.5 text-[10px] font-semibold text-white">
                                    Gana
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-[var(--app-muted)]">
                                    Elegir
                                  </span>
                                )}
                              </div>
                              {proposals.length > 0 ? (
                                <div className="space-y-1 text-xs text-[var(--app-muted)]">
                                  {proposals.slice(0, 2).map((proposal) => (
                                    <p key={proposal.id}>
                                      - {proposal.title ?? proposal.summary ?? 'Propuesta'}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-[var(--app-muted)]">
                                  Sin propuestas para este tema.
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default TournamentPage
