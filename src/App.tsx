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
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</LoginProvider>
		</QueryProvider>
	);
}

export default App;
