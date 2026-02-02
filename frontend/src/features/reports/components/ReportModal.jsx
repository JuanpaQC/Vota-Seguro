import { useEffect, useMemo, useState } from 'react'
import { createReport } from '../services/reports.service.js'

/**
 * Lista de motivos disponibles para el reporte.
 * Se muestran en el select del formulario.
 */
const REASONS = [
    'Dato incorrecto',
    'Fuente rota o inexistente',
    'Información desactualizada',
    'Información dudosa',
    'Otro',
]

/**
 * ReportModal
 *
 * Modal reutilizable para reportar errores o información dudosa.
 *
 * Responsabilidades:
 * - Mostrar un formulario con motivo y descripción opcional.
 * - Validar mínimamente antes de enviar.
 * - Enviar el reporte al backend usando createReport().
 * - Mostrar mensajes de estado (éxito o error).
 *
 * Props:
 * - open (boolean): controla si el modal se renderiza o no.
 * - onClose (function): callback para cerrar el modal.
 * - itemType (string): tipo de elemento reportado (candidate | proposal | other).
 * - itemId (string): id del elemento reportado (requerido si itemType es candidate o proposal).
 * - electionId (string): id de la elección (opcional; se envía si está disponible).
 */
export default function ReportModal({ open, onClose, itemType, itemId, electionId }) {
    /**
     * reason: motivo seleccionado en el formulario.
     * description: descripción libre opcional.
     * statusMsg: mensaje de retroalimentación para el usuario.
     * submitting: indica si se está enviando el reporte (para deshabilitar controles).
     */
    const [reason, setReason] = useState(REASONS[0])
    const [description, setDescription] = useState('')
    const [statusMsg, setStatusMsg] = useState('')
    const [submitting, setSubmitting] = useState(false)

    /**
     * canSubmit:
     * Validación mínima previa al envío.
     *
     * Reglas:
     * - itemType debe existir.
     * - Si itemType es candidate o proposal, itemId debe existir.
     * - reason debe tener al menos 3 caracteres (coincide con el schema del backend).
     *
     * useMemo evita recalcular en cada render si no cambian dependencias.
     */
    const canSubmit = useMemo(() => {
        if (!itemType) return false
        if ((itemType === 'candidate' || itemType === 'proposal') && !itemId) return false
        if (!reason || reason.trim().length < 3) return false
        return true
    }, [itemType, itemId, reason])

    /**
     * Reinicia el estado del modal cuando se cierra (open pasa a false).
     * Esto evita que queden mensajes o texto del formulario de aperturas anteriores.
     */
    useEffect(() => {
        if (!open) {
            setStatusMsg('')
            setSubmitting(false)
            setReason(REASONS[0])
            setDescription('')
        }
    }, [open])

    /**
     * Si open es false, no se renderiza nada.
     * Esto mantiene el componente fuera del DOM cuando no se usa.
     */
    if (!open) return null

    /**
     * submit:
     * - Limpia mensajes previos.
     * - Valida canSubmit.
     * - Envía el payload al backend.
     * - Muestra mensaje de éxito o error.
     * - Opcionalmente cierra el modal luego de un pequeño retraso.
     */
    const submit = async () => {
        setStatusMsg('')

        if (!canSubmit) {
            setStatusMsg('Completa los datos requeridos antes de enviar.')
            return
        }

        try {
            setSubmitting(true)

            /**
             * Payload esperado por el backend (según reports.schema.js):
             * - itemType: 'candidate' | 'proposal' | 'other'
             * - itemId: string (requerido para candidate/proposal, opcional para other)
             * - electionId: opcional
             * - reason: string (min 3)
             * - description: opcional
             * - sourceUrl: opcional
             *
             * La descripción se envía solo si tiene contenido (evita guardar strings vacíos).
             */
            await createReport({
                itemType,
                itemId,
                electionId,
                reason,
                description: description.trim() ? description.trim() : undefined,
                sourceUrl: window.location.href,
            })

            setStatusMsg('Reporte enviado. ¡Gracias!')

            /**
             * Cierre automático opcional:
             * permite que el usuario vea el mensaje antes de cerrar.
             */
            setTimeout(() => onClose?.(), 600)
        } catch (err) {
            /**
             * Manejo de error genérico.
             * Si deseas más detalle, aquí podrías leer err.response?.data?.message si usas axios.
             */
            setStatusMsg('No se pudo enviar el reporte. Revisa la consola / backend.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            /**
             * Overlay del modal.
             * fixed + inset-0 cubre toda la pantalla.
             * bg-black/40 crea el fondo oscuro semitransparente.
             */
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                /**
                 * Cierra el modal si el clic ocurre sobre el overlay (fuera del contenido),
                 * comparando el target con el currentTarget.
                 */
                if (e.target === e.currentTarget) onClose?.()
            }}
        >
            {/* Contenedor principal del modal */}
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

                    {/* Botón para cerrar manualmente */}
                    <button
                        className="rounded-full border border-[color:var(--app-border)] px-3 py-1 text-sm text-[var(--app-muted)] hover:text-[var(--app-ink)]"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cerrar
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    {/* Selector de motivo */}
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

                    {/* Campo de descripción */}
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

                    {/* Mensaje de estado para el usuario */}
                    {statusMsg ? (
                        <div className="rounded-xl border border-[color:var(--app-border)] bg-white/70 p-3 text-sm text-[var(--app-ink)]">
                            {statusMsg}
                        </div>
                    ) : null}

                    {/* Acciones */}
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
