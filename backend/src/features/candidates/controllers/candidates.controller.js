import { asyncHandler } from '../../../middleware/asyncHandler.js'
import {
  createCandidate,
  deleteCandidate,
  getCandidateById,
  listCandidates,
  updateCandidate,
} from '../services/candidates.service.js'

export const listCandidatesHandler = asyncHandler(async (req, res) => {
  const candidates = await listCandidates({
    electionId: req.query.electionId,
  })
  res.json(candidates)
})

export const getCandidateHandler = asyncHandler(async (req, res) => {
  const candidate = await getCandidateById(req.params.id)
  res.json(candidate)
})

export const createCandidateHandler = asyncHandler(async (req, res) => {
  const candidate = await createCandidate(req.body)
  res.status(201).json(candidate)
})

export const updateCandidateHandler = asyncHandler(async (req, res) => {
  const candidate = await updateCandidate(req.params.id, req.body)
  res.json(candidate)
})

export const deleteCandidateHandler = asyncHandler(async (req, res) => {
  await deleteCandidate(req.params.id)
  res.status(204).send()
})
