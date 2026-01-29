import { db } from '../../../config/firebase.js'

export const compareCandidatesHandler = async (req, res) => {
    try {
        const { topic, electionId, candidateIds } = req.body
        // En tu front "topic" realmente es el topicId (ej: "t1")
        const topicId = topic

        if (!electionId) {
            return res.status(400).json({ message: 'electionId is required' })
        }

        if (!topicId) {
            return res.status(400).json({ message: 'topic (topicId) is required' })
        }

        if (!Array.isArray(candidateIds) || candidateIds.length < 2) {
            return res.status(400).json({
                message: 'At least two candidates are required',
            })
        }

        // Obtener info de candidatos desde elections/{electionId}/candidatesSub
        const candidateDocs = await Promise.all(
            candidateIds.map((id) =>
                db
                    .collection('elections')
                    .doc(electionId)
                    .collection('candidatesSub')
                    .doc(id)
                    .get()
            )
        )

        const candidates = candidateDocs
            .filter((doc) => doc.exists)
            .map((doc) => ({ id: doc.id, ...doc.data() }))

        // Obtener opiniones desde elections/{electionId}/opinions filtrando por topicId
        const comparison = await Promise.all(
            candidateIds.map(async (candidateId) => {
                const ref = db
                    .collection('elections')
                    .doc(electionId)
                    .collection('opinions')
                    .where('candidateId', '==', candidateId)
                    .where('topicId', '==', topicId)

                const snap = await ref.get()

                if (snap.empty) {
                    return {
                        candidateId,
                        answered: false,
                        proposals: [],
                    }
                }

                return {
                    candidateId,
                    answered: true,
                    proposals: snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data(),
                    })),
                }
            })
        )

        return res.json({
            topic: topicId,
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
