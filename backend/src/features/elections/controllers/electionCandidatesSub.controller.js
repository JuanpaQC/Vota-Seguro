import { db } from '../../../config/firebase.js' // Importa la instancia de Firestore configurada en el backend.

/**
 * listElectionCandidatesSubHandler
 * -------------------------------
 * Handler HTTP que devuelve los candidatos asociados a una elección,
 * consultándolos desde la subcolección:
 *   elections/{electionId}/candidatesSub
 *
 * Endpoint típico donde se usa:
 *   GET /elections/:id/candidatesSub
 *
 * Entrada:
 * - req.params.id: id de la elección (electionId)
 *
 * Salida:
 * - 200: { candidates: [...] } donde cada candidato incluye:
 *   - id: id del documento en candidatesSub (por ejemplo "c1")
 *   - ...doc.data(): campos del candidato (name, party, age, etc.)
 *
 * Errores:
 * - 500: { error: 'Error obteniendo candidatesSub' } si falla la lectura en Firestore.
 */
export async function listElectionCandidatesSubHandler(req, res) {
    try {
        // Obtiene el id de la elección desde los parámetros de la ruta.
        // Ejemplo: /elections/Ln3SVw.../candidatesSub -> id = "Ln3SVw..."
        const { id } = req.params

        // Consulta la subcolección de candidatos dentro de la elección.
        // Ruta Firestore:
        // elections/{id}/candidatesSub
        const snap = await db
            .collection('elections')
            .doc(id)
            .collection('candidatesSub')
            .get()

        // Convierte los documentos a objetos planos:
        // - id: doc.id para conservar el identificador del documento
        // - ...doc.data(): resto de campos guardados en Firestore
        const candidates = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))

        // Devuelve los candidatos en un wrapper { candidates: [...] }
        // para que el frontend tenga un formato consistente.
        return res.json({ candidates })
    } catch (err) {
        // Registra el error en consola para depuración.
        console.error(err)

        // Devuelve un error 500 si falló la consulta a Firestore.
        return res.status(500).json({ error: 'Error obteniendo candidatesSub' })
    }
}
