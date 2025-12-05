import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginState } from "@/hooks/use-login-state";
import type { LoginRequest } from "@/types/auth.types";
import { toast } from "sonner";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login, isLoading, isLoggedIn } = useLoginState();
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoggedIn) {
			navigate("/");
		}
	}, [isLoggedIn, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const loginRequest: LoginRequest = {
				email,
				password,
			};

			await login(loginRequest);
			navigate("/");
		} catch (err: any) {
			toast.error("Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const isFormDisabled = isLoading || isSubmitting;

	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-10 relative">
			{/* Dark Mode Toggle - Sağ üst köşe */}
			<div className="absolute top-4 right-4 z-10">
				<div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-green-200 dark:border-gray-700">
					<DarkModeToggle className="bg-green-500 dark:bg-brand-green hover:bg-green-600 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-brand-green" />
				</div>
			</div>
			
			<Card className="w-full max-w-md border-2 border-green-200 dark:border-gray-700/50 shadow-xl shadow-green-500/10 dark:shadow-black/50 bg-white/80 dark:bg-gray-800/95 backdrop-blur-sm">
				<CardHeader className="space-y-3 text-center pb-6">
					<div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-2 shadow-lg shadow-green-500/30">
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<CardTitle className="text-h3 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-400 bg-clip-text text-transparent">
						Tekrar hoş geldiniz
					</CardTitle>
					<CardDescription className="text-p3 text-gray-600 dark:text-gray-300">
						Devam etmek için hesabınıza giriş yapın
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold">
								E-posta
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="ornek@email.com"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isFormDisabled}
								className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-green-500 focus-visible:border-green-500 dark:focus-visible:ring-brand-green dark:focus-visible:border-brand-green transition-all"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold">
								Şifre
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isFormDisabled}
									className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-green-500 focus-visible:border-green-500 dark:focus-visible:ring-brand-green dark:focus-visible:border-brand-green transition-all pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isFormDisabled}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-brand-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-brand-green focus:ring-offset-1 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
									aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
								<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-3 pt-2">
						<Button 
							type="submit" 
							className="w-full bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/50 text-p3 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
							disabled={isFormDisabled} 
							aria-busy={isFormDisabled}
						>
							{isFormDisabled ? (
								<span className="flex items-center gap-2">
									<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Giriş yapılıyor...
								</span>
							) : (
								"Giriş Yap"
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
