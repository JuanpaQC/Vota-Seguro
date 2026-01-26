import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../../services/firebase/client.js'

async function signInOrganizer(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

async function signOutOrganizer() {
  return signOut(auth)
}

export { signInOrganizer, signOutOrganizer }
