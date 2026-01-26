import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProposal, updateProposal } from '../../proposals/services/proposalsService.js'

const emptyForm = {
  title: '',
  topic: '',
  type: '',
  summary: '',
  detail: '',
  sourceUrl: '',
}

function OrganizerProposalEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(
    () => Boolean(form.title.trim() && form.topic.trim()),
    [form.title, form.topic]
  )

  useEffect(() => {
    let isMounted = true

    const fetchProposal = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getProposal(id)
        if (!isMounted) return

        setForm({
          title: data.title || '',
          topic: data.topic || '',
          type: data.type || '',
          summary: data.summary || '',
          detail: data.detail || '',
          sourceUrl: data.sourceUrl || '',
        })
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la propuesta seleccionada.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchProposal()
    return () => {
      isMounted = false
    }
  }, [id])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim() || !form.topic.trim()) {
      setError('Titulo y tema son obligatorios.')
      return
    }

    const payload = {
      title: form.title.trim(),
      topic: form.topic.trim(),
      type: form.type.trim() || undefined,
      summary: form.summary.trim() || undefined,
      detail: form.detail.trim() || undefined,
      sourceUrl: form.sourceUrl.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      await updateProposal(id, payload)
      setSuccess('Propuesta actualizada correctamente.')
      setTimeout(() => navigate('/organizers'), 800)
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || 'No se pudo actualizar la propuesta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando informacion de la propuesta...
      </section>
    )
  }

  if (error && !form.title) {
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
            Editar propuesta
          </h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Actualiza el titulo, tema y detalle de la propuesta.
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
              Titulo
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Tema
              <input
                type="text"
                value={form.topic}
                onChange={(event) => updateField('topic', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Tipo
              <input
                type="text"
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Fuente (URL)
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(event) => updateField('sourceUrl', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Resumen
              <textarea
                rows="2"
                value={form.summary}
                onChange={(event) => updateField('summary', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
            <label className="md:col-span-2 space-y-2 text-sm font-medium text-[var(--app-ink)]">
              Detalle
              <textarea
                rows="3"
                value={form.detail}
                onChange={(event) => updateField('detail', event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--app-border)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--app-accent-strong)] focus:ring-4 focus:ring-[color:var(--app-ring)]"
              />
            </label>
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

export default OrganizerProposalEditPage
