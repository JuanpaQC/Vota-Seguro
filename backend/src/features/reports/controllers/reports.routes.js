import { Router } from 'express'
import { validate } from '../../../middleware/validate.js'
import {
  createReportHandler,
  deleteReportHandler,
  getReportHandler,
  listReportsHandler,
  updateReportHandler,
} from './reports.controller.js'
import { reportCreateSchema, reportUpdateSchema } from '../schemas/reports.schema.js'

const router = Router()

router.get('/', listReportsHandler)
router.get('/:id', getReportHandler)
router.post('/', validate(reportCreateSchema), createReportHandler)
router.patch('/:id', validate(reportUpdateSchema), updateReportHandler)
router.delete('/:id', deleteReportHandler)

export default router
