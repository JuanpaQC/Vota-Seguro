import apiClient from '../../../services/api/client.js'

export async function listInterviews({ electionId, candidateId } = {}) {
  const params = {}
  if (electionId) {
    params.electionId = electionId
  }
  if (candidateId) {
    params.candidateId = candidateId
  }

  const response = await apiClient.get('/interviews', {
    params: Object.keys(params).length ? params : undefined,
  })
  return response.data
}

export async function createInterview(payload) {
  const response = await apiClient.post('/interviews', payload)
  return response.data
}

export async function getInterview(id) {
  const response = await apiClient.get(`/interviews/${id}`)
  return response.data
}

export async function updateInterview(id, payload) {
  const response = await apiClient.patch(`/interviews/${id}`, payload)
  return response.data
}

export async function deleteInterview(id) {
  const response = await apiClient.delete(`/interviews/${id}`)
  return response.data
}
