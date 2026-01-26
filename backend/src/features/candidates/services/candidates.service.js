import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('candidates')

export async function listCandidates({ electionId } = {}) {
  let ref = collection
  if (electionId) {
    ref = ref.where('electionId', '==', electionId)
  }

  const snapshot = await ref.get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getCandidateById(id) {
  const doc = await collection.doc(id).get()
  if (!doc.exists) {
    throw httpError(404, 'Candidate not found')
  }

  return { id: doc.id, ...doc.data() }
}

export async function createCandidate(payload) {
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await collection.add(data)
  return { id: docRef.id, ...payload }
}

export async function updateCandidate(id, payload) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Candidate not found')
  }

  await docRef.set({ ...payload, updatedAt: serverTimestamp() }, { merge: true })
  const updated = await docRef.get()
  return { id: updated.id, ...updated.data() }
}

export async function deleteCandidate(id) {
  const docRef = collection.doc(id)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw httpError(404, 'Candidate not found')
  }

  const proposalsSnapshot = await db
    .collection('proposals')
    .where('candidateId', '==', id)
    .get()
  if (!proposalsSnapshot.empty) {
    const batch = db.batch()
    proposalsSnapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  await docRef.delete()
  return { id }
}
