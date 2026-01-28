import axios from 'axios'

/**
 * Cliente Axios centralizado para pegarle al backend.
 * La URL viene de VITE_API_URL en frontend/.env
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

/**
 * Obtiene topics de una elección para poblar el dropdown de comparación.
 * Endpoint: GET /elections/:electionId/topics
 */
export async function getElectionTopics(electionId) {
    const res = await api.get(`/elections/${electionId}/topics`)
    return res.data // { topics: [...] }
}

/**
 * Obtiene candidatos para la elección (si tu backend soporta electionId).
 * Si tu endpoint no filtra por electionId, me dices y lo ajustamos.
 */
export async function getCandidates(electionId) {
    const params = electionId ? { electionId } : {}
    const res = await api.get('/candidates', { params })
    return res.data // { candidates: [...] }
}

/**
 * Compara candidaturas por topic.
 * topicValue: usaremos el topicId (value) para que sea estable.
 */
export async function compareCandidates({ topicValue, electionId, candidateIds }) {
    const res = await api.post('/proposals/compare', {
        topic: topicValue,       // enviamos el value (topicId)
        electionId,
        candidateIds,
    })
    return res.data
}
