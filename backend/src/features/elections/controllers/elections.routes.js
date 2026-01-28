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
import { listElectionTopicsHandler } from './electionTopics.controller.js'


const router = Router()

router.get('/', listElectionsHandler)
router.get('/:id', getElectionHandler)
router.post('/', validate(electionCreateSchema), createElectionHandler)
router.patch('/:id', validate(electionUpdateSchema), updateElectionHandler)
router.delete('/:id', deleteElectionHandler)
/**
 * GET /api/elections/:id/topics
 * Devuelve los temas registrados en elections/{id}/topics
 * para poblar el selector de temas en la pantalla de comparación.
 */
router.get('/:id/topics', listElectionTopicsHandler)

export default router
