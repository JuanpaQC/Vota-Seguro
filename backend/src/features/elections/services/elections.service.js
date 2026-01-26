import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('elections')

export async function listElections() {
  const snapshot = await collection.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getElectionById(id) {
  const doc = await collection.doc(id).get()
  if (!doc.exists) {
    throw httpError(404, 'Election not found')
  }

  return { id: doc.id, ...doc.data() }
}

export async function createElection(payload) {
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await collection.add(data)
  return { id: docRef.id, ...payload }
}

export async function updateElection(id, payload) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Election not found')
  }

  await docRef.set({ ...payload, updatedAt: serverTimestamp() }, { merge: true })
  const updated = await docRef.get()
  return { id: updated.id, ...updated.data() }
}

export async function deleteElection(id) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Election not found')
  }

  await docRef.delete()
  return { id }
}
