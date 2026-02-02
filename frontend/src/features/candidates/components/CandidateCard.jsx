import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReportModal from '../../reports/components/ReportModal.jsx'

function CandidateCard({ candidate, electionId }) {
  const [openReport, setOpenReport] = useState(false)

  return (
      <>
        <Link
            to={`/elections/${electionId}/candidates/${candidate.id}`}
            className="group block rounded-3xl border border-[color:var(--app-border)] bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(15,23,42,0.12)]"
        >
          <div className="flex flex-wrap gap-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[var(--app-bg)]">
              {candidate.photoUrl ? (
                  <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="h-full w-full object-cover"
                  />
              ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--app-muted)]">
                    Sin foto
                  </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--app-ink)] group-hover:text-[var(--app-accent-strong)]">
                {candidate.name}
              </h3>

              <div className="mt-2 space-y-1 text-sm text-[var(--app-muted)]">
                {candidate.party ? (
                    <p>
                      <span className="font-medium">Partido:</span> {candidate.party}
                    </p>
                ) : null}
                {candidate.origin ? (
                    <p>
                      <span className="font-medium">Origen:</span> {candidate.origin}
                    </p>
                ) : null}
                {candidate.age ? (
                    <p>
                      <span className="font-medium">Edad:</span> {candidate.age}
                    </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--app-accent-strong)]">
              <span>Ver perfil completo</span>
              <span className="transition group-hover:translate-x-1">→</span>
            </div>

            {/* Botón reportar (sin navegar) */}
            <button
                type="button"
                className="rounded-full border border-[color:var(--app-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--app-ink)] transition hover:border-[color:var(--app-accent)] hover:text-[var(--app-accent-strong)]"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setOpenReport(true)
                }}
            >
              Reportar
            </button>
          </div>
        </Link>

        <ReportModal
            open={openReport}
            onClose={() => setOpenReport(false)}
            itemType="candidate"
            itemId={candidate.id}
            electionId={electionId}
        />
      </>
  )
}

export default CandidateCard
