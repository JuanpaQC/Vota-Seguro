import { createContext } from 'react'

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
})

export default AuthContext
