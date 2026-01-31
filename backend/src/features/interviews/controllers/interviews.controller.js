import { asyncHandler } from '../../../middleware/asyncHandler.js'
import {
  createInterview,
  deleteInterview,
  getInterviewById,
  listInterviews,
  updateInterview,
} from '../services/interviews.service.js'

export const listInterviewsHandler = asyncHandler(async (req, res) => {
  const interviews = await listInterviews({
    electionId: req.query.electionId,
    candidateId: req.query.candidateId,
  })
  res.json(interviews)
})

export const getInterviewHandler = asyncHandler(async (req, res) => {
  const interview = await getInterviewById(req.params.id)
  res.json(interview)
})

export const createInterviewHandler = asyncHandler(async (req, res) => {
  const interview = await createInterview(req.body)
  res.status(201).json(interview)
})

export const updateInterviewHandler = asyncHandler(async (req, res) => {
  const interview = await updateInterview(req.params.id, req.body)
  res.json(interview)
})

export const deleteInterviewHandler = asyncHandler(async (req, res) => {
  const result = await deleteInterview(req.params.id)
  res.json(result)
})
