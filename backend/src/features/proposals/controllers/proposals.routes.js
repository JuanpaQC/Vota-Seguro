import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import {
  createProposalHandler,
  deleteProposalHandler,
  getProposalHandler,
  listProposalsHandler,
  updateProposalHandler,
} from './proposals.controller.js'
import {
  proposalCreateSchema,
  proposalUpdateSchema,
} from '../schemas/proposals.schema.js'

const router = Router()

router.get('/', listProposalsHandler)
router.get('/:id', getProposalHandler)
router.post('/', validate(proposalCreateSchema), createProposalHandler)
router.patch('/:id', validate(proposalUpdateSchema), updateProposalHandler)
router.delete('/:id', deleteProposalHandler)

export default router
