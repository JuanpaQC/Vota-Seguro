import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    getCandidates,
    getElectionTopics,
    compareCandidates,
} from '../../../services/comparison.service'

/**
 * ComparePage
 * -----------
 * Pantalla para comparar candidaturas en una elección específica.
 *
 * UI de temas:
 * - Se muestra una barra con el "Tema actual".
 * - Al hacer clic en la barra (o "Cambiar tema"), se despliega un panel con TODOS los temas.
 * - Al seleccionar un tema, se guarda el topicValue y se cierra el panel.
 *
 * Carga de opiniones:
 * - Cuando hay topicValue y 2+ candidatos seleccionados, se llama a compareCandidates()
 *   para traer las propuestas/opiniones y mostrarlas por candidato.
 */
function ComparePage() {
    const { electionId } = useParams()

    // Lista completa de temas para el panel desplegable
    const [topics, setTopics] = useState([])

    // Tema seleccionado: usamos el id del topic (value estable)
    const [topicValue, setTopicValue] = useState('')

    // Control del panel desplegable de temas
    const [topicsOpen, setTopicsOpen] = useState(false)

    // Candidatos de la elección
    const [candidates, setCandidates] = useState([])

    // Candidatos seleccionados para comparar
    const [selectedIds, setSelectedIds] = useState([])

    // Resultado de la comparación (opiniones/propuestas por candidato)
    const [result, setResult] = useState(null)

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    /**
     * Devuelve el topic actual (objeto completo) según topicValue.
     * Esto permite mostrar "educación" (label/title) en la barra.
     */
    const currentTopic = useMemo(() => {
        if (!topicValue) return null
        return topics.find((t) => (t.value ?? t.id) === topicValue) ?? null
    }, [topics, topicValue])

    /**
     * Mapa para acceder rápido al resultado por candidateId.
     */
    const comparisonMap = useMemo(() => {
        if (!result?.comparison) return new Map()
        return new Map(result.comparison.map((x) => [x.candidateId, x]))
    }, [result])

    /**
     * Cargar temas de la elección.
     */
    useEffect(() => {
        async function loadTopics() {
            try {
                const data = await getElectionTopics(electionId)
                setTopics(data.topics || [])
            } catch (e) {
                console.error(e)
                setError('No se pudieron cargar los temas')
            }
        }

        if (electionId) loadTopics()
    }, [electionId])

    /**
     * Cargar candidatos de la elección.
     */
    useEffect(() => {
        async function loadCandidates() {
            try {
                const data = await getCandidates(electionId)
                setCandidates(data.candidates || [])
            } catch (e) {
                console.error(e)
                setError('No se pudieron cargar las candidaturas')
            }
        }

        if (electionId) loadCandidates()
    }, [electionId])

    /**
     * Alterna un candidato en la selección.
     * Al cambiar selección, invalidamos el resultado anterior.
     */
    function toggleCandidate(id) {
        setResult(null)
        setError('')

        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    /**
     * Ejecuta la comparación contra el backend.
     * Requiere:
     * - topicValue seleccionado
     * - al menos 2 candidatos seleccionados
     */
    async function runCompare(nextTopicValue = topicValue, nextSelectedIds = selectedIds) {
        setError('')
        setResult(null)

        if (!nextTopicValue) {
            setError('Debe seleccionar un tema')
            return
        }
        if (!Array.isArray(nextSelectedIds) || nextSelectedIds.length < 2) {
            setError('Debe seleccionar al menos 2 candidaturas')
            return
        }

        setLoading(true)
        try {
            const data = await compareCandidates({
                topicValue: nextTopicValue,
                electionId,
                candidateIds: nextSelectedIds,
            })
            setResult(data)
        } catch (e) {
            console.error(e)
            setError('Error al cargar las opiniones del tema')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Cuando el usuario elige un tema desde el panel:
     * - Guarda topicValue
     * - Cierra el panel
     * - Si ya hay 2+ candidatos seleccionados, dispara la comparación automáticamente
     */
    function handleSelectTopic(nextValue) {
        setTopicValue(nextValue)
        setTopicsOpen(false)
        setResult(null)
        setError('')

        if (selectedIds.length >= 2) {
            // auto-cargar opiniones del tema para los candidatos seleccionados
            runCompare(nextValue, selectedIds)
        }
    }

    /**
     * Limpia filtros/resultados.
     */
    function handleClear() {
        setTopicValue('')
        setSelectedIds([])
        setResult(null)
        setError('')
        setTopicsOpen(false)
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Comparar candidaturas</h1>

            {/* =========================
          BARRA DE TEMA (en vez de select)
         ========================= */}
            <div className="mb-4">
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setTopicsOpen((v) => !v)}
                        className="w-full text-left rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-4 py-3"
                    >
                        <div className="text-xs uppercase tracking-[0.25em] text-[var(--app-muted)]">
                            Tema
                        </div>
                        <div className="mt-1 font-semibold text-[var(--app-ink)]">
                            {currentTopic
                                ? (currentTopic.label ?? currentTopic.title ?? currentTopic.name ?? currentTopic.id)
                                : 'Seleccione un tema'}
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTopicsOpen((v) => !v)}
                        className="shrink-0 rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)]"
                    >
                        {topicsOpen ? 'Cerrar' : 'Cambiar'}
                    </button>
                </div>

                {/* Panel desplegable con TODOS los temas */}
                {topicsOpen ? (
                    <div className="mt-3 rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-3">
                        <p className="text-xs text-[var(--app-muted)] mb-2">
                            Selecciona un tema para ver las opiniones (propuestas) por candidato.
                        </p>

                        {topics.length === 0 ? (
                            <div className="text-sm text-[var(--app-muted)]">
                                No hay temas disponibles para esta elección.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {topics.map((t) => {
                                    const value = t.value ?? t.id
                                    const label = t.label ?? t.title ?? t.name ?? t.id
                                    const active = value === topicValue

                                    return (
                                        <button
                                            key={t.id}
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

            {/* =========================
          SELECCIÓN DE CANDIDATOS
         ========================= */}
            <div className="mb-4">
                <p className="font-semibold mb-2 text-[var(--app-ink)]">
                    Seleccione candidaturas (mínimo 2)
                </p>

                {candidates.length === 0 ? (
                    <p className="opacity-70 text-[var(--app-muted)]">
                        No hay candidaturas para esta elección.
                    </p>
                ) : (
                    <div className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-4">
                        {candidates.map((c) => (
                            <label key={c.id} className="block py-1 text-sm text-[var(--app-ink)]">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(c.id)}
                                    onChange={() => toggleCandidate(c.id)}
                                    className="mr-2"
                                />
                                {c.name || c.id}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================
          ACCIONES
         ========================= */}
            <div className="flex gap-3">
                <button
                    onClick={() => runCompare()}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                >
                    {loading ? 'Cargando...' : 'Ver opiniones'}
                </button>

                <button
                    onClick={handleClear}
                    className="bg-gray-200 px-4 py-2 rounded"
                >
                    Limpiar
                </button>
            </div>

            {/* Error */}
            {error ? <p className="text-red-600 mt-4">{error}</p> : null}

            {/* =========================
          RESULTADO: OPINIONES / PROPUESTAS POR CANDIDATO
         ========================= */}
            {result ? (
                <div className="mt-6">
                    <h2 className="font-bold mb-2 text-[var(--app-ink)]">Opiniones del tema</h2>

                    <div className="border rounded-2xl border-[color:var(--app-border)] bg-white/80 p-3">
                        {selectedIds.map((candidateId) => {
                            const item = comparisonMap.get(candidateId)
                            const answered = item?.answered === true
                            const proposals = item?.proposals || []

                            return (
                                <div key={candidateId} className="border-b border-[color:var(--app-border)] last:border-b-0 py-3">
                                    <p className="text-sm text-[var(--app-ink)]">
                                        <b>{candidateId}</b>{' '}
                                        —{' '}
                                        {answered ? (
                                            <span>{proposals.length} propuestas</span>
                                        ) : (
                                            <span className="px-2 py-1 border border-[color:var(--app-border)] rounded-full text-xs">
                        Sin respuesta
                      </span>
                                        )}
                                    </p>

                                    {answered && proposals.length > 0 ? (
                                        <ul className="list-disc ml-6 mt-2 text-sm text-[var(--app-muted)]">
                                            {proposals.slice(0, 8).map((p) => (
                                                <li key={p.id}>
                                                    {p.title || p.name || p.proposal || 'Propuesta'}
                                                </li>
                                            ))}
                                            {proposals.length > 8 ? <li>…</li> : null}
                                        </ul>
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default ComparePage
