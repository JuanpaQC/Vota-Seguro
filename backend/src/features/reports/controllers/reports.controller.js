import { asyncHandler } from '../../../middleware/asyncHandler.js'
import {
  createReport,
  deleteReport,
  getReportById,
  listReports,
  updateReport,
} from '../services/reports.service.js'

export const listReportsHandler = asyncHandler(async (req, res) => {
  const reports = await listReports({ status: req.query.status })
  res.json(reports)
})

export const getReportHandler = asyncHandler(async (req, res) => {
  const report = await getReportById(req.params.id)
  res.json(report)
})

export const createReportHandler = asyncHandler(async (req, res) => {
  const report = await createReport(req.body)
  res.status(201).json(report)
})

export const updateReportHandler = asyncHandler(async (req, res) => {
  const report = await updateReport(req.params.id, req.body)
  res.json(report)
})

export const deleteReportHandler = asyncHandler(async (req, res) => {
  await deleteReport(req.params.id)
  res.status(204).send()
})
