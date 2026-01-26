import apiClient from '../../../services/api/client.js'

export async function listProposals({ electionId, candidateId, topic } = {}) {
  const params = {}
  if (electionId) {
    params.electionId = electionId
  }
  if (candidateId) {
    params.candidateId = candidateId
  }
  if (topic) {
    params.topic = topic
  }

  const response = await apiClient.get('/proposals', {
    params: Object.keys(params).length ? params : undefined,
  })
  return response.data
}

export async function createProposal(payload) {
  const response = await apiClient.post('/proposals', payload)
  return response.data
}

export async function getProposal(id) {
  const response = await apiClient.get(`/proposals/${id}`)
  return response.data
}

export async function updateProposal(id, payload) {
  const response = await apiClient.patch(`/proposals/${id}`, payload)
  return response.data
}

export async function deleteProposal(id) {
  const response = await apiClient.delete(`/proposals/${id}`)
  return response.data
}
