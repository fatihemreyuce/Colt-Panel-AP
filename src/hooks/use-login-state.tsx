import { useContext } from "react";
import { LoginContext } from "@/contexts/login-context";

export const useLoginState = () => {
	const context = useContext(LoginContext);
	if (context === undefined) {
		throw new Error("useLogin must be used within a LoginProvider");
	}
	return context;
};
