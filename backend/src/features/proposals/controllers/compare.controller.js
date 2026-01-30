import { db } from '../../../config/firebase.js'

export const compareCandidatesHandler = async (req, res) => {
    try {
        const { topic, electionId, candidateIds } = req.body
        // En el front "topic" es el id/valor del tema (ej: "educacion" o "t1")
        const topicValue = topic
        const normalize = (value) =>
            (value ?? '')
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim()

        const matchesElectionId = (value) => {
            if (!value) return false
            if (typeof value === 'string') return value.trim() === electionId
            if (typeof value === 'object' && value.id) return value.id === electionId
            return value.toString?.() === electionId
        }

        const matchesTopic = (proposal) => {
            const target = normalize(topicValue)
            if (!target) return false
            const candidates = [proposal.topic, proposal.type].filter(Boolean)
            return candidates.some((value) => normalize(value).includes(target))
        }

        if (!electionId) {
            return res.status(400).json({ message: 'electionId is required' })
        }

        if (!topicValue) {
            return res.status(400).json({ message: 'topic (topicId) is required' })
        }

        if (!Array.isArray(candidateIds) || candidateIds.length < 1) {
            return res.status(400).json({
                message: 'At least one candidate is required',
            })
        }

        // Obtener info de candidatos desde la colección global "candidates"
        const candidateDocs = await Promise.all(
            candidateIds.map((id) =>
                db.collection('candidates').doc(id).get()
            )
        )

        const candidates = candidateDocs
            .filter((doc) => doc.exists)
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            // Seguridad extra: solo candidatos del proceso de elección actual
            .filter((candidate) => candidate.electionId === electionId)

        // Obtener propuestas desde "proposals" usando keyword (topic/type) y electionId
        const comparison = await Promise.all(
            candidateIds.map(async (candidateId) => {
                const snap = await db
                    .collection('proposals')
                    .where('candidateId', '==', candidateId)
                    .get()

                const proposals = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .filter(
                        (proposal) =>
                            matchesElectionId(proposal.electionId) &&
                            matchesTopic(proposal)
                    )

                if (proposals.length === 0) {
                    return {
                        candidateId,
                        answered: false,
                        proposals: [],
                    }
                }

                return {
                    candidateId,
                    answered: true,
                    proposals,
                }
            })
        )

        return res.json({
            topic: topicValue,
            candidates,
            comparison,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Error comparing candidates',
        })
    }
}
