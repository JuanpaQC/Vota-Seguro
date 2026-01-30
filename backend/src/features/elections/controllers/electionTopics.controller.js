import { db } from '../../../config/firebase.js'

/**
 * Handler: listElectionTopicsHandler
 * ---------------------------------
 * Devuelve la lista de temas ("topics") disponibles para una elección.
 *
 * Origen de datos:
 * - Subcolección: elections/{electionId}/topics
 *
 * ¿Para qué sirve?
 * - Para que el frontend muestre un dropdown de temas y el usuario NO tenga que
 *   escribir el tema manualmente.
 *
 * Respuesta (200):
 * {
 *   topics: [
 *     { id, ...data, label, value },
 *     ...
 *   ]
 * }
 *
 */
export const listElectionTopicsHandler = async (req, res) => {
    try {
        const { id: electionId } = req.params
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

        // 1) Validación: la elección debe existir
        //    (evita consultar topics de una elección inexistente)
        const electionDoc = await db.collection('elections').doc(electionId).get()
        if (!electionDoc.exists) {
            return res.status(404).json({ message: 'Election not found' })
        }

        // 2) Consultar la subcolección topics de esa elección
        const topicsSnap = await db
            .collection('elections')
            .doc(electionId)
            .collection('topics')
            .get()

        let topics = []

        if (!topicsSnap.empty) {
            // 3) Normalizar la salida para UI (dropdown)
            topics = topicsSnap.docs.map((doc) => {
                const data = doc.data()

                return {
                    id: doc.id,
                    ...data,

                    // label: lo que se muestra en el select
                    // prioridad: title > name > id
                    label: data.title ?? data.name ?? doc.id,

                    // value: lo que enviamos al backend al comparar (estable)
                    value: doc.id,
                }
            })
        } else {
            // 3b) Fallback: si no hay topics configurados, derivar desde proposals
            const proposalsSnap = await db
                .collection('proposals')
                .where('electionId', '==', electionId)
                .get()

            const seen = new Set()
            const pushTopic = (raw) => {
                const label = raw.toString().trim()
                const key = normalize(label)
                if (!key || seen.has(key)) return
                seen.add(key)
                topics.push({
                    id: label,
                    label,
                    value: label,
                })
            }

            topics = []
            let docs = proposalsSnap.docs

            if (docs.length === 0) {
                const allProposalsSnap = await db.collection('proposals').get()
                docs = allProposalsSnap.docs.filter((doc) =>
                    matchesElectionId(doc.data()?.electionId)
                )
            }

            docs.forEach((doc) => {
                const data = doc.data()
                const raw = data.topic ?? data.type
                if (!raw) return
                pushTopic(raw)
            })
        }

        // 4) Responder
        return res.json({ topics })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error loading topics' })
    }
}
