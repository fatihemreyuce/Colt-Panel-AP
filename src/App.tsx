import { LoginProvider } from "./providers/login-state-provider";
import QueryProvider from "./providers/query-client-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./providers/protected-route";
import AdminLayout from "./components/admin-layout";
import LoginPage from "./pages/login/login-page";
import DashboardPage from "./pages/dashboard/dashboard-page";
import UsersListPage from "./pages/users/users-list-page";
import UserCreatePage from "./pages/users/user-create-page";
import UserEditPage from "./pages/users/user-edit-page";
import UserDetailPage from "./pages/users/user-detail-page";
import LanguagesListPage from "./pages/languages/languages-list-page";
import LanguageCreatePage from "./pages/languages/language-create-page";
import LanguageEditPage from "./pages/languages/language-edit-page";
import LanguageDetailPage from "./pages/languages/language-detail-page";
import TeamMembersListPage from "./pages/team-members/team-members-list-page";
import TeamMemberCreatePage from "./pages/team-members/team-member-create-page";
import TeamMemberEditPage from "./pages/team-members/team-member-edit-page";
import TeamMemberDetailPage from "./pages/team-members/team-member-detail-page";
import EcoPartnersListPage from "./pages/eco-partners/eco-partners-list-page";
import EcoPartnerCreatePage from "./pages/eco-partners/eco-partner-create-page";
import EcoPartnerEditPage from "./pages/eco-partners/eco-partner-edit-page";
import EcoPartnerDetailPage from "./pages/eco-partners/eco-partner-detail-page";


function App() {
	return (
		<QueryProvider>
			<LoginProvider>
				<BrowserRouter>
					<Toaster />
					<Routes>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/" element={<ProtectedRoute />}>
							<Route path="/" element={<AdminLayout />}>
								<Route path="/" element={<DashboardPage />} />
								<Route path="/users" element={<UsersListPage />} />
								<Route path="/users/create" element={<UserCreatePage />} />
								<Route path="/users/edit/:id" element={<UserEditPage />} />
								<Route path="/users/detail/:id" element={<UserDetailPage />} />
								<Route path="/languages" element={<LanguagesListPage />} />
								<Route path="/languages/create" element={<LanguageCreatePage />} />
								<Route path="/languages/edit/:id" element={<LanguageEditPage />} />
								<Route path="/languages/detail/:id" element={<LanguageDetailPage />} />
								<Route path="/team-members" element={<TeamMembersListPage />} />
								<Route path="/team-members/create" element={<TeamMemberCreatePage />} />
								<Route path="/team-members/edit/:id" element={<TeamMemberEditPage />} />
								<Route path="/team-members/detail/:id" element={<TeamMemberDetailPage />} />
								<Route path="/eco-partners" element={<EcoPartnersListPage />} />
								<Route path="/eco-partners/create" element={<EcoPartnerCreatePage />} />
								<Route path="/eco-partners/edit/:id" element={<EcoPartnerEditPage />} />
								<Route path="/eco-partners/detail/:id" element={<EcoPartnerDetailPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</LoginProvider>
		</QueryProvider>
	);
}

export default App;
