import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('proposals')

export async function listProposals({ electionId, candidateId, topic } = {}) {
  let ref = collection
  if (electionId) {
    ref = ref.where('electionId', '==', electionId)
  }
  if (candidateId) {
    ref = ref.where('candidateId', '==', candidateId)
  }
  if (topic) {
    ref = ref.where('topic', '==', topic)
  }

  const snapshot = await ref.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getProposalById(id) {
  const doc = await collection.doc(id).get()
  if (!doc.exists) {
    throw httpError(404, 'Proposal not found')
  }

  return { id: doc.id, ...doc.data() }
}

export async function createProposal(payload) {
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await collection.add(data)
  return { id: docRef.id, ...payload }
}

export async function updateProposal(id, payload) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Proposal not found')
  }

  await docRef.set({ ...payload, updatedAt: serverTimestamp() }, { merge: true })
  const updated = await docRef.get()
  return { id: updated.id, ...updated.data() }
}

export async function deleteProposal(id) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Proposal not found')
  }

  await docRef.delete()
  return { id }
}
