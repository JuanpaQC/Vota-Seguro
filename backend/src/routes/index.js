import { Router } from 'express'
import electionsRoutes from '../features/elections/controllers/elections.routes.js'
import candidatesRoutes from '../features/candidates/controllers/candidates.routes.js'
import proposalsRoutes from '../features/proposals/controllers/proposals.routes.js'
import reportsRoutes from '../features/reports/controllers/reports.routes.js'

const router = Router()

router.use('/elections', electionsRoutes)
router.use('/candidates', candidatesRoutes)
router.use('/proposals', proposalsRoutes)
router.use('/reports', reportsRoutes)

export default router
