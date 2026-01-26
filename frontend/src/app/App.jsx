import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import AuthProvider from '../features/auth/context/AuthProvider.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
