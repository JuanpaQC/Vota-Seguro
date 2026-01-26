import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createElection } from '../../elections/services/electionsService.js'

const createEmptyProposal = () => ({
  title: '',
  topic: '',
  type: '',
  summary: '',
  detail: '',
  sourceUrl: '',
})

const createEmptyCandidate = () => ({
  name: '',
  party: '',
  age: '',
  origin: '',
  photoUrl: '',
  education: '',
  bio: '',
  websiteUrl: '',
  governmentPlan: {
    title: '',
    summary: '',
    url: '',
  },
  proposals: [],
})

const initialForm = {
  name: '',
  type: '',
  mode: 'organizational',
  date: '',
  positionsText: '',
  description: '',
  organizationId: '',
  organizationName: '',
  isActive: true,
  candidates: [createEmptyCandidate()],
}

function OrganizerElectionCreatePage() {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false
    if (!form.candidates.length) return false
    return form.candidates.every((candidate) => candidate.name.trim())
  }, [form])

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateCandidateField = (index, field, value) => {
    setForm((prev) => {
      const candidates = prev.candidates.map((candidate, idx) =>
        idx === index ? { ...candidate, [field]: value } : candidate
      )
      return { ...prev, candidates }
    })
  }

  const updateCandidatePlanField = (index, field, value) => {
    setForm((prev) => {
      const candidates = prev.candidates.map((candidate, idx) =>
        idx === index
          ? { ...candidate, governmentPlan: { ...candidate.governmentPlan, [field]: value } }
          : candidate
      )
      return { ...prev, candidates }
    })
  }

  const addCandidate = () => {
    setForm((prev) => ({
      ...prev,
      candidates: [...prev.candidates, createEmptyCandidate()],
    }))
  }

  const removeCandidate = (index) => {
    setForm((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((_, idx) => idx !== index),
    }))
  }

  const addProposal = (candidateIndex) => {
    setForm((prev) => {
      const candidates = prev.candidates.map((candidate, idx) => {
        if (idx !== candidateIndex) return candidate
        return {
          ...candidate,
          proposals: [...candidate.proposals, createEmptyProposal()],
        }
      })
      return { ...prev, candidates }
    })
  }

  const updateProposalField = (candidateIndex, proposalIndex, field, value) => {
    setForm((prev) => {
      const candidates = prev.candidates.map((candidate, idx) => {
        if (idx !== candidateIndex) return candidate
        const proposals = candidate.proposals.map((proposal, pIndex) =>
          pIndex === proposalIndex ? { ...proposal, [field]: value } : proposal
        )
        return { ...candidate, proposals }
      })
      return { ...prev, candidates }
    })
  }

  const removeProposal = (candidateIndex, proposalIndex) => {
    setForm((prev) => {
      const candidates = prev.candidates.map((candidate, idx) => {
        if (idx !== candidateIndex) return candidate
        return {
          ...candidate,
          proposals: candidate.proposals.filter((_, pIndex) => pIndex !== proposalIndex),
        }
      })
      return { ...prev, candidates }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(null)

    if (!form.name.trim()) {
      setError('El nombre de la eleccion es obligatorio.')
      return
    }

    if (!form.candidates.length) {
      setError('Agrega al menos una candidatura para continuar.')
      return
    }

    if (form.candidates.some((candidate) => !candidate.name.trim())) {
      setError('Cada candidatura debe incluir el nombre del candidato.')
      return
    }

    const invalidProposal = form.candidates.some((candidate) =>
      candidate.proposals.some((proposal) => {
        const hasContent = [
          proposal.title,
          proposal.topic,
          proposal.type,
          proposal.summary,
          proposal.detail,
          proposal.sourceUrl,
        ].some((value) => value.trim())
        if (!hasContent) return false
        return !proposal.title.trim() || !proposal.topic.trim()
      })
    )

    if (invalidProposal) {
      setError('Completa el titulo y el tema de cada propuesta que agregues.')
      return
    }

    const invalidAge = form.candidates.some((candidate) => {
      if (!candidate.age) return false
      return Number.isNaN(Number.parseInt(candidate.age, 10))
    })

    if (invalidAge) {
      setError('La edad de cada candidato debe ser numerica.')
      return
    }

    const positions = form.positionsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const candidates = form.candidates.map((candidate) => {
      const parsedAge = candidate.age ? Number.parseInt(candidate.age, 10) : undefined

      const proposals = candidate.proposals
        .map((proposal) => ({
          title: proposal.title.trim(),
          topic: proposal.topic.trim(),
          type: proposal.type.trim() || undefined,
          summary: proposal.summary.trim() || undefined,
          detail: proposal.detail.trim() || undefined,
          sourceUrl: proposal.sourceUrl.trim() || undefined,
        }))
        .filter((proposal) => proposal.title && proposal.topic)

      const governmentPlan = {
        title: candidate.governmentPlan.title.trim(),
        summary: candidate.governmentPlan.summary.trim(),
        url: candidate.governmentPlan.url.trim(),
      }

      const hasGovernmentPlan = Object.values(governmentPlan).some((value) => value)

      return {
        name: candidate.name.trim(),
        party: candidate.party.trim() || undefined,
        age: parsedAge,
        origin: candidate.origin.trim() || undefined,
        photoUrl: candidate.photoUrl.trim() || undefined,
        education: candidate.education.trim() || undefined,
        bio: candidate.bio.trim() || undefined,
        websiteUrl: candidate.websiteUrl.trim() || undefined,
        governmentPlan: hasGovernmentPlan ? governmentPlan : undefined,
        proposals: proposals.length ? proposals : undefined,
      }
    })

    const payload = {
      name: form.name.trim(),
      type: form.type.trim() || undefined,
      mode: form.mode || undefined,
      date: form.date || undefined,
      positions: positions.length ? positions : undefined,
      description: form.description.trim() || undefined,
      organizationId: form.organizationId.trim() || undefined,
      organizationName: form.organizationName.trim() || undefined,
      isActive: form.isActive,
      candidates,
    }

    setIsSubmitting(true)
    try {
      const response = await createElection(payload)
      setSuccess({
        id: response.id,
        candidates: response.candidates?.length || candidates.length,
      })
      setForm({ ...initialForm, candidates: [createEmptyCandidate()] })
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      const apiIssues = err?.response?.data?.issues
      if (Array.isArray(apiIssues) && apiIssues.length) {
        const details = apiIssues
          .map((issue) => `${issue.path || 'campo'}: ${issue.message}`)
          .join(' | ')
        setError(`Errores de validacion: ${details}`)
      } else if (apiMessage) {
        setError(apiMessage)
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('No se pudo crear la eleccion. Verifica los datos e intenta nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
            Organizacion
          </p>
          <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
            Crear eleccion organizacional
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--app-muted)]">
            Registra un nuevo proceso de eleccion con candidatos, propuestas y planes de
            gobierno para publicarlo en el sitio.
          </p>
        </div>
        <Link
          to="/organizers"
          className="rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
        >
          Volver al panel
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold text-[var(--app-ink)]">Datos del proceso</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Nombre del proceso
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateFormField('name', event.target.value)}
                placeholder="Eleccion presidencial 2026"
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Tipo de eleccion
              <input
                type="text"
                value={form.type}
                onChange={(event) => updateFormField('type', event.target.value)}
                placeholder="Presidencial, Consejo, Junta directiva"
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Modo
              <select
                value={form.mode}
                onChange={(event) => updateFormField('mode', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              >
                <option value="organizational">Organizacional</option>
                <option value="national">Nacional</option>
                <option value="municipal">Municipal</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Fecha clave
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateFormField('date', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Posiciones / cargos (separados por coma)
              <input
                type="text"
                value={form.positionsText}
                onChange={(event) => updateFormField('positionsText', event.target.value)}
                placeholder="Presidencia, Vicepresidencia"
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Descripcion general
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => updateFormField('description', event.target.value)}
                placeholder="Contexto del proceso y alcance de la eleccion."
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Nombre de la organizacion
              <input
                type="text"
                value={form.organizationName}
                onChange={(event) => updateFormField('organizationName', event.target.value)}
                placeholder="Consejo Ejecutivo"
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              ID interno de organizacion (opcional)
              <input
                type="text"
                value={form.organizationId}
                onChange={(event) => updateFormField('organizationId', event.target.value)}
                placeholder="ORG-2026"
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm font-medium text-[var(--app-ink)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateFormField('isActive', event.target.checked)}
              className="h-4 w-4 rounded border-[color:var(--app-border)] text-[var(--app-accent-strong)] focus:ring-[color:var(--app-ring)]"
            />
            Publicar como eleccion activa
          </label>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-ink)]">Candidaturas</h2>
              <p className="text-sm text-[var(--app-muted)]">
                Agrega perfiles con biografia, propuestas y plan de gobierno.
              </p>
            </div>
            <button
              type="button"
              onClick={addCandidate}
              className="rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Agregar candidato
            </button>
          </div>

          {form.candidates.map((candidate, index) => (
            <article
              key={`candidate-${index}`}
              className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[var(--app-ink)]">
                  Candidato {index + 1}
                </h3>
                {form.candidates.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeCandidate(index)}
                    className="text-xs font-semibold text-red-600"
                  >
                    Quitar candidato
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Nombre completo
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(event) =>
                      updateCandidateField(index, 'name', event.target.value)
                    }
                    placeholder="Nombre del candidato"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Partido / designacion
                  <input
                    type="text"
                    value={candidate.party}
                    onChange={(event) =>
                      updateCandidateField(index, 'party', event.target.value)
                    }
                    placeholder="Partido o lista"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Edad
                  <input
                    type="number"
                    min="18"
                    value={candidate.age}
                    onChange={(event) =>
                      updateCandidateField(index, 'age', event.target.value)
                    }
                    placeholder="45"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Lugar de origen
                  <input
                    type="text"
                    value={candidate.origin}
                    onChange={(event) =>
                      updateCandidateField(index, 'origin', event.target.value)
                    }
                    placeholder="Ciudad, Pais"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Foto (URL)
                  <input
                    type="url"
                    value={candidate.photoUrl}
                    onChange={(event) =>
                      updateCandidateField(index, 'photoUrl', event.target.value)
                    }
                    placeholder="https://"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Sitio web (URL)
                  <input
                    type="url"
                    value={candidate.websiteUrl}
                    onChange={(event) =>
                      updateCandidateField(index, 'websiteUrl', event.target.value)
                    }
                    placeholder="https://"
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Formacion / experiencia
                  <input
                    type="text"
                    value={candidate.education}
                    onChange={(event) =>
                      updateCandidateField(index, 'education', event.target.value)
                    }
                    placeholder="Economista, ex ministra, etc."
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
                <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                  Biografia
                  <textarea
                    rows="3"
                    value={candidate.bio}
                    onChange={(event) =>
                      updateCandidateField(index, 'bio', event.target.value)
                    }
                    placeholder="Resumen de trayectoria y logros."
                    className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-5">
                <h4 className="text-sm font-semibold text-[var(--app-ink)]">
                  Plan de gobierno (opcional)
                </h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                    Titulo del plan
                    <input
                      type="text"
                      value={candidate.governmentPlan.title}
                      onChange={(event) =>
                        updateCandidatePlanField(index, 'title', event.target.value)
                      }
                      placeholder="Plan Pais 2026"
                      className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                    URL del plan
                    <input
                      type="url"
                      value={candidate.governmentPlan.url}
                      onChange={(event) =>
                        updateCandidatePlanField(index, 'url', event.target.value)
                      }
                      placeholder="https://"
                      className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                    />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                    Resumen del plan
                    <textarea
                      rows="2"
                      value={candidate.governmentPlan.summary}
                      onChange={(event) =>
                        updateCandidatePlanField(index, 'summary', event.target.value)
                      }
                      placeholder="Sintesis de ejes programaticos."
                      className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[var(--app-ink)]">Propuestas</h4>
                  <button
                    type="button"
                    onClick={() => addProposal(index)}
                    className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                  >
                    Agregar propuesta
                  </button>
                </div>

                {candidate.proposals.length ? (
                  <div className="mt-4 space-y-4">
                    {candidate.proposals.map((proposal, proposalIndex) => (
                      <div
                        key={`proposal-${index}-${proposalIndex}`}
                        className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                            Propuesta {proposalIndex + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeProposal(index, proposalIndex)}
                            className="text-xs font-semibold text-red-600"
                          >
                            Quitar
                          </button>
                        </div>
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Titulo
                            <input
                              type="text"
                              value={proposal.title}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'title',
                                  event.target.value
                                )
                              }
                              placeholder="Reforma educativa"
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Tema
                            <input
                              type="text"
                              value={proposal.topic}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'topic',
                                  event.target.value
                                )
                              }
                              placeholder="Educacion"
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Tipo
                            <input
                              type="text"
                              value={proposal.type}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'type',
                                  event.target.value
                                )
                              }
                              placeholder="Promesa, plan, ley"
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Fuente (URL)
                            <input
                              type="url"
                              value={proposal.sourceUrl}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'sourceUrl',
                                  event.target.value
                                )
                              }
                              placeholder="https://"
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                          <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Resumen
                            <textarea
                              rows="2"
                              value={proposal.summary}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'summary',
                                  event.target.value
                                )
                              }
                              placeholder="Resumen ejecutivo de la propuesta."
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                          <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                            Detalle
                            <textarea
                              rows="3"
                              value={proposal.detail}
                              onChange={(event) =>
                                updateProposalField(
                                  index,
                                  proposalIndex,
                                  'detail',
                                  event.target.value
                                )
                              }
                              placeholder="Detalle ampliado y objetivos concretos."
                              className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--app-muted)]">
                    Aun no agregas propuestas para este candidato.
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Eleccion creada con exito. ID: {success.id}. Candidatos registrados:{' '}
            {success.candidates}.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-full bg-[color:var(--app-accent-strong)] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creando eleccion...' : 'Crear eleccion'}
          </button>
          <Link
            to="/"
            className="rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[var(--app-accent)] hover:text-[var(--app-accent-strong)]"
          >
            Ver sitio publico
          </Link>
        </div>
      </form>
    </section>
  )
}

export default OrganizerElectionCreatePage
