import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateUser, useGetUser } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User, Mail, Lock, Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export default function UserEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const userId = id ? parseInt(id) : 0;
	const { data: user, isLoading } = useGetUser(userId);
	const updateUserMutation = useUpdateUser();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username,
				email: user.email,
				password: "",
			});
		}
	}, [user]);

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
		if (formData.password && formData.password.length < 6) {
			newErrors.password = "Şifre en az 6 karakter olmalıdır";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				const userData: any = {
					username: formData.username,
					email: formData.email,
				};
				if (formData.password) {
					userData.password = formData.password;
				}
				await updateUserMutation.mutateAsync({ id: userId, user: userData });
				navigate("/users");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-green-500 dark:text-green-400" />
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Kullanıcı bulunamadı</p>
					<Button onClick={() => navigate("/users")} className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 text-white text-p3 font-semibold">
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-20 items-center gap-4 border-b border-green-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-gray-800/50 dark:to-gray-800/30 px-6 -mx-6 rounded-b-lg">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/users")}
					className="hover:bg-green-50 dark:hover:bg-green-950/30"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-500 bg-clip-text text-transparent">
						Kullanıcı Düzenle
					</h1>
					<p className="text-p3 text-gray-600 dark:text-gray-400 mt-1">Kullanıcı bilgilerini güncelleyin</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-green-200/50 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/95 shadow-sm dark:shadow-xl dark:shadow-black/20">
					{/* Form Header */}
					<div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border-b border-green-200/50 dark:border-gray-600/50 px-6 py-4">
						<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
							<User className="h-5 w-5 text-brand-green dark:text-brand-green" />
							Kullanıcı Bilgileri
						</h2>
						<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Kullanıcı bilgilerini güncelleyin</p>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Username Field */}
						<div className="space-y-2">
							<Label htmlFor="username" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
								<User className="h-4 w-4 text-brand-green dark:text-brand-green" />
								Kullanıcı Adı
							</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all ${
									errors.username ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
								}`}
								placeholder="Kullanıcı adı giriniz"
							/>
							{errors.username && (
								<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
									<span>•</span>
									{errors.username}
								</p>
							)}
						</div>

						{/* Email Field */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
								<Mail className="h-4 w-4 text-brand-green dark:text-brand-green" />
								E-posta
							</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all ${
									errors.email ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
								}`}
								placeholder="ornek@email.com"
							/>
							{errors.email && (
								<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
									<span>•</span>
									{errors.email}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<Label htmlFor="password" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
								<Lock className="h-4 w-4 text-brand-green dark:text-brand-green" />
								Şifre <span className="text-p3 font-regular text-gray-500 dark:text-gray-400">(Değiştirmek için doldurun)</span>
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green pr-10 transition-all ${
										errors.password ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
									}`}
									placeholder="Yeni şifre giriniz (opsiyonel)"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-brand-green transition-colors p-1 rounded-md hover:bg-green-50 dark:hover:bg-gray-600/50"
									aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
								>
									{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
							{errors.password && (
								<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
									<span>•</span>
									{errors.password}
								</p>
							)}
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-end gap-4 pt-6 border-t border-green-200/50 dark:border-gray-600/50">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/users")}
								className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
							>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={updateUserMutation.isPending}
								className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
							>
								{updateUserMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
										Güncelleniyor...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Güncelle
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
		</div>
	);
}
