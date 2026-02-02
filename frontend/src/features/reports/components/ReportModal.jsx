import { useEffect, useMemo, useState } from 'react'
import { createReport } from '../services/reports.service.js'

const REASONS = [
    'Dato incorrecto',
    'Fuente rota o inexistente',
    'Información desactualizada',
    'Información dudosa',
    'Otro',
]

export default function ReportModal({ open, onClose, itemType, itemId, electionId }) {
    const [reason, setReason] = useState(REASONS[0])
    const [description, setDescription] = useState('')
    const [statusMsg, setStatusMsg] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const canSubmit = useMemo(() => {
        if (!itemType) return false
        if ((itemType === 'candidate' || itemType === 'proposal') && !itemId) return false
        if (!reason || reason.trim().length < 3) return false
        return true
    }, [itemType, itemId, reason])

    useEffect(() => {
        if (!open) {
            setStatusMsg('')
            setSubmitting(false)
            setReason(REASONS[0])
            setDescription('')
        }
    }, [open])

    if (!open) return null

    const submit = async () => {
        setStatusMsg('')

        if (!canSubmit) {
            setStatusMsg('Completa los datos requeridos antes de enviar.')
            return
        }

        try {
            setSubmitting(true)

            await createReport({
                itemType,
                itemId,
                electionId, // opcional según tu backend
                reason,
                description: description.trim() ? description.trim() : undefined,
                sourceUrl: window.location.href,
            })

            setStatusMsg('✅ Reporte enviado. ¡Gracias!')
            // Cierra automáticamente después de un momento (opcional)
            setTimeout(() => onClose?.(), 600)
        } catch (err) {
            setStatusMsg('❌ No se pudo enviar el reporte. Revisa la consola / backend.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                // cerrar si hacen click fuera
                if (e.target === e.currentTarget) onClose?.()
            }}
        >
            <div className="w-full max-w-lg rounded-2xl border border-[color:var(--app-border)] bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-[var(--app-ink)]">
                            Reportar error o información dudosa
                        </h2>
                        <p className="mt-1 text-sm text-[var(--app-muted)]">
                            Selecciona el motivo y describe el problema (opcional).
                        </p>
                    </div>

                    <button
                        className="rounded-full border border-[color:var(--app-border)] px-3 py-1 text-sm text-[var(--app-muted)] hover:text-[var(--app-ink)]"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cerrar
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-[var(--app-ink)]">Motivo</label>
                        <select
                            className="mt-1 w-full rounded-xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-sm"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={submitting}
                        >
                            {REASONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-[var(--app-ink)]">
                            Descripción (opcional)
                        </label>
                        <textarea
                            className="mt-1 min-h-[110px] w-full rounded-xl border border-[color:var(--app-border)] bg-white px-3 py-2 text-sm"
                            placeholder="Ej: La edad no coincide con la fuente oficial..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={submitting}
                        />
                    </div>

                    {statusMsg ? (
                        <div className="rounded-xl border border-[color:var(--app-border)] bg-white/70 p-3 text-sm text-[var(--app-ink)]">
                            {statusMsg}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <button
                            className="rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)]"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>

                        <button
                            className="rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--app-accent-strong)] transition hover:border-[color:var(--app-accent)] disabled:opacity-60"
                            onClick={submit}
                            disabled={submitting || !canSubmit}
                        >
                            {submitting ? 'Enviando...' : 'Enviar reporte'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
