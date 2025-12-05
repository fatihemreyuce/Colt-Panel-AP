import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateTeamMember, useGetTeamMemberById } from "@/hooks/use-team-members";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, User, Mail, Linkedin, Image as ImageIcon, Plus, X, Languages as LanguagesIcon, Loader2, Upload, XCircle } from "lucide-react";
import type { TeamMemberRequest } from "@/types/team-members.types";

export default function TeamMemberEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const teamMemberId = id ? parseInt(id) : 0;
	const { data: teamMember, isLoading } = useGetTeamMemberById(teamMemberId);
	const updateTeamMemberMutation = useUpdateTeamMember();
	
	// Languages listesi için
	const { data: languagesData } = useLanguages(0, 100, "code,asc");
	const languages = languagesData?.content || [];

	const [formData, setFormData] = useState<TeamMemberRequest>({
		name: "",
		linkedinUrl: "",
		email: "",
		photo: undefined,
		localizations: [],
	});

	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (teamMember) {
			setFormData({
				name: teamMember.name,
				linkedinUrl: teamMember.linkedinUrl,
				email: teamMember.email,
				photo: teamMember.photo,
				localizations: teamMember.localizations || [],
			});
			if (teamMember.photo) {
				setPhotoPreview(teamMember.photo);
			}
		}
	}, [teamMember]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim()) {
			newErrors.name = "İsim gereklidir";
		}
		if (!formData.email.trim()) {
			newErrors.email = "E-posta gereklidir";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Geçerli bir e-posta adresi giriniz";
		}
		if (formData.linkedinUrl && !/^https?:\/\/.+\..+/.test(formData.linkedinUrl)) {
			newErrors.linkedinUrl = "Geçerli bir URL giriniz";
		}
		if (formData.localizations.length === 0) {
			newErrors.localizations = "En az bir dil lokalizasyonu eklenmelidir";
		}
		formData.localizations.forEach((loc, index) => {
			if (!loc.languageCode) {
				newErrors[`localizations.${index}.languageCode`] = "Dil kodu gereklidir";
			}
			if (!loc.title.trim()) {
				newErrors[`localizations.${index}.title`] = "Başlık gereklidir";
			}
			if (!loc.description.trim()) {
				newErrors[`localizations.${index}.description`] = "Açıklama gereklidir";
			}
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, photo: file });
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddLocalization = () => {
		setFormData({
			...formData,
			localizations: [
				...formData.localizations,
				{ languageCode: "", title: "", description: "" },
			],
		});
	};

	const handleRemoveLocalization = (index: number) => {
		setFormData({
			...formData,
			localizations: formData.localizations.filter((_, i) => i !== index),
		});
	};

	const handleLocalizationChange = (
		index: number,
		field: "languageCode" | "title" | "description",
		value: string
	) => {
		const newLocalizations = [...formData.localizations];
		newLocalizations[index] = { ...newLocalizations[index], [field]: value };
		setFormData({ ...formData, localizations: newLocalizations });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await updateTeamMemberMutation.mutateAsync({
					id: teamMemberId,
					teamMember: formData,
				});
				navigate("/team-members");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-brand-green dark:text-brand-green" />
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!teamMember) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Takım üyesi bulunamadı</p>
					<Button onClick={() => navigate("/team-members")} className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 text-white text-p3 font-semibold">
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
					onClick={() => navigate("/team-members")}
					className="hover:bg-green-50 dark:hover:bg-gray-700/50"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-400 bg-clip-text text-transparent">
						Takım Üyesi Düzenle
					</h1>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Takım üyesi bilgilerini güncelleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-green-200/50 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/95 shadow-sm dark:shadow-xl dark:shadow-black/20">
				{/* Form Header */}
				<div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border-b border-green-200/50 dark:border-gray-600/50 px-6 py-4">
					<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<User className="h-5 w-5 text-brand-green dark:text-brand-green" />
						Takım Üyesi Bilgileri
					</h2>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Takım üyesi bilgilerini güncelleyin</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Name Field */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<User className="h-4 w-4 text-brand-green dark:text-brand-green" />
							İsim
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all ${
								errors.name ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
							}`}
							placeholder="İsim giriniz"
						/>
						{errors.name && (
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.name}
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

					{/* LinkedIn URL Field */}
					<div className="space-y-2">
						<Label htmlFor="linkedinUrl" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<Linkedin className="h-4 w-4 text-brand-green dark:text-brand-green" />
							LinkedIn URL
						</Label>
						<Input
							id="linkedinUrl"
							type="url"
							value={formData.linkedinUrl}
							onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
							className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all ${
								errors.linkedinUrl ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
							}`}
							placeholder="https://linkedin.com/in/..."
						/>
						{errors.linkedinUrl && (
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.linkedinUrl}
							</p>
						)}
					</div>

					{/* Photo Field */}
					<div className="space-y-2">
						<Label htmlFor="photo" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
							Fotoğraf
						</Label>
						{photoPreview ? (
							<div className="relative inline-block">
								<div className="relative group">
									<img
										src={photoPreview}
										alt="Preview"
										className="h-32 w-32 rounded-xl object-cover border-2 border-green-200 dark:border-gray-600 shadow-lg"
									/>
									<button
										type="button"
										onClick={() => {
											setPhotoPreview(null);
											setFormData({ ...formData, photo: undefined });
										}}
										className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors group-hover:scale-110"
										aria-label="Fotoğrafı kaldır"
									>
										<XCircle className="h-4 w-4" />
									</button>
								</div>
								<label
									htmlFor="photo"
									className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-600/50 cursor-pointer transition-colors text-p3 font-semibold text-gray-700 dark:text-gray-200"
								>
									<Upload className="h-4 w-4 text-brand-green dark:text-brand-green" />
									Fotoğrafı Değiştir
								</label>
								<Input
									id="photo"
									type="file"
									accept="image/*"
									onChange={handlePhotoChange}
									className="hidden"
								/>
							</div>
						) : (
							<label
								htmlFor="photo"
								className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-green-300 dark:border-gray-600 rounded-xl bg-green-50/50 dark:bg-gray-700/30 hover:bg-green-100/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all hover:border-brand-green dark:hover:border-brand-green group"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-12 w-12 text-brand-green dark:text-brand-green mb-4 group-hover:scale-110 transition-transform" />
									<p className="text-p3 font-semibold text-gray-700 dark:text-gray-200 mb-2">
										Fotoğraf Yükle
									</p>
									<p className="text-p3 text-gray-500 dark:text-gray-400 text-center px-4">
										PNG, JPG veya GIF (Max. 5MB)
									</p>
								</div>
								<Input
									id="photo"
									type="file"
									accept="image/*"
									onChange={handlePhotoChange}
									className="hidden"
								/>
							</label>
						)}
						<p className="text-p3 text-gray-500 dark:text-gray-400">
							Yeni fotoğraf yüklemek için dosya seçin (opsiyonel)
						</p>
					</div>

					{/* Localizations */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
								<LanguagesIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
								Diller
							</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAddLocalization}
								className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50"
							>
								<Plus className="h-4 w-4 mr-2" />
								Ekle
							</Button>
						</div>
						{errors.localizations && (
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.localizations}
							</p>
						)}
						{formData.localizations.map((localization, index) => {
							// Diğer lokalizasyonlarda seçilmiş dilleri filtrele
							const selectedLanguageCodes = formData.localizations
								.map((loc, idx) => idx !== index ? loc.languageCode : null)
								.filter((code): code is string => Boolean(code));
							
							const availableLanguages = languages.filter(
								(lang) => !selectedLanguageCodes.includes(lang.code) || lang.code === localization.languageCode
							);

							return (
								<div key={index} className="p-4 rounded-lg border border-green-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 space-y-4">
									<div className="flex items-center justify-between">
										<h4 className="text-p3 font-semibold text-gray-700 dark:text-gray-200">
											Dil {index + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveLocalization(index)}
											className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									<div className="grid gap-4 md:grid-cols-3">
										<div className="space-y-2">
											<Label className="text-p3 text-gray-600 dark:text-gray-300">Dil Kodu</Label>
											<Select
												value={localization.languageCode}
												onValueChange={(value) => handleLocalizationChange(index, "languageCode", value)}
											>
												<SelectTrigger className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100">
													<SelectValue placeholder="Dil seçin" />
												</SelectTrigger>
												<SelectContent>
													{availableLanguages.length > 0 ? (
														availableLanguages.map((lang) => (
															<SelectItem key={lang.id} value={lang.code}>
																{lang.code.toUpperCase()}
															</SelectItem>
														))
													) : (
														<div className="px-2 py-1.5 text-p3 text-gray-500 dark:text-gray-400">
															Tüm diller seçilmiş
														</div>
													)}
												</SelectContent>
											</Select>
										{errors[`localizations.${index}.languageCode`] && (
											<p className="text-p3 text-red-600 dark:text-red-400 text-xs">
												{errors[`localizations.${index}.languageCode`]}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-p3 text-gray-600 dark:text-gray-300">Başlık</Label>
										<Input
											value={localization.title}
											onChange={(e) => handleLocalizationChange(index, "title", e.target.value)}
											className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100"
											placeholder="Başlık"
										/>
										{errors[`localizations.${index}.title`] && (
											<p className="text-p3 text-red-600 dark:text-red-400 text-xs">
												{errors[`localizations.${index}.title`]}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-p3 text-gray-600 dark:text-gray-300">Açıklama</Label>
										<Input
											value={localization.description}
											onChange={(e) => handleLocalizationChange(index, "description", e.target.value)}
											className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100"
											placeholder="Açıklama"
										/>
										{errors[`localizations.${index}.description`] && (
											<p className="text-p3 text-red-600 dark:text-red-400 text-xs">
												{errors[`localizations.${index}.description`]}
											</p>
										)}
									</div>
								</div>
							</div>
							);
						})}
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-green-200/50 dark:border-gray-600/50">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/team-members")}
							className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateTeamMemberMutation.isPending}
							className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
						>
							{updateTeamMemberMutation.isPending ? (
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

