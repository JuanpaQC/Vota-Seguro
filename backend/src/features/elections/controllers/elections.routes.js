import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import {
  createElectionHandler,
  deleteElectionHandler,
  getElectionHandler,
  listElectionsHandler,
  updateElectionHandler,
} from './elections.controller.js'
import {
  electionCreateSchema,
  electionUpdateSchema,
} from '../schemas/elections.schema.js'

const router = Router()

router.get('/', listElectionsHandler)
router.get('/:id', getElectionHandler)
router.post('/', validate(electionCreateSchema), createElectionHandler)
router.patch('/:id', validate(electionUpdateSchema), updateElectionHandler)
router.delete('/:id', deleteElectionHandler)

export default router
