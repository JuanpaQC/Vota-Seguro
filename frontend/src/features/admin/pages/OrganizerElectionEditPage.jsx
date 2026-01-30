import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getElection, updateElection } from '../../elections/services/electionsService.js'
import {
  createCandidate,
  listCandidates,
} from '../../candidates/services/candidatesService.js'

const emptyForm = {
  name: '',
  type: '',
  mode: 'organizational',
  date: '',
  positionsText: '',
  description: '',
  organizationId: '',
  organizationName: '',
  isActive: true,
}

const createEmptyCandidate = () => ({
  name: '',
  party: '',
  age: '',
  origin: '',
  photoUrl: '',
  education: '',
  bio: '',
  websiteUrl: '',
  ideology: '',
  governmentPlan: {
    title: '',
    summary: '',
    url: '',
  },
})

function OrganizerElectionEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [candidates, setCandidates] = useState([])
  const [newCandidates, setNewCandidates] = useState([])
  const [isCreatingCandidates, setIsCreatingCandidates] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [candidateSuccess, setCandidateSuccess] = useState('')

  const canSubmit = useMemo(() => Boolean(form.name.trim()), [form.name])

  useEffect(() => {
    let isMounted = true

    const fetchElection = async () => {
      setIsLoading(true)
      setError('')
      setCandidateError('')
      try {
        const data = await getElection(id)
        if (!isMounted) return

        setForm({
          name: data.name || '',
          type: data.type || '',
          mode: data.mode || 'organizational',
          date: data.date || '',
          positionsText: Array.isArray(data.positions) ? data.positions.join(', ') : '',
          description: data.description || '',
          organizationId: data.organizationId || '',
          organizationName: data.organizationName || '',
          isActive: data.isActive ?? true,
        })
        setNewCandidates([])
        setCandidateSuccess('')

        try {
          const candidatesData = await listCandidates({ electionId: id })
          if (isMounted) {
            setCandidates(candidatesData)
          }
        } catch (err) {
          if (isMounted) {
            setCandidateError('No se pudieron cargar las candidaturas registradas.')
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la eleccion seleccionada.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchElection()
    return () => {
      isMounted = false
    }
  }, [id])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addCandidateForm = () => {
    setNewCandidates((prev) => [...prev, createEmptyCandidate()])
    setCandidateError('')
    setCandidateSuccess('')
  }

  const removeCandidateForm = (index) => {
    setNewCandidates((prev) => prev.filter((_, idx) => idx !== index))
  }

  const updateNewCandidateField = (index, field, value) => {
    setNewCandidates((prev) => {
      const updated = prev.map((candidate, idx) =>
        idx === index ? { ...candidate, [field]: value } : candidate
      )
      return updated
    })
  }

  const updateNewCandidatePlanField = (index, field, value) => {
    setNewCandidates((prev) => {
      const updated = prev.map((candidate, idx) =>
        idx === index
          ? {
              ...candidate,
              governmentPlan: { ...candidate.governmentPlan, [field]: value },
            }
          : candidate
      )
      return updated
    })
  }

  const handleCreateCandidates = async (event) => {
    event.preventDefault()
    setCandidateError('')
    setCandidateSuccess('')

    if (!newCandidates.length) {
      setCandidateError('Agrega al menos un candidato para continuar.')
      return
    }

    if (newCandidates.some((candidate) => !candidate.name.trim())) {
      setCandidateError('Cada candidatura debe incluir el nombre del candidato.')
      return
    }

    const invalidAge = newCandidates.some((candidate) => {
      if (!candidate.age) return false
      return Number.isNaN(Number.parseInt(candidate.age, 10))
    })

    if (invalidAge) {
      setCandidateError('La edad de cada candidato debe ser numerica.')
      return
    }

    const payloads = newCandidates.map((candidate) => {
      const parsedAge = candidate.age ? Number.parseInt(candidate.age, 10) : undefined
      const governmentPlan = {
        title: candidate.governmentPlan?.title?.trim() || undefined,
        summary: candidate.governmentPlan?.summary?.trim() || undefined,
        url: candidate.governmentPlan?.url?.trim() || undefined,
      }
      const hasGovernmentPlan = Object.values(governmentPlan).some((value) => value)

      return {
        name: candidate.name.trim(),
        electionId: id,
        party: candidate.party.trim() || undefined,
        age: parsedAge,
        origin: candidate.origin.trim() || undefined,
        photoUrl: candidate.photoUrl.trim() || undefined,
        education: candidate.education.trim() || undefined,
        bio: candidate.bio.trim() || undefined,
        websiteUrl: candidate.websiteUrl.trim() || undefined,
        ideology: candidate.ideology.trim() || undefined,
        governmentPlan: hasGovernmentPlan ? governmentPlan : undefined,
      }
    })

    setIsCreatingCandidates(true)
    try {
      const createdCandidates = []
      for (const payload of payloads) {
        const created = await createCandidate(payload)
        createdCandidates.push(created)
      }
      setCandidates((prev) => [...prev, ...createdCandidates])
      setNewCandidates([])
      const count = createdCandidates.length
      setCandidateSuccess(
        `Se ${count === 1 ? 'agrego' : 'agregaron'} ${count} candidato${
          count === 1 ? '' : 's'
        }.`
      )
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      const apiIssues = err?.response?.data?.issues
      if (Array.isArray(apiIssues) && apiIssues.length) {
        const details = apiIssues
          .map((issue) => `${issue.path || 'campo'}: ${issue.message}`)
          .join(' | ')
        setCandidateError(`Errores de validacion: ${details}`)
      } else if (apiMessage) {
        setCandidateError(apiMessage)
      } else if (err?.message) {
        setCandidateError(err.message)
      } else {
        setCandidateError('No se pudo agregar la candidatura.')
      }
    } finally {
      setIsCreatingCandidates(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('El nombre del proceso es obligatorio.')
      return
    }

    const positions = form.positionsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

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
    }

    setIsSubmitting(true)
    try {
      await updateElection(id, payload)
      setSuccess('Eleccion actualizada correctamente.')
      setTimeout(() => navigate('/organizers'), 800)
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || 'No se pudo actualizar la eleccion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando informacion de la eleccion...
      </section>
    )
  }

  if (error && !form.name) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
        <Link
          to="/organizers"
          className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)]"
        >
          Volver al panel
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
            Edicion
          </p>
          <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
            Editar eleccion
          </h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Actualiza la informacion general del proceso electoral.
          </p>
        </div>
        <Link
          to="/organizers"
          className="rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
        >
          Volver al panel
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Nombre del proceso
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Tipo de eleccion
              <input
                type="text"
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Modo
              <select
                value={form.mode}
                onChange={(event) => updateField('mode', event.target.value)}
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
                onChange={(event) => updateField('date', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Posiciones / cargos (separados por coma)
              <input
                type="text"
                value={form.positionsText}
                onChange={(event) => updateField('positionsText', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Descripcion
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Nombre de la organizacion
              <input
                type="text"
                value={form.organizationName}
                onChange={(event) => updateField('organizationName', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              ID interno de organizacion
              <input
                type="text"
                value={form.organizationId}
                onChange={(event) => updateField('organizationId', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm font-medium text-[var(--app-ink)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField('isActive', event.target.checked)}
              className="h-4 w-4 rounded border-[color:var(--app-border)] text-[var(--app-accent-strong)] focus:ring-[color:var(--app-ring)]"
            />
            Publicar como eleccion activa
          </label>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-full bg-[color:var(--app-accent-strong)] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/organizers')}
            className="rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
          >
            Cancelar
          </button>
        </div>
      </form>

      <form onSubmit={handleCreateCandidates} className="space-y-6">
        <section className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-ink)]">
                Candidaturas registradas
              </h2>
              <p className="text-sm text-[var(--app-muted)]">
                Agrega candidatos adicionales si faltaron al crear la eleccion.
              </p>
            </div>
            <button
              type="button"
              onClick={addCandidateForm}
              className="rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Agregar candidato
            </button>
          </div>

          {candidates.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-ink)]">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-[var(--app-muted)]">
                        {[candidate.party, candidate.origin].filter(Boolean).join(' · ') ||
                          'Sin detalles'}
                      </p>
                    </div>
                    <Link
                      to={`/organizers/candidates/${candidate.id}/edit`}
                      className="rounded-full border border-[color:var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--app-muted)]">
              Aun no hay candidaturas registradas.
            </p>
          )}
        </section>

        {newCandidates.length ? (
          <section className="space-y-5">
            {newCandidates.map((candidate, index) => (
              <article
                key={`new-candidate-${index}`}
                className="rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-[var(--app-ink)]">
                    Nuevo candidato {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeCandidateForm(index)}
                    className="text-xs font-semibold text-red-600"
                  >
                    Quitar
                  </button>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                    Nombre completo
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(event) =>
                        updateNewCandidateField(index, 'name', event.target.value)
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
                        updateNewCandidateField(index, 'party', event.target.value)
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
                        updateNewCandidateField(index, 'age', event.target.value)
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
                        updateNewCandidateField(index, 'origin', event.target.value)
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
                        updateNewCandidateField(index, 'photoUrl', event.target.value)
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
                        updateNewCandidateField(index, 'websiteUrl', event.target.value)
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
                        updateNewCandidateField(index, 'education', event.target.value)
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
                        updateNewCandidateField(index, 'bio', event.target.value)
                      }
                      placeholder="Resumen de trayectoria y logros."
                      className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                    />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                    Ideologia
                    <textarea
                      rows="3"
                      value={candidate.ideology}
                      onChange={(event) =>
                        updateNewCandidateField(index, 'ideology', event.target.value)
                      }
                      placeholder="Describe la ideologia politica del candidato..."
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
                          updateNewCandidatePlanField(index, 'title', event.target.value)
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
                          updateNewCandidatePlanField(index, 'url', event.target.value)
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
                          updateNewCandidatePlanField(index, 'summary', event.target.value)
                        }
                        placeholder="Sintesis de ejes programaticos."
                        className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="text-sm text-[var(--app-muted)]">
            Usa el boton "Agregar candidato" para registrar nuevas candidaturas.
          </p>
        )}

        {candidateError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {candidateError}
          </div>
        ) : null}

        {candidateSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {candidateSuccess}
          </div>
        ) : null}

        {newCandidates.length ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isCreatingCandidates}
              className="rounded-full bg-[color:var(--app-accent-strong)] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(208,95,47,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingCandidates ? 'Guardando...' : 'Guardar candidatos'}
            </button>
            <button
              type="button"
              onClick={() => setNewCandidates([])}
              className="rounded-full border border-[color:var(--app-border)] px-5 py-2 text-sm font-semibold text-[var(--app-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
            >
              Descartar borradores
            </button>
          </div>
        ) : null}
      </form>
    </section>
  )
}

export default OrganizerElectionEditPage
