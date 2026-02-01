import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCandidate } from '../../candidates/services/candidatesService.js'
import { getProposal } from '../services/proposalsService.js'
import SharePanel from '../../../components/SharePanel.jsx'

function ProposalDetailPage() {
  const { electionId, proposalId } = useParams()
  const [proposal, setProposal] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      setError('')
      try {
        const proposalData = await getProposal(proposalId)
        if (!isMounted) return
        setProposal(proposalData)

        const candidateId = proposalData?.candidateId
        if (candidateId) {
          const candidateData = await getCandidate(candidateId)
          if (isMounted) {
            setCandidate(candidateData)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la propuesta seleccionada.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (proposalId) {
      loadData()
    }

    return () => {
      isMounted = false
    }
  }, [proposalId])

  if (loading) {
    return (
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Cargando informacion de la propuesta...
      </section>
    )
  }

  if (error || !proposal) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Propuesta no encontrada.'}
        </div>
        <Link
          to={`/elections/${electionId}`}
          className="inline-flex items-center rounded-full border border-[color:var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-ink)]"
        >
          Volver a la eleccion
        </Link>
      </section>
    )
  }

  const topic = proposal.topic || proposal.type || 'Tema sin definir'
  const proposalTitle = proposal.title || 'Propuesta'
  const candidateName = candidate?.name || 'este candidato'

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <Link
          to={`/elections/${electionId}/proposals/search`}
          className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]"
        >
          {'<- Volver a la busqueda'}
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-muted)]">
            {topic}
          </p>
          <h1 className="text-3xl font-[var(--font-display)] text-[var(--app-ink)]">
            {proposalTitle}
          </h1>
        </div>
      </header>

      <SharePanel
        title={proposalTitle}
        text={`Mira la propuesta ${proposalTitle} de ${candidateName}.`}
        description="Comparte esta propuesta en tus redes sociales."
        label="Compartir propuesta"
      />

      <section className="rounded-3xl border border-[color:var(--app-border)] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[color:var(--app-border)] bg-[var(--app-bg)]">
            {candidate?.photoUrl ? (
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
            <p className="text-lg font-semibold text-[var(--app-ink)]">
              {candidate?.name || proposal.candidateId || 'Candidato'}
            </p>
            <p className="text-sm text-[var(--app-muted)]">
              {candidate?.party || 'Partido no disponible'}
            </p>
          </div>
          {candidate?.id ? (
            <Link
              to={`/elections/${electionId}/candidates/${candidate.id}`}
              className="rounded-full border border-[color:var(--app-border)] px-4 py-2 text-xs font-semibold text-[var(--app-accent-strong)] transition hover:border-[color:var(--app-accent)]"
            >
              Ver perfil
            </Link>
          ) : null}
        </div>

        {proposal.summary ? (
          <p className="mt-5 text-sm leading-relaxed text-[var(--app-muted)]">
            {proposal.summary}
          </p>
        ) : null}

        {proposal.detail ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--app-ink)]">
            {proposal.detail}
          </p>
        ) : null}

        {proposal.sourceUrl ? (
          <a
            href={proposal.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-xs font-semibold text-[var(--app-accent-strong)] transition hover:underline"
          >
            Ver fuente ->
          </a>
        ) : null}
      </section>
    </section>
  )
}

export default ProposalDetailPage
