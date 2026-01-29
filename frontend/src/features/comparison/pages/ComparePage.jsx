import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    getCandidates,
    getElectionTopics,
    compareCandidates,
} from '../../../services/comparison.service'

/**
 * ComparePage
 * ----------
 * Pantalla para comparar candidaturas dentro de una elección.
 *
 * Flujo general:
 * 1) Lee electionId desde la URL.
 * 2) Carga temas de la elección.
 * 3) Carga candidatos de la elección.
 * 4) El usuario selecciona un tema.
 * 5) Se llama al backend para traer opiniones/propuestas por candidato para ese tema.
 * 6) Se muestran tarjetas por candidato (nombre, partido y propuestas).
 */
function ComparePage() {
    // electionId viene de la ruta (ej: /elections/:electionId/compare)
    const { electionId } = useParams()

    // Lista de temas (topics) disponibles para la elección
    const [topics, setTopics] = useState([])

    // Id del tema seleccionado (ej: "t1")
    const [topicValue, setTopicValue] = useState('')

    // Controla si el panel de temas está abierto o cerrado
    const [topicsOpen, setTopicsOpen] = useState(false)

    // Lista de candidatos de la elección
    const [candidates, setCandidates] = useState([])

    // Resultado del endpoint /proposals/compare
    const [result, setResult] = useState(null)

    // Estado de carga al pedir la comparación
    const [loading, setLoading] = useState(false)

    // Mensaje de error para mostrar en UI
    const [error, setError] = useState('')

    /**
     * currentTopic:
     * Devuelve el objeto del tema seleccionado para mostrar su etiqueta/título en la UI.
     * Busca en topics el tema cuyo value o id coincide con topicValue.
     */
    const currentTopic = useMemo(() => {
        if (!topicValue) return null
        return topics.find((t) => (t.value ?? t.id) === topicValue) ?? null
    }, [topics, topicValue])

    /**
     * candidateInfoMap:
     * Crea un mapa para poder mostrar nombre y partido por candidateId.
     * Se arma a partir de result.candidates (devuelto por el backend en la comparación).
     *
     * Ejemplo de uso:
     * - candidateInfoMap.get("c1") => { id: "c1", name: "...", party: "..." }
     */
    const candidateInfoMap = useMemo(() => {
        const list = result?.candidates ?? []
        return new Map(list.map((c) => [c.id, c]))
    }, [result])

    /**
     * Carga de temas al entrar a la pantalla (o cuando cambia electionId).
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
     * Carga de candidatos al entrar a la pantalla (o cuando cambia electionId).
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
     * runCompare:
     * Llama al backend para obtener la comparación para el tema seleccionado.
     *
     * - Valida que exista un tema.
     * - Construye candidateIds con TODOS los candidatos cargados.
     * - Ejecuta compareCandidates y guarda el resultado en result.
     */
    async function runCompare(nextTopicValue = topicValue) {
        setError('')
        setResult(null)

        // Validación: debe existir tema seleccionado
        if (!nextTopicValue) {
            setError('Debe seleccionar un tema')
            return
        }

        // Se comparan todos los candidatos cargados (ids válidos)
        const allIds = candidates.map((c) => c.id).filter(Boolean)

        if (allIds.length < 1) {
            setError('No hay candidaturas para esta elección')
            return
        }

        setLoading(true)
        try {
            const data = await compareCandidates({
                topicValue: nextTopicValue, // topicId (ej: "t1")
                electionId,
                candidateIds: allIds, // lista completa de candidatos
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
     * handleSelectTopic:
     * Ejecuta cuando el usuario selecciona un tema en el panel.
     * - Guarda el tema seleccionado
     * - Cierra el panel
     * - Limpia errores/resultados previos
     * - Dispara runCompare automáticamente para cargar las opiniones
     */
    function handleSelectTopic(nextValue) {
        setTopicValue(nextValue)
        setTopicsOpen(false)
        setResult(null)
        setError('')
        runCompare(nextValue)
    }

    /**
     * handleClear:
     * Limpia la selección y el resultado de comparación.
     */
    function handleClear() {
        setTopicValue('')
        setResult(null)
        setError('')
        setTopicsOpen(false)
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Comparar candidaturas</h1>

            {/* Barra de tema: muestra el tema actual o "Seleccione un tema" */}
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
                                ? (currentTopic.label ??
                                    currentTopic.title ??
                                    currentTopic.name ??
                                    currentTopic.id)
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

                {/* Panel desplegable con todos los temas */}
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

            {/* Acciones: ejecutar comparación y limpiar */}
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

            {/* Mensaje de error */}
            {error ? <p className="text-red-600 mt-4">{error}</p> : null}

            {/* Resultado: tarjetas por candidato */}
            {result ? (
                <div className="mt-6">
                    <h2 className="font-bold mb-3 text-[var(--app-ink)]">
                        Opiniones del tema
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(result.comparison || []).map((item) => {
                            const answered = item?.answered === true
                            const proposals = item?.proposals || []
                            const info = candidateInfoMap.get(item.candidateId)

                            return (
                                <div
                                    key={item.candidateId}
                                    className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-4 shadow-sm"
                                >
                                    {/* Encabezado de tarjeta: nombre/partido y estado */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-[var(--app-ink)]">
                                                {info?.name ?? item.candidateId}
                                            </p>
                                            <p className="text-xs text-[var(--app-muted)] mt-1">
                                                {info?.party ?? 'Partido no disponible'}
                                            </p>
                                        </div>

                                        {!answered ? (
                                            <span className="px-2 py-1 border border-[color:var(--app-border)] rounded-full text-xs">
                        Sin respuesta
                      </span>
                                        ) : (
                                            <span className="text-xs text-[var(--app-muted)]">
                        {proposals.length} propuestas
                      </span>
                                        )}
                                    </div>

                                    {/* Cuerpo de tarjeta: lista de propuestas/opiniones */}
                                    {answered && proposals.length > 0 ? (
                                        <div className="mt-3 space-y-3">
                                            {proposals.slice(0, 6).map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="rounded-xl border border-[color:var(--app-border)] p-3"
                                                >
                                                    <p className="text-sm font-semibold text-[var(--app-ink)]">
                                                        {p.text || p.title || p.name || 'Propuesta'}
                                                    </p>

                                                    {p.opinion ? (
                                                        <p className="text-sm text-[var(--app-muted)] mt-1">
                                                            {p.opinion}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ))}

                                            {proposals.length > 6 ? (
                                                <p className="text-xs text-[var(--app-muted)]">…</p>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[var(--app-muted)] mt-3">
                                            No hay propuestas registradas para este tema.
                                        </p>
                                    )}
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
