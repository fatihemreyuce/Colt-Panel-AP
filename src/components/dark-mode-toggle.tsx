import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface DarkModeToggleProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export default function DarkModeToggle({ className, size = "md" }: DarkModeToggleProps) {
	const [isDark, setIsDark] = useState(() => {
		const stored = localStorage.getItem("theme");
		return stored === "dark";
	});

	useEffect(() => {
		// migrate legacy darkMode flag if present
		const legacyDark = localStorage.getItem("darkMode");
		const stored = localStorage.getItem("theme");
		let initialTheme = stored || "light";
		if (!stored && legacyDark) {
			try {
				const legacy = JSON.parse(legacyDark) as boolean;
				initialTheme = legacy ? "dark" : "light";
				localStorage.setItem("theme", initialTheme);
				localStorage.removeItem("darkMode");
			} catch {
				// Ignore parsing errors
			}
		}
		setIsDark(initialTheme === "dark");
	}, []);

	useEffect(() => {
		const rootElement = document.documentElement;
		rootElement.classList.remove("dark");
		if (isDark) {
			rootElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			localStorage.setItem("theme", "light");
		}
	}, [isDark]);

	const toggleTheme = () => {
		setIsDark(!isDark);
	};

	const sizeClasses = {
		sm: "h-8 w-8",
		md: "h-9 w-9",
		lg: "h-10 w-10",
	};

	const iconSizes = {
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-5 w-5",
	};

	return (
		<button
			onClick={toggleTheme}
			className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
				isDark
					? "bg-foreground text-background hover:bg-foreground/90"
					: "bg-muted text-foreground hover:bg-muted/80"
			} ${className || ""}`}
			aria-label="Toggle dark mode"
		>
			{isDark ? (
				<Moon className={`${iconSizes[size]}`} />
			) : (
				<Sun className={`${iconSizes[size]}`} />
			)}
		</button>
	);
}
