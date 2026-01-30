import { asyncHandler } from '../../../middleware/asyncHandler.js'
import { db } from '../../../config/firebase.js'
import {
  createProposal,
  deleteProposal,
  getProposalById,
  listProposals,
  updateProposal,
} from '../services/proposals.service.js'

const normalize = (value) =>
  (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const extractId = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.id) return value.id
  return value.toString?.() ?? null
}

export const listProposalsHandler = asyncHandler(async (req, res) => {
  const proposals = await listProposals({
    electionId: req.query.electionId,
    candidateId: req.query.candidateId,
    topic: req.query.topic,
  })
  res.json(proposals)
})

export const searchProposalsHandler = asyncHandler(async (req, res) => {
  const rawQuery = (req.query.q ?? req.query.query ?? '').toString().trim()
  const electionId = req.query.electionId

  if (!rawQuery) {
    return res.json({ results: [] })
  }

  const tokens = normalize(rawQuery).split(/\s+/).filter(Boolean)
  const proposals = await listProposals({
    electionId,
  })

  const matches = proposals.filter((proposal) => {
    const haystack = normalize(
      [
        proposal.title,
        proposal.summary,
        proposal.detail,
        proposal.topic,
        proposal.type,
      ].join(' ')
    )
    return tokens.every((token) => haystack.includes(token))
  })

  const candidateIds = [
    ...new Set(matches.map((proposal) => extractId(proposal.candidateId))),
  ].filter(Boolean)

  const candidateDocs = await Promise.all(
    candidateIds.map((id) => db.collection('candidates').doc(id).get())
  )
  const candidateMap = new Map(
    candidateDocs
      .filter((doc) => doc.exists)
      .map((doc) => [doc.id, { id: doc.id, ...doc.data() }])
  )

  const results = matches.map((proposal) => {
    const candidateId = extractId(proposal.candidateId)
    return {
      proposal,
      candidate: candidateId ? candidateMap.get(candidateId) ?? null : null,
      topic: proposal.topic ?? proposal.type ?? null,
    }
  })

  res.json({ results })
})

export const getProposalHandler = asyncHandler(async (req, res) => {
  const proposal = await getProposalById(req.params.id)
  res.json(proposal)
})

export const createProposalHandler = asyncHandler(async (req, res) => {
  const proposal = await createProposal(req.body)
  res.status(201).json(proposal)
})

export const updateProposalHandler = asyncHandler(async (req, res) => {
  const proposal = await updateProposal(req.params.id, req.body)
  res.json(proposal)
})

export const deleteProposalHandler = asyncHandler(async (req, res) => {
  await deleteProposal(req.params.id)
  res.status(204).send()
})
