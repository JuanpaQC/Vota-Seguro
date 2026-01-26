import apiClient from '../../../services/api/client.js'

export async function listCandidates({ electionId } = {}) {
  const params = {}
  if (electionId) {
    params.electionId = electionId
  }

  const response = await apiClient.get('/candidates', {
    params: Object.keys(params).length ? params : undefined,
  })
  return response.data
}

export async function getCandidate(id) {
  const response = await apiClient.get(`/candidates/${id}`)
  return response.data
}

export async function updateCandidate(id, payload) {
  const response = await apiClient.patch(`/candidates/${id}`, payload)
  return response.data
}

export async function deleteCandidate(id) {
  const response = await apiClient.delete(`/candidates/${id}`)
  return response.data
}
