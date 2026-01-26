import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getCandidate,
  updateCandidate,
} from '../../candidates/services/candidatesService.js'

const emptyForm = {
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
}

function OrganizerCandidateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => Boolean(form.name.trim()), [form.name])

  useEffect(() => {
    let isMounted = true

    const fetchCandidate = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getCandidate(id)
        if (!isMounted) return

        setForm({
          name: data.name || '',
          party: data.party || '',
          age: data.age ? String(data.age) : '',
          origin: data.origin || '',
          photoUrl: data.photoUrl || '',
          education: data.education || '',
          bio: data.bio || '',
          websiteUrl: data.websiteUrl || '',
          governmentPlan: {
            title: data.governmentPlan?.title || '',
            summary: data.governmentPlan?.summary || '',
            url: data.governmentPlan?.url || '',
          },
        })
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la candidatura seleccionada.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCandidate()
    return () => {
      isMounted = false
    }
  }, [id])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updatePlanField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      governmentPlan: { ...prev.governmentPlan, [field]: value },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('El nombre del candidato es obligatorio.')
      return
    }

    const parsedAge = form.age ? Number.parseInt(form.age, 10) : undefined
    if (form.age && Number.isNaN(parsedAge)) {
      setError('La edad debe ser numerica.')
      return
    }

    const governmentPlan = {
      title: form.governmentPlan.title.trim(),
      summary: form.governmentPlan.summary.trim(),
      url: form.governmentPlan.url.trim(),
    }

    const hasGovernmentPlan = Object.values(governmentPlan).some((value) => value)

    const payload = {
      name: form.name.trim(),
      party: form.party.trim() || undefined,
      age: parsedAge,
      origin: form.origin.trim() || undefined,
      photoUrl: form.photoUrl.trim() || undefined,
      education: form.education.trim() || undefined,
      bio: form.bio.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      governmentPlan: hasGovernmentPlan ? governmentPlan : undefined,
    }

    setIsSubmitting(true)
    try {
      await updateCandidate(id, payload)
      setSuccess('Candidatura actualizada correctamente.')
      setTimeout(() => navigate('/organizers'), 800)
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || 'No se pudo actualizar la candidatura.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando informacion de la candidatura...
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
            Editar candidatura
          </h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Ajusta la informacion del candidato y su plan de gobierno.
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
              Nombre completo
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Partido / designacion
              <input
                type="text"
                value={form.party}
                onChange={(event) => updateField('party', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Edad
              <input
                type="number"
                min="18"
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Lugar de origen
              <input
                type="text"
                value={form.origin}
                onChange={(event) => updateField('origin', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Foto (URL)
              <input
                type="url"
                value={form.photoUrl}
                onChange={(event) => updateField('photoUrl', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Sitio web (URL)
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(event) => updateField('websiteUrl', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Formacion / experiencia
              <input
                type="text"
                value={form.education}
                onChange={(event) => updateField('education', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Biografia
              <textarea
                rows="3"
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/70 p-5">
            <h4 className="text-sm font-semibold text-[var(--app-ink)]">
              Plan de gobierno
            </h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                Titulo del plan
                <input
                  type="text"
                  value={form.governmentPlan.title}
                  onChange={(event) => updatePlanField('title', event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
                URL del plan
                <input
                  type="url"
                  value={form.governmentPlan.url}
                  onChange={(event) => updatePlanField('url', event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                />
              </label>
              <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
                Resumen del plan
                <textarea
                  rows="2"
                  value={form.governmentPlan.summary}
                  onChange={(event) => updatePlanField('summary', event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
                />
              </label>
            </div>
          </div>
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
    </section>
  )
}

export default OrganizerCandidateEditPage
