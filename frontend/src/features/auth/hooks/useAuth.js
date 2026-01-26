import { useContext } from 'react'
import AuthContext from '../context/authContext.js'

function useAuth() {
  return useContext(AuthContext)
}

export default useAuth
