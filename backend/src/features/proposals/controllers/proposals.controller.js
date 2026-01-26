import { asyncHandler } from '../../../middleware/asyncHandler.js'
import {
  createProposal,
  deleteProposal,
  getProposalById,
  listProposals,
  updateProposal,
} from '../services/proposals.service.js'

export const listProposalsHandler = asyncHandler(async (req, res) => {
  const proposals = await listProposals({
    electionId: req.query.electionId,
    candidateId: req.query.candidateId,
    topic: req.query.topic,
  })
  res.json(proposals)
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
