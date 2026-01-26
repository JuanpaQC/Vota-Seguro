import { asyncHandler } from '../../../middleware/asyncHandler.js'
import {
  createElection,
  deleteElection,
  getElectionById,
  listElections,
  updateElection,
} from '../services/elections.service.js'

export const listElectionsHandler = asyncHandler(async (req, res) => {
  const isActiveQuery = req.query.isActive
  const isActive =
    typeof isActiveQuery === 'string'
      ? isActiveQuery.toLowerCase() === 'true'
        ? true
        : isActiveQuery.toLowerCase() === 'false'
          ? false
          : undefined
      : undefined
  const elections = await listElections({ isActive })
  res.json(elections)
})

export const getElectionHandler = asyncHandler(async (req, res) => {
  const election = await getElectionById(req.params.id)
  res.json(election)
})

export const createElectionHandler = asyncHandler(async (req, res) => {
  const election = await createElection(req.body)
  res.status(201).json(election)
})

export const updateElectionHandler = asyncHandler(async (req, res) => {
  const election = await updateElection(req.params.id, req.body)
  res.json(election)
})

export const deleteElectionHandler = asyncHandler(async (req, res) => {
  await deleteElection(req.params.id)
  res.status(204).send()
})
