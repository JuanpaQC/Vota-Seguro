import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  deleteElection,
  listElections,
} from '../../elections/services/electionsService.js'
import {
  deleteCandidate,
  listCandidates,
} from '../../candidates/services/candidatesService.js'
import {
  createProposal,
  listProposals,
} from '../../proposals/services/proposalsService.js'
import {
  createInterview,
  deleteInterview,
  listInterviews,
} from '../../interviews/services/interviewsService.js'
import { signOutOrganizer } from '../services/authService.js'
import useAuth from '../hooks/useAuth.js'

function OrganizerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState([])
  const [proposals, setProposals] = useState([])
  const [interviews, setInterviews] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyMap, setBusyMap] = useState({})
  const [proposalDrafts, setProposalDrafts] = useState({})
  const [interviewDrafts, setInterviewDrafts] = useState({})

  const emptyProposal = {
    title: '',
    topic: '',
    type: '',
    summary: '',
    detail: '',
    sourceUrl: '',
  }

  const emptyInterview = {
    description: '',
    photoUrl: '',
    interviewUrl: '',
  }

  const candidatesByElection = useMemo(() => {
    return candidates.reduce((acc, candidate) => {
      const key = candidate.electionId || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(candidate)
      return acc
    }, {})
  }, [candidates])

  const proposalsByCandidate = useMemo(() => {
    return proposals.reduce((acc, proposal) => {
      const key = proposal.candidateId || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(proposal)
      return acc
    }, {})
  }, [proposals])

  const interviewsByCandidate = useMemo(() => {
    return interviews.reduce((acc, interview) => {
      const key = interview.candidateId || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(interview)
      return acc
    }, {})
  }, [interviews])

  const loadData = async () => {
    setIsLoadingData(true)
    setLoadError('')
    setActionError('')
    try {
      const [electionsData, candidatesData, proposalsData, interviewsData] = await Promise.all([
        listElections(),
        listCandidates(),
        listProposals(),
        listInterviews(),
      ])
      setElections(electionsData)
      setCandidates(candidatesData)
      setProposals(proposalsData)
      setInterviews(interviewsData)
    } catch (err) {
      setLoadError('No se pudieron cargar los procesos electorales.')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const setBusy = (id, value) => {
    setBusyMap((prev) => ({ ...prev, [id]: value }))
  }

  const toggleProposalForm = (candidateId) => {
    setProposalDrafts((prev) => {
      const current = prev[candidateId] || { isOpen: false, data: emptyProposal }
      return {
        ...prev,
        [candidateId]: {
          ...current,
          isOpen: !current.isOpen,
          data: current.data || emptyProposal,
          error: '',
        },
      }
    })
  }

  const updateProposalDraftField = (candidateId, field, value) => {
    setProposalDrafts((prev) => {
      const current = prev[candidateId] || { isOpen: true, data: emptyProposal }
      return {
        ...prev,
        [candidateId]: {
          ...current,
          data: { ...current.data, [field]: value },
          error: '',
        },
      }
    })
  }

  const handleCreateProposal = async (candidate) => {
    const draft = proposalDrafts[candidate.id]?.data || emptyProposal
    if (!draft.title.trim() || !draft.topic.trim()) {
      setProposalDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          ...(prev[candidate.id] || { isOpen: true, data: draft }),
          error: 'Titulo y tema son obligatorios.',
        },
      }))
      return
    }

    setProposalDrafts((prev) => ({
      ...prev,
      [candidate.id]: {
        ...(prev[candidate.id] || { isOpen: true, data: draft }),
        submitting: true,
        error: '',
      },
    }))

    try {
      const payload = {
        title: draft.title.trim(),
        topic: draft.topic.trim(),
        type: draft.type.trim() || undefined,
        summary: draft.summary.trim() || undefined,
        detail: draft.detail.trim() || undefined,
        sourceUrl: draft.sourceUrl.trim() || undefined,
        candidateId: candidate.id,
        electionId: candidate.electionId,
      }
      const created = await createProposal(payload)
      setProposals((prev) => [...prev, created])
      setProposalDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          isOpen: false,
          data: emptyProposal,
          error: '',
          submitting: false,
        },
      }))
    } catch (err) {
      setProposalDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          ...(prev[candidate.id] || { isOpen: true, data: draft }),
          error: 'No se pudo agregar la propuesta.',
          submitting: false,
        },
      }))
    }
  }

  const toggleInterviewForm = (candidateId) => {
    setInterviewDrafts((prev) => {
      const current = prev[candidateId] || { isOpen: false, data: emptyInterview }
      return {
        ...prev,
        [candidateId]: {
          ...current,
          isOpen: !current.isOpen,
          data: current.data || emptyInterview,
          error: '',
        },
      }
    })
  }

  const updateInterviewDraftField = (candidateId, field, value) => {
    setInterviewDrafts((prev) => {
      const current = prev[candidateId] || { isOpen: true, data: emptyInterview }
      return {
        ...prev,
        [candidateId]: {
          ...current,
          data: { ...current.data, [field]: value },
          error: '',
        },
      }
    })
  }

  const handleCreateInterview = async (candidate) => {
    const draft = interviewDrafts[candidate.id]?.data || emptyInterview
    if (!draft.description.trim() || !draft.interviewUrl.trim()) {
      setInterviewDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          ...(prev[candidate.id] || { isOpen: true, data: draft }),
          error: 'Descripcion y link son obligatorios.',
        },
      }))
      return
    }

    setInterviewDrafts((prev) => ({
      ...prev,
      [candidate.id]: {
        ...(prev[candidate.id] || { isOpen: true, data: draft }),
        submitting: true,
        error: '',
      },
    }))

    try {
      const payload = {
        description: draft.description.trim(),
        photoUrl: draft.photoUrl.trim() || undefined,
        interviewUrl: draft.interviewUrl.trim(),
        candidateId: candidate.id,
        electionId: candidate.electionId,
      }
      const created = await createInterview(payload)
      setInterviews((prev) => [...prev, created])
      setInterviewDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          isOpen: false,
          data: emptyInterview,
          error: '',
          submitting: false,
        },
      }))
    } catch (err) {
      setInterviewDrafts((prev) => ({
        ...prev,
        [candidate.id]: {
          ...(prev[candidate.id] || { isOpen: true, data: draft }),
          error: 'No se pudo agregar la entrevista.',
          submitting: false,
        },
      }))
    }
  }

  const handleDeleteInterview = async (interview) => {
    const confirmed = window.confirm('¿Eliminar esta entrevista?')
    if (!confirmed) return

    try {
      await deleteInterview(interview.id)
      setInterviews((prev) => prev.filter((item) => item.id !== interview.id))
    } catch (err) {
      setActionError('No se pudo eliminar la entrevista.')
    }
  }

  const handleDeleteElection = async (election) => {
    const confirmed = window.confirm(
      `¿Eliminar la eleccion "${election.name}"? Se eliminaran sus candidaturas y propuestas.`
    )
    if (!confirmed) return

    setActionError('')
    setBusy(election.id, true)
    try {
      await deleteElection(election.id)
      setElections((prev) => prev.filter((item) => item.id !== election.id))
      setCandidates((prev) => prev.filter((item) => item.electionId !== election.id))
      setProposals((prev) => prev.filter((item) => item.electionId !== election.id))
    } catch (err) {
      setActionError('No se pudo eliminar la eleccion seleccionada.')
    } finally {
      setBusy(election.id, false)
    }
  }

  const handleDeleteCandidate = async (candidate) => {
    const confirmed = window.confirm(
      `¿Eliminar a ${candidate.name}? Sus propuestas asociadas tambien se eliminaran.`
    )
    if (!confirmed) return

    setActionError('')
    setBusy(candidate.id, true)
    try {
      await deleteCandidate(candidate.id)
      setCandidates((prev) => prev.filter((item) => item.id !== candidate.id))
      setProposals((prev) => prev.filter((item) => item.candidateId !== candidate.id))
    } catch (err) {
      setActionError('No se pudo eliminar la candidatura seleccionada.')
    } finally {
      setBusy(candidate.id, false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutOrganizer()
      navigate('/organizers/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-muted)]">
          Panel de organizadores
        </p>
        <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
          Bienvenido{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--app-muted)]">
          Desde aqui se administran los procesos de eleccion, candidaturas y reportes.
          Esta area solo esta disponible para cuentas autorizadas en Firebase.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/organizers/elections/new"
          className="rounded-full bg-[color:var(--app-accent-strong)] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)]"
        >
          Crear eleccion organizacional
        </Link>
        <Link
          to="/"
          className="rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
        >
          Ver sitio publico
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Procesos activos',
            description: 'Configura los periodos y la visibilidad de cada eleccion.',
          },
          {
            title: 'Candidaturas',
            description: 'Carga candidatos, propuestas y fuentes verificadas.',
          },
          {
            title: 'Reportes',
            description: 'Genera reportes y resumenes para el equipo electoral.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          >
            <h2 className="text-lg font-semibold text-[var(--app-ink)]">{card.title}</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">{card.description}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-ink)]">
              Procesos y candidaturas
            </h2>
            <p className="text-sm text-[var(--app-muted)]">
              Edita o elimina procesos y candidatos registrados.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoadingData}
            className="rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoadingData ? 'Actualizando...' : 'Recargar'}
          </button>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}

        {actionError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}

        {isLoadingData ? (
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-5 text-sm text-[var(--app-muted)]">
            Cargando procesos registrados...
          </div>
        ) : elections.length ? (
          <div className="space-y-4">
            {elections.map((election) => {
              const electionCandidates = candidatesByElection[election.id] || []
              return (
                <article
                  key={election.id}
                  className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--app-ink)]">
                        {election.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--app-muted)]">
                        {election.organizationName ? (
                          <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                            {election.organizationName}
                          </span>
                        ) : null}
                        {election.mode ? (
                          <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                            {election.mode}
                          </span>
                        ) : null}
                        {election.isActive ? (
                          <span className="rounded-full bg-[color:var(--app-accent)]/20 px-3 py-1 text-[var(--app-accent-strong)]">
                            Activa
                          </span>
                        ) : (
                          <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1">
                            Inactiva
                          </span>
                        )}
                      </div>
                      {election.description ? (
                        <p className="mt-3 text-sm text-[var(--app-muted)]">
                          {election.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/organizers/elections/${election.id}/edit`}
                        className="rounded-full border border-[color:var(--app-border)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteElection(election)}
                        disabled={busyMap[election.id]}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {busyMap[election.id] ? 'Eliminando...' : 'Eliminar proceso'}
                      </button>
                    </div>
                  </div>

                      <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                            Candidaturas
                          </p>
                      <span className="text-xs font-semibold text-[var(--app-ink)]">
                        {electionCandidates.length} registradas
                      </span>
                    </div>

                    {electionCandidates.length ? (
                      <div className="mt-3 space-y-4">
                        {electionCandidates.map((candidate) => {
                          const candidateProposals = proposalsByCandidate[candidate.id] || []
                          const candidateInterviews = interviewsByCandidate[candidate.id] || []
                          const draftState = proposalDrafts[candidate.id] || {
                            isOpen: false,
                            data: emptyProposal,
                            error: '',
                            submitting: false,
                          }
                          const interviewDraftState = interviewDrafts[candidate.id] || {
                            isOpen: false,
                            data: emptyInterview,
                            error: '',
                            submitting: false,
                          }
                          return (
                            <div
                              key={candidate.id}
                              className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--app-ink)]">
                                    {candidate.name}
                                  </p>
                                  <p className="text-xs text-[var(--app-muted)]">
                                    {[candidate.party, candidate.origin, candidate.age]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={`/organizers/candidates/${candidate.id}/edit`}
                                    className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                                  >
                                    Editar
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCandidate(candidate)}
                                    disabled={busyMap[candidate.id]}
                                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {busyMap[candidate.id] ? 'Eliminando...' : 'Eliminar'}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--app-muted)]">
                                    Propuestas
                                  </p>
                                  <span className="text-[10px] font-semibold text-[var(--app-ink)]">
                                    {candidateProposals.length}
                                  </span>
                                </div>
                                {candidateProposals.length ? (
                                  <div className="mt-2 space-y-2">
                                    {candidateProposals.map((proposal) => (
                                      <div
                                        key={proposal.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-3 py-2"
                                      >
                                        <div>
                                          <p className="text-sm font-semibold text-[var(--app-ink)]">
                                            {proposal.title}
                                          </p>
                                          <p className="text-[11px] text-[var(--app-muted)]">
                                            {proposal.topic}
                                          </p>
                                        </div>
                                        <Link
                                          to={`/organizers/proposals/${proposal.id}/edit`}
                                          className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                                        >
                                          Editar
                                        </Link>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-2 text-xs text-[var(--app-muted)]">
                                    Sin propuestas registradas.
                                  </p>
                                )}

                                <div className="mt-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleProposalForm(candidate.id)}
                                    className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                                  >
                                    {draftState.isOpen
                                      ? 'Cancelar'
                                      : 'Agregar propuesta'}
                                  </button>
                                </div>

                                {draftState.isOpen ? (
                                  <div className="mt-3 grid gap-3 rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-3 md:grid-cols-2">
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Titulo
                                      <input
                                        type="text"
                                        value={draftState.data.title}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'title',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Tema
                                      <input
                                        type="text"
                                        value={draftState.data.topic}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'topic',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Tipo
                                      <input
                                        type="text"
                                        value={draftState.data.type}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'type',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Fuente (URL)
                                      <input
                                        type="url"
                                        value={draftState.data.sourceUrl}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'sourceUrl',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="md:col-span-2 space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Resumen
                                      <textarea
                                        rows="2"
                                        value={draftState.data.summary}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'summary',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="md:col-span-2 space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Detalle
                                      <textarea
                                        rows="2"
                                        value={draftState.data.detail}
                                        onChange={(event) =>
                                          updateProposalDraftField(
                                            candidate.id,
                                            'detail',
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>

                                    {draftState.error ? (
                                      <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                        {draftState.error}
                                      </div>
                                    ) : null}

                                    <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleCreateProposal(candidate)}
                                        disabled={draftState.submitting}
                                        className="rounded-full bg-[color:var(--app-accent-strong)] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(208,95,47,0.3)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
                                      >
                                        {draftState.submitting
                                          ? 'Guardando...'
                                          : 'Guardar propuesta'}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--app-muted)]">
                                    Entrevistas
                                  </p>
                                  <span className="text-[10px] font-semibold text-[var(--app-ink)]">
                                    {candidateInterviews.length}
                                  </span>
                                </div>
                                {candidateInterviews.length ? (
                                  <div className="mt-2 space-y-2">
                                    {candidateInterviews.map((interview) => (
                                      <div
                                        key={interview.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-3 py-2"
                                      >
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-[var(--app-ink)]">
                                            {interview.description}
                                          </p>
                                          {interview.interviewUrl && (
                                            <a
                                              href={interview.interviewUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] text-[var(--app-accent-strong)] hover:underline"
                                            >
                                              Ver entrevista →
                                            </a>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteInterview(interview)}
                                          className="rounded-full border border-red-200 bg-white px-3 py-1 text-[10px] font-semibold text-red-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-2 text-xs text-[var(--app-muted)]">
                                    Sin entrevistas registradas.
                                  </p>
                                )}

                                <div className="mt-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleInterviewForm(candidate.id)}
                                    className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                                  >
                                    {interviewDraftState.isOpen
                                      ? 'Cancelar'
                                      : 'Agregar entrevista'}
                                  </button>
                                </div>

                                {interviewDraftState.isOpen ? (
                                  <div className="mt-3 grid gap-3 rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-3 md:grid-cols-2">
                                    <label className="md:col-span-2 space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Descripcion corta
                                      <input
                                        type="text"
                                        value={interviewDraftState.data.description}
                                        onChange={(event) =>
                                          updateInterviewDraftField(
                                            candidate.id,
                                            'description',
                                            event.target.value
                                          )
                                        }
                                        placeholder="Entrevista sobre economia con Canal 7"
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Foto (URL)
                                      <input
                                        type="url"
                                        value={interviewDraftState.data.photoUrl}
                                        onChange={(event) =>
                                          updateInterviewDraftField(
                                            candidate.id,
                                            'photoUrl',
                                            event.target.value
                                          )
                                        }
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>
                                    <label className="space-y-1 text-[11px] font-medium text-[var(--app-ink)]">
                                      Link de la entrevista (URL)
                                      <input
                                        type="url"
                                        value={interviewDraftState.data.interviewUrl}
                                        onChange={(event) =>
                                          updateInterviewDraftField(
                                            candidate.id,
                                            'interviewUrl',
                                            event.target.value
                                          )
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-xs shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                                      />
                                    </label>

                                    {interviewDraftState.error ? (
                                      <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                        {interviewDraftState.error}
                                      </div>
                                    ) : null}

                                    <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleCreateInterview(candidate)}
                                        disabled={interviewDraftState.submitting}
                                        className="rounded-full bg-[color:var(--app-accent-strong)] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(208,95,47,0.3)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
                                      >
                                        {interviewDraftState.submitting
                                          ? 'Guardando...'
                                          : 'Guardar entrevista'}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--app-muted)]">
                        Aun no hay candidaturas registradas.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/80 p-5 text-sm text-[var(--app-muted)]">
            Aun no hay procesos creados. Crea una eleccion para comenzar.
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
      </button>
    </section>
  )
}

export default OrganizerDashboardPage
