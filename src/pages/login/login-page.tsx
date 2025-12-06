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
		<div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-10 relative">
			{/* Dark Mode Toggle - Sağ üst köşe */}
			<div className="absolute top-4 right-4 z-10">
				<div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-border">
					<DarkModeToggle />
				</div>
			</div>
			
			<Card className="w-full max-w-md border border-border shadow-lg bg-card">
				<CardHeader className="space-y-3 text-center pb-6">
					<div className="mx-auto w-16 h-16 rounded-xl bg-foreground flex items-center justify-center mb-2 shadow-md">
						<svg className="w-8 h-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<CardTitle className="text-h3 font-bold text-foreground">
						Tekrar hoş geldiniz
					</CardTitle>
					<CardDescription className="text-p3 text-muted-foreground">
						Devam etmek için hesabınıza giriş yapın
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-p3 font-semibold text-foreground">
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
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-p3 font-semibold text-foreground">
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
									className="h-11 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isFormDisabled}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
							<div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-3 pt-2">
						<Button 
							type="submit" 
							className="w-full !bg-black !text-white hover:!bg-black/90 dark:!bg-white dark:!text-black dark:hover:!bg-white/90 h-11 text-p3 font-semibold" 
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
