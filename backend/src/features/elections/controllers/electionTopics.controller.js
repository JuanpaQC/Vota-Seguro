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

        // 3) Normalizar la salida para UI (dropdown)
        const topics = topicsSnap.docs.map((doc) => {
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

        // 4) Responder
        return res.json({ topics })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error loading topics' })
    }
}
