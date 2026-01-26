import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ElectionListPage from '../features/elections/pages/ElectionListPage.jsx'
import OrganizerLoginPage from '../features/auth/pages/OrganizerLoginPage.jsx'
import OrganizerDashboardPage from '../features/auth/pages/OrganizerDashboardPage.jsx'
import OrganizerProtectedRoute from '../features/auth/routes/OrganizerProtectedRoute.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<ElectionListPage />} />
        <Route path="organizers" element={<OrganizerProtectedRoute />}>
          <Route index element={<OrganizerDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="organizers/login" element={<OrganizerLoginPage />} />
    </Routes>
  )
}

export default AppRoutes
