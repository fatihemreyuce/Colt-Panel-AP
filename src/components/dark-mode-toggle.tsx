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
		sm: "h-7 w-12",
		md: "h-8 w-14",
		lg: "h-10 w-16"
	};

	const iconSizes = {
		sm: "h-4 w-4",
		md: "h-4 w-4",
		lg: "h-5 w-5"
	};

	const sliderSizes = {
		sm: "h-5 w-5",
		md: "h-6 w-6",
		lg: "h-7 w-7"
	};

	const translateClasses = {
		sm: isDark ? "translate-x-5" : "translate-x-0.5",
		md: isDark ? "translate-x-8" : "translate-x-1",
		lg: isDark ? "translate-x-9" : "translate-x-1"
	};

	return (
		<button
			onClick={toggleTheme}
			className={`group relative inline-flex items-center ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
				isDark 
					? "bg-muted hover:bg-muted/80 border border-border" 
					: "bg-foreground hover:bg-foreground/90"
			} ${className || ""}`}
			aria-label="Toggle dark mode"
		>
			{/* Icons */}
			<div className={`absolute left-1.5 flex items-center justify-center transition-all duration-300 ${
				isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"
			}`}>
				<Sun className={`${iconSizes[size]} text-background`} />
			</div>
			<div className={`absolute right-1.5 flex items-center justify-center transition-all duration-300 ${
				isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"
			}`}>
				<Moon className={`${iconSizes[size]} text-background`} />
			</div>
			
			{/* Slider */}
			<span
				className={`${sliderSizes[size]} ${translateClasses[size]} absolute rounded-full bg-background shadow-md transition-all duration-300 ease-in-out ${
					isDark ? "border border-border" : ""
				}`}
			/>
		</button>
	);
}
