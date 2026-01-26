import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('reports')

export async function listReports({ status } = {}) {
  let ref = collection
  if (status) {
    ref = ref.where('status', '==', status)
  }

  const snapshot = await ref.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getReportById(id) {
  const doc = await collection.doc(id).get()
  if (!doc.exists) {
    throw httpError(404, 'Report not found')
  }

  return { id: doc.id, ...doc.data() }
}

export async function createReport(payload) {
  const data = {
    status: 'pending',
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await collection.add(data)
  return { id: docRef.id, ...data }
}

export async function updateReport(id, payload) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Report not found')
  }

  await docRef.set({ ...payload, updatedAt: serverTimestamp() }, { merge: true })
  const updated = await docRef.get()
  return { id: updated.id, ...updated.data() }
}

export async function deleteReport(id) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Report not found')
  }

  await docRef.delete()
  return { id }
}
