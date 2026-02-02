import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import AuthProvider from '../features/auth/context/AuthProvider.jsx'
import { AccessibilityProvider } from '../context/AccessibilityContext.jsx'
import { TextToSpeechProvider } from '../context/TextToSpeechContext.jsx'

function App() {
  return (
    <AccessibilityProvider>
      <TextToSpeechProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TextToSpeechProvider>
    </AccessibilityProvider>
  )
}

export default App
