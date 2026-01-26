import { db, serverTimestamp } from '../../../config/firebase.js'
import { httpError } from '../../../utils/httpError.js'

const collection = db.collection('elections')

async function deleteByQuery(query) {
  let snapshot = await query.limit(500).get()
  while (!snapshot.empty) {
    const batch = db.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    snapshot = await query.limit(500).get()
  }
}

export async function listElections({ isActive } = {}) {
  let ref = collection
  if (typeof isActive === 'boolean') {
    ref = ref.where('isActive', '==', isActive)
  }

  const snapshot = await ref.get()
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
  const { candidates = [], ...electionPayload } = payload
  const electionRef = collection.doc()
  const batch = db.batch()
  const timestamp = serverTimestamp()

  batch.set(electionRef, {
    ...electionPayload,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  const createdCandidates = []

  for (const candidate of candidates) {
    const { proposals = [], ...candidatePayload } = candidate
    const candidateRef = db.collection('candidates').doc()
    const candidateTimestamp = serverTimestamp()

    batch.set(candidateRef, {
      ...candidatePayload,
      electionId: electionRef.id,
      createdAt: candidateTimestamp,
      updatedAt: candidateTimestamp,
    })

    const createdProposals = []
    for (const proposal of proposals) {
      const proposalRef = db.collection('proposals').doc()
      const proposalTimestamp = serverTimestamp()

      batch.set(proposalRef, {
        ...proposal,
        electionId: electionRef.id,
        candidateId: candidateRef.id,
        createdAt: proposalTimestamp,
        updatedAt: proposalTimestamp,
      })

      createdProposals.push({ id: proposalRef.id, ...proposal })
    }

    createdCandidates.push({
      id: candidateRef.id,
      ...candidatePayload,
      electionId: electionRef.id,
      proposals: createdProposals,
    })
  }

  await batch.commit()
  return { id: electionRef.id, ...electionPayload, candidates: createdCandidates }
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

  await deleteByQuery(db.collection('proposals').where('electionId', '==', id))
  await deleteByQuery(db.collection('candidates').where('electionId', '==', id))

  await docRef.delete()
  return { id }
}
