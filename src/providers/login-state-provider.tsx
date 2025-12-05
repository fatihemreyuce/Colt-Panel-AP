import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoginContext } from "@/contexts/login-context";
import { refreshTokens } from "@/utils/fetch-client";
import { hasAccessToken, setAccessToken } from "@/utils/token-manager";
import { login, logout } from "@/services/auth-services";
import type { LoginRequest } from "@/types/auth.types";
import { useQueryClient } from "@tanstack/react-query";

export interface LoginContextType {
	isLoggedIn: boolean;
	login: (request: LoginRequest) => Promise<void>;
	logout: () => Promise<void>;
	isActionable: boolean;
	isLoading: boolean;
}

export const LoginProvider = ({ children }: { children: ReactNode }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isStarted, setIsStarted] = useState(false);
	const queryClient = useQueryClient();

	const effectRan = useRef(false);

	const isActionable = isStarted && !isLoading;

	const setTimer = useCallback(() => {
		const timer = setTimeout(async () => {
			await refreshTokens();
		}, 1000 * 60 * 12);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		setIsStarted(true);
		if (effectRan.current) return;
		effectRan.current = true;

		const refreshTokenFn = async () => {
			setIsLoading(true);

			await refreshTokens();
			const isLoggedIn = hasAccessToken();

			setIsLoggedIn(isLoggedIn);

			if (isLoggedIn) {
				setTimer();
			}

			setIsLoading(false);
		};

		refreshTokenFn();
	}, [setTimer]);

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await logout();

			setAccessToken(null);
			setIsLoggedIn(false);

			queryClient.removeQueries();
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async (request: LoginRequest) => {
		setIsLoading(true);
		try {
			const response = await login(request);
			if (response.accessToken) {
				setAccessToken(response.accessToken);
				setIsLoggedIn(true);

				await queryClient.invalidateQueries({ queryKey: ["me"] });
			} else {
				setAccessToken(null);
				setIsLoggedIn(false);
			}
		} catch (error) {
			setAccessToken(null);
			setIsLoggedIn(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<LoginContext.Provider
			value={{
				isLoggedIn,
				login: handleLogin,
				logout: handleLogout,
				isActionable,
				isLoading,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};
