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
import PartnersListPage from "./pages/partners/partners-list-page";
import PartnerCreatePage from "./pages/partners/partner-create-page";
import PartnerEditPage from "./pages/partners/partner-edit-page";
import PartnerDetailPage from "./pages/partners/partner-detail-page";
import AssetsListPage from "./pages/assets/assets-list-page";
import AssetCreatePage from "./pages/assets/asset-create-page";
import AssetEditPage from "./pages/assets/asset-edit-page";
import AssetDetailPage from "./pages/assets/asset-detail-page";
import OfficesListPage from "./pages/offices/offices-list-page";
import OfficeCreatePage from "./pages/offices/office-create-page";
import OfficeEditPage from "./pages/offices/office-edit-page";
import OfficeDetailPage from "./pages/offices/office-detail-page";
import BackupsListPage from "./pages/backups/backups-list-page";
import BackupCreatePage from "./pages/backups/backup-create-page";
import BackupDetailPage from "./pages/backups/backup-detail-page";
import NotificationsListPage from "./pages/notifications/notifications-list-page";
import NotificationCreatePage from "./pages/notifications/notification-create-page";
import NotificationEditPage from "./pages/notifications/notification-edit-page";
import NotificationDetailPage from "./pages/notifications/notification-detail-page";
import NotificationSubscribersListPage from "./pages/notification-subscribers/notification-subscribers-list-page";
import NotificationSubscriberCreatePage from "./pages/notification-subscribers/notification-subscriber-create-page";
import NotificationSubscriberDetailPage from "./pages/notification-subscribers/notification-subscriber-detail-page";
import ComponentTypesListPage from "./pages/component-types/component-types-list-page";
import ComponentTypeCreatePage from "./pages/component-types/component-type-create-page";
import ComponentTypeEditPage from "./pages/component-types/component-type-edit-page";
import ComponentTypeDetailPage from "./pages/component-types/component-type-detail-page";
import ComponentsListPage from "./pages/components/components-list-page";
import ComponentCreatePage from "./pages/components/component-create-page";
import ComponentEditPage from "./pages/components/component-edit-page";
import ComponentDetailPage from "./pages/components/component-detail-page";


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
								<Route path="/partners" element={<PartnersListPage />} />
								<Route path="/partners/create" element={<PartnerCreatePage />} />
								<Route path="/partners/edit/:id" element={<PartnerEditPage />} />
								<Route path="/partners/detail/:id" element={<PartnerDetailPage />} />
								<Route path="/assets" element={<AssetsListPage />} />
								<Route path="/assets/create" element={<AssetCreatePage />} />
								<Route path="/assets/edit/:id" element={<AssetEditPage />} />
								<Route path="/assets/detail/:id" element={<AssetDetailPage />} />
								<Route path="/offices" element={<OfficesListPage />} />
								<Route path="/offices/create" element={<OfficeCreatePage />} />
								<Route path="/offices/edit/:id" element={<OfficeEditPage />} />
								<Route path="/offices/detail/:id" element={<OfficeDetailPage />} />
								<Route path="/backups" element={<BackupsListPage />} />
								<Route path="/backups/create" element={<BackupCreatePage />} />
								<Route path="/backups/detail/:id" element={<BackupDetailPage />} />
								<Route path="/notifications" element={<NotificationsListPage />} />
								<Route path="/notifications/create" element={<NotificationCreatePage />} />
								<Route path="/notifications/edit/:id" element={<NotificationEditPage />} />
								<Route path="/notifications/detail/:id" element={<NotificationDetailPage />} />
								<Route path="/notification-subscribers" element={<NotificationSubscribersListPage />} />
								<Route path="/notification-subscribers/create" element={<NotificationSubscriberCreatePage />} />
								<Route path="/notification-subscribers/detail/:id" element={<NotificationSubscriberDetailPage />} />
								<Route path="/component-types" element={<ComponentTypesListPage />} />
								<Route path="/component-types/create" element={<ComponentTypeCreatePage />} />
								<Route path="/component-types/edit/:id" element={<ComponentTypeEditPage />} />
								<Route path="/component-types/detail/:id" element={<ComponentTypeDetailPage />} />
								<Route path="/components" element={<ComponentsListPage />} />
								<Route path="/components/create" element={<ComponentCreatePage />} />
								<Route path="/components/edit/:id" element={<ComponentEditPage />} />
								<Route path="/components/detail/:id" element={<ComponentDetailPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</LoginProvider>
		</QueryProvider>
	);
}

export default App;
