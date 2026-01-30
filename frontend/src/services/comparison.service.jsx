import apiClient from './api/client.js'

/**
 * Obtiene los temas (topics) asociados a una elección.
 * Endpoint: GET /elections/:electionId/topics
 *
 * Parámetros:
 * - electionId: id de la elección (string)
 *
 * Retorna:
 * - res.data (normalmente { topics: [...] })
 */
export async function getElectionTopics(electionId) {
    const res = await apiClient.get(`/elections/${electionId}/topics`)
    return res.data
}

/**
 * Obtiene los candidatos asociados a una elección desde la colección global candidates.
 * Endpoint: GET /candidates?electionId=...
 *
 * Parámetros:
 * - electionId: id de la elección (string)
 *
 * Normalización:
 * - Si el backend devuelve un array directo, se convierte a { candidates: array }.
 * - Si el backend devuelve { candidates: [...] }, se respeta.
 * - Si no viene candidates, se retorna { candidates: [] }.
 *
 * Retorna:
 * - { candidates: [...] }
 */
export async function getCandidates(electionId) {
    const res = await apiClient.get('/candidates', {
        params: electionId ? { electionId } : undefined,
    })
    const data = res.data

    // Caso: backend devuelve un array directamente
    if (Array.isArray(data)) return { candidates: data }

    // Caso: backend devuelve un objeto con la propiedad candidates
    return { candidates: data?.candidates ?? [] }
}

/**
 * Ejecuta la comparación de candidaturas para un tema específico.
 * Endpoint: POST /proposals/compare
 *
 * Parámetros (objeto):
 * - topicValue: id del tema (por ejemplo "t1")
 * - electionId: id de la elección
 * - candidateIds: lista de ids de candidatos a comparar (ej: ["c1","c2"])
 *
 * Body enviado al backend:
 * - topic: topicValue (se envía como id del tema)
 * - electionId
 * - candidateIds
 *
 * Retorna:
 * - res.data (estructura de comparación)
 */
export async function compareCandidates({ topicValue, electionId, candidateIds }) {
    const res = await apiClient.post('/proposals/compare', {
        topic: topicValue, // se envía el topicId (ej: "t1")
        electionId,
        candidateIds,
    })
    return res.data
}
