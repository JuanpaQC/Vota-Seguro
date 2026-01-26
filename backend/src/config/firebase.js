import fs from 'node:fs'
import admin from 'firebase-admin'

function parseServiceAccount(value) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    const decoded = Buffer.from(value, 'base64').toString('utf8')
    return JSON.parse(decoded)
  }
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    return JSON.parse(raw)
  }

  return null
}

const serviceAccount = loadServiceAccount()
const firebaseOptions = serviceAccount
  ? { credential: admin.credential.cert(serviceAccount) }
  : { credential: admin.credential.applicationDefault() }

if (process.env.FIREBASE_PROJECT_ID) {
  firebaseOptions.projectId = process.env.FIREBASE_PROJECT_ID
}

if (!admin.apps.length) {
  admin.initializeApp(firebaseOptions)
}

const db = admin.firestore()
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp

export { admin, db, serverTimestamp }
