import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import { compareCandidatesHandler } from './compare.controller.js'

import {
  createProposalHandler,
  deleteProposalHandler,
  getProposalHandler,
  listProposalsHandler,
  searchProposalsHandler,
  updateProposalHandler,
} from './proposals.controller.js'
import {
  proposalCreateSchema,
  proposalUpdateSchema,
} from '../schemas/proposals.schema.js'

const router = Router()

router.get('/', listProposalsHandler)
router.get('/search', searchProposalsHandler)
router.get('/:id', getProposalHandler)
router.post('/', validate(proposalCreateSchema), createProposalHandler)
router.patch('/:id', validate(proposalUpdateSchema), updateProposalHandler)
router.delete('/:id', deleteProposalHandler)

// HU-5 Comparar candidaturas
router.post('/compare', compareCandidatesHandler)


export default router
