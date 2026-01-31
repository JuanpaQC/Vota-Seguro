import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('interviews')

export async function listInterviews({ electionId, candidateId } = {}) {
  let ref = collection
  if (electionId) {
    ref = ref.where('electionId', '==', electionId)
  }
  if (candidateId) {
    ref = ref.where('candidateId', '==', candidateId)
  }

  const snapshot = await ref.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getInterviewById(id) {
  const doc = await collection.doc(id).get()
  if (!doc.exists) {
    throw httpError(404, 'Interview not found')
  }

  return { id: doc.id, ...doc.data() }
}

export async function createInterview(payload) {
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await collection.add(data)
  return { id: docRef.id, ...payload }
}

export async function updateInterview(id, payload) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Interview not found')
  }

  await docRef.set({ ...payload, updatedAt: serverTimestamp() }, { merge: true })
  const updated = await docRef.get()
  return { id: updated.id, ...updated.data() }
}

export async function deleteInterview(id) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Interview not found')
  }

  await docRef.delete()
  return { id }
}
