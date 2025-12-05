import { Navigate, Outlet } from "react-router";
import { useLoginState } from "@/hooks/use-login-state";

export default function ProtectedRoute() {
	const { isLoggedIn, isActionable } = useLoginState();

	if (!isLoggedIn && isActionable) {
		return <Navigate to="/login" />;
	}

	return <Outlet />;
}
