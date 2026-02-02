import apiClient from '../../../services/api/client.js'

export async function createReport(payload) {
    const response = await apiClient.post('/reports', payload)
    return response.data
}

export async function listReports(params) {
    const response = await apiClient.get('/reports', { params })
    return response.data
}

export async function getReport(id) {
    const response = await apiClient.get(`/reports/${id}`)
    return response.data
}

export async function updateReport(id, payload) {
    const response = await apiClient.patch(`/reports/${id}`, payload)
    return response.data
}

export async function deleteReport(id) {
    const response = await apiClient.delete(`/reports/${id}`)
    return response.data
}
