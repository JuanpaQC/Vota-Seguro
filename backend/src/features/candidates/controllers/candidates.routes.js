import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import {
  createCandidateHandler,
  deleteCandidateHandler,
  getCandidateHandler,
  listCandidatesHandler,
  updateCandidateHandler,
} from './candidates.controller.js'
import {
  candidateCreateSchema,
  candidateUpdateSchema,
} from '../schemas/candidates.schema.js'

const router = Router()

router.get('/', listCandidatesHandler)
router.get('/:id', getCandidateHandler)
router.post('/', validate(candidateCreateSchema), createCandidateHandler)
router.patch('/:id', validate(candidateUpdateSchema), updateCandidateHandler)
router.delete('/:id', deleteCandidateHandler)

export default router
