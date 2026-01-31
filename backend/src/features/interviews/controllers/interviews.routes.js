import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import {
  createInterviewHandler,
  deleteInterviewHandler,
  getInterviewHandler,
  listInterviewsHandler,
  updateInterviewHandler,
} from './interviews.controller.js'
import {
  interviewCreateSchema,
  interviewUpdateSchema,
} from '../schemas/interviews.schema.js'

const router = Router()

router.get('/', listInterviewsHandler)
router.get('/:id', getInterviewHandler)
router.post('/', validate(interviewCreateSchema), createInterviewHandler)
router.patch('/:id', validate(interviewUpdateSchema), updateInterviewHandler)
router.delete('/:id', deleteInterviewHandler)

export default router
