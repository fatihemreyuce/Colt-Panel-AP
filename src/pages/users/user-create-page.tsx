import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User, Mail, Lock } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export default function UserCreatePage() {
	const navigate = useNavigate();
	const createUserMutation = useCreateUser();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.username.trim()) {
			newErrors.username = "Kullanıcı adı gereklidir";
		}
		if (!formData.email.trim()) {
			newErrors.email = "E-posta gereklidir";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Geçerli bir e-posta adresi giriniz";
		}
		if (!formData.password) {
			newErrors.password = "Şifre gereklidir";
		} else if (formData.password.length < 6) {
			newErrors.password = "Şifre en az 6 karakter olmalıdır";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createUserMutation.mutateAsync(formData);
				navigate("/users");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center gap-4 border-b border-border px-6 -mx-6 mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/users")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Kullanıcı Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir kullanıcı hesabı oluşturun</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
					{/* Form Header */}
					<div className="bg-muted/50 border-b border-border px-6 py-4">
						<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
							<User className="h-5 w-5 text-muted-foreground" />
							Kullanıcı Bilgileri
						</h2>
						<p className="text-p3 text-muted-foreground mt-1">Yeni kullanıcı için gerekli bilgileri giriniz</p>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Username Field */}
						<div className="space-y-2">
							<Label htmlFor="username" className="text-p3 font-semibold flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								Kullanıcı Adı
							</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								className={`h-11 ${
									errors.username ? "border-destructive focus-visible:ring-destructive" : ""
								}`}
								placeholder="Kullanıcı adı giriniz"
							/>
							{errors.username && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.username}
								</p>
							)}
						</div>

						{/* Email Field */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-p3 font-semibold flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								E-posta
							</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className={`h-11 ${
									errors.email ? "border-destructive focus-visible:ring-destructive" : ""
								}`}
								placeholder="ornek@email.com"
							/>
							{errors.email && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.email}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<Label htmlFor="password" className="text-p3 font-semibold flex items-center gap-2">
								<Lock className="h-4 w-4 text-muted-foreground" />
								Şifre
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className={`h-11 pr-10 ${
										errors.password ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Şifre giriniz"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
									aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
								>
									{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
							{errors.password && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.password}
								</p>
							)}
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/users")}
								className="min-w-[100px]"
							>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={createUserMutation.isPending}
								className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
							>
								{createUserMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
										Oluşturuluyor...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Oluştur
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
		</div>
	);
}
