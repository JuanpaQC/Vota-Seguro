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
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

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

  const slotHeight = 72
  const slotGap = 12

  const getSourceForSlot = (roundIndex, matchIndex, slotIndex) => ({
    fromRound: roundIndex - 1,
    fromMatch: matchIndex * 2 + slotIndex,
  })

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

  function handleDragStart(candidateId, roundIndex, matchIndex, event) {
    const payload = { candidateId, fromRound: roundIndex, fromMatch: matchIndex }
    if (event?.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(payload))
      event.dataTransfer.effectAllowed = 'move'
    }
    setDragging(payload)
  }

  function handleDragEnd() {
    setDragging(null)
    setDragOver(null)
  }

  function handleDrop(targetRound, targetMatch, slotIndex, event) {
    event?.preventDefault?.()
    if (!dragging) return

    const expected = getSourceForSlot(targetRound, targetMatch, slotIndex)
    if (
      dragging.fromRound === expected.fromRound &&
      dragging.fromMatch === expected.fromMatch
    ) {
      chooseWinner(expected.fromRound, expected.fromMatch, dragging.candidateId)
    }
    setDragOver(null)
    setDragging(null)
  }

  function renderSlot(candidateId, roundIndex, matchIndex, slotIndex, isWinner) {
    const isDropSlot = roundIndex > 0
    const dropKey = `${roundIndex}-${matchIndex}-${slotIndex}`
    const source = isDropSlot
      ? getSourceForSlot(roundIndex, matchIndex, slotIndex)
      : null
    const isDropAllowed =
      isDropSlot &&
      dragging &&
      dragging.fromRound === source.fromRound &&
      dragging.fromMatch === source.fromMatch
    const isActiveDrop = isDropAllowed && dragOver === dropKey
    const candidate = candidateId ? candidateById.get(candidateId) : null
    const proposals = candidateId
      ? proposalsByCandidate.get(candidateId) || []
      : []

    let wrapperStyle =
      'border-[color:var(--app-border)] bg-white/90'
    if (isDropSlot && !candidateId) {
      wrapperStyle = 'border-dashed border-[color:var(--app-border)] bg-white/70'
    }
    if (isActiveDrop) {
      wrapperStyle =
        'border-[color:var(--app-accent-strong)] bg-[color:var(--app-accent)]/10'
    }

    const tooltipLines =
      proposals.length > 0
        ? proposals
            .slice(0, 3)
            .map((proposal) => proposal.title || proposal.summary || 'Propuesta')
        : [
            comparison
              ? 'Sin propuestas para este tema.'
              : loading
              ? 'Cargando propuestas...'
              : 'Inicia el torneo para cargar propuestas.',
          ]

    return (
      <div
        key={`${matchIndex}-${slotIndex}`}
        className={[
          'group relative rounded-2xl border px-3 py-2 transition',
          wrapperStyle,
        ].join(' ')}
        style={{ minHeight: `${slotHeight}px` }}
        onDragOver={
          isDropAllowed
            ? (event) => {
                event.preventDefault()
                setDragOver(dropKey)
              }
            : undefined
        }
        onDragLeave={
          isDropAllowed
            ? () => {
                if (dragOver === dropKey) {
                  setDragOver(null)
                }
              }
            : undefined
        }
        onDrop={
          isDropAllowed
            ? (event) => handleDrop(roundIndex, matchIndex, slotIndex, event)
            : undefined
        }
      >
        {roundIndex > 0 ? (
          <span
            className="absolute -left-6 top-1/2 h-px w-6 bg-[var(--app-border)]"
            aria-hidden="true"
          />
        ) : null}

        {candidateId ? (
          <button
            type="button"
            draggable
            onDragStart={(event) =>
              handleDragStart(candidateId, roundIndex, matchIndex, event)
            }
            onDragEnd={handleDragEnd}
            onClick={() => chooseWinner(roundIndex, matchIndex, candidateId)}
            className="flex w-full items-start gap-3 text-left"
            title="Arrastra para avanzar o haz click para elegir."
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
            </div>
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--app-muted)]">
            {roundIndex === 0 ? 'Sin rival' : 'Arrastra aqui'}
          </div>
        )}

        {candidateId ? (
          <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-[color:var(--app-border)] bg-white p-3 text-xs text-[var(--app-ink)] opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--app-muted)]">
              Propuestas del tema
            </p>
            <div className="mt-2 space-y-1 text-[var(--app-muted)]">
              {tooltipLines.map((line, index) => (
                <p key={`${candidateId}-tip-${index}`}>- {line}</p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--app-ink)]">
              Llave del torneo
            </h2>
            <span className="text-xs text-[var(--app-muted)]">
              Arrastra al candidato a la celda siguiente o haz click para elegir.
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-10 pb-6">
              {rounds.map((round, roundIndex) => (
                <div key={`round-${roundIndex}`} className="space-y-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
                    {rounds.length === 1
                      ? 'Final'
                      : roundIndex === rounds.length - 1
                      ? 'Final'
                      : `Ronda ${roundIndex + 1}`}
                  </div>
                  {round.map((match, matchIndex) => {
                    const showConnectors = roundIndex < rounds.length - 1

                    return (
                      <div
                        key={match.key}
                        className="relative"
                        style={{
                          '--slot-h': `${slotHeight}px`,
                          '--slot-gap': `${slotGap}px`,
                        }}
                      >
                        <div className="space-y-3">
                          {renderSlot(
                            match.a,
                            roundIndex,
                            matchIndex,
                            0,
                            match.winner === match.a
                          )}
                          {renderSlot(
                            match.b,
                            roundIndex,
                            matchIndex,
                            1,
                            match.winner === match.b
                          )}
                        </div>

                        {showConnectors ? (
                          <>
                            <span
                              className="absolute right-0 w-px bg-[var(--app-border)]"
                              style={{
                                top: 'calc(var(--slot-h) / 2)',
                                height: 'calc(var(--slot-h) + var(--slot-gap))',
                              }}
                              aria-hidden="true"
                            />
                            <span
                              className="absolute -right-7 h-px w-7 bg-[var(--app-border)]"
                              style={{
                                top: 'calc(var(--slot-h) + var(--slot-gap) / 2)',
                              }}
                              aria-hidden="true"
                            />
                          </>
                        ) : null}
                      </div>
                    )
                  })}
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
