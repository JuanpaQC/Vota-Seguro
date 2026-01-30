import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ElectionListPage from '../features/elections/pages/ElectionListPage.jsx'
import ElectionDetailPage from '../features/elections/pages/ElectionDetailPage.jsx'
import CandidateDetailPage from '../features/candidates/pages/CandidateDetailPage.jsx'
import OrganizerLoginPage from '../features/auth/pages/OrganizerLoginPage.jsx'
import OrganizerDashboardPage from '../features/auth/pages/OrganizerDashboardPage.jsx'
import OrganizerElectionCreatePage from '../features/admin/pages/OrganizerElectionCreatePage.jsx'
import OrganizerElectionEditPage from '../features/admin/pages/OrganizerElectionEditPage.jsx'
import OrganizerCandidateEditPage from '../features/admin/pages/OrganizerCandidateEditPage.jsx'
import OrganizerProposalEditPage from '../features/admin/pages/OrganizerProposalEditPage.jsx'
import OrganizerProtectedRoute from '../features/auth/routes/OrganizerProtectedRoute.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import ComparePage from '../features/comparison/pages/ComparePage.jsx'
import TournamentPage from '../features/comparison/pages/TournamentPage.jsx'
import ProposalSearchPage from '../features/proposals/pages/ProposalSearchPage.jsx'
import ProposalDetailPage from '../features/proposals/pages/ProposalDetailPage.jsx'


function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
            path="elections/:electionId/compare"
            element={<ComparePage />}
        />
        <Route
            path="elections/:electionId/tournament"
            element={<TournamentPage />}
        />
        <Route
            path="elections/:electionId/proposals/search"
            element={<ProposalSearchPage />}
        />
        <Route
            path="elections/:electionId/proposals/:proposalId"
            element={<ProposalDetailPage />}
        />
        <Route index element={<ElectionListPage />} />
        <Route
          path="elections/:electionId/candidates/:candidateId"
          element={<CandidateDetailPage />}
        />
        <Route path="elections/:id" element={<ElectionDetailPage />} />
        <Route path="organizers" element={<OrganizerProtectedRoute />}>
          <Route index element={<OrganizerDashboardPage />} />
          <Route path="elections/new" element={<OrganizerElectionCreatePage />} />
          <Route path="elections/:id/edit" element={<OrganizerElectionEditPage />} />
          <Route path="candidates/:id/edit" element={<OrganizerCandidateEditPage />} />
          <Route path="proposals/:id/edit" element={<OrganizerProposalEditPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="organizers/login" element={<OrganizerLoginPage />} />

    </Routes>
  )
}

export default AppRoutes
