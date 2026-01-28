import { Router } from 'express'
import { db } from '../../../config/firebase.js'

const router = Router()

/**
 * HU-5 Comparar candidaturas
 * POST /api/proposals/compare
 */
router.post('/compare', async (req, res) => {
    try {
        const { topic, electionId, candidateIds } = req.body

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' })
        }

        if (!Array.isArray(candidateIds) || candidateIds.length < 2) {
            return res.status(400).json({ message: 'At least 2 candidates required' })
        }

        // Obtener candidatos
        const candidateDocs = await Promise.all(
            candidateIds.map(id => db.collection('candidates').doc(id).get())
        )

        const candidates = candidateDocs
            .filter(doc => doc.exists)
            .map(doc => ({ id: doc.id, ...doc.data() }))

        // Obtener propuestas por candidato y tema
        const comparison = await Promise.all(
            candidateIds.map(async candidateId => {
                let ref = db.collection('proposals')
                    .where('candidateId', '==', candidateId)
                    .where('topic', '==', topic)

                if (electionId) {
                    ref = ref.where('electionId', '==', electionId)
                }

                const snap = await ref.get()

                if (snap.empty) {
                    return {
                        candidateId,
                        answered: false,
                        proposals: []
                    }
                }

                return {
                    candidateId,
                    answered: true,
                    proposals: snap.docs.map(d => ({ id: d.id, ...d.data() }))
                }
            })
        )

        res.json({ topic, candidates, comparison })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error comparing candidates' })
    }
})

export default router
