import apiClient from '../../../services/api/client.js'

export async function listElections({ isActive } = {}) {
  const params = {}
  if (typeof isActive === 'boolean') {
    params.isActive = isActive
  }

  const response = await apiClient.get('/elections', {
    params: Object.keys(params).length ? params : undefined,
  })
  return response.data
}

export async function createElection(payload) {
  const response = await apiClient.post('/elections', payload)
  return response.data
}

export async function getElection(id) {
  const response = await apiClient.get(`/elections/${id}`)
  return response.data
}

export async function updateElection(id, payload) {
  const response = await apiClient.patch(`/elections/${id}`, payload)
  return response.data
}

export async function deleteElection(id) {
  const response = await apiClient.delete(`/elections/${id}`)
  return response.data
}
