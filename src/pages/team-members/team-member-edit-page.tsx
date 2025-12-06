import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateTeamMember, useGetTeamMemberById } from "@/hooks/use-team-members";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save, User, Mail, Linkedin, Image as ImageIcon, Loader2, Upload, XCircle, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { TeamMemberRequest } from "@/types/team-members.types";
import { translateText, translateHtml } from "@/services/translate-service";

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
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");
	const [translating, setTranslating] = useState(false);

	useEffect(() => {
		if (teamMember && languages.length > 0) {
			// Mevcut localizations'ı al
			const existingLocalizations = teamMember.localizations || [];
			// Tüm dilleri kontrol et ve eksik olanları ekle
			const allLocalizations = languages.map((lang) => {
				const existing = existingLocalizations.find(
					(loc) => loc.languageCode === lang.code
				);
				return existing || {
					languageCode: lang.code,
					title: "",
					description: "",
				};
			});

			setFormData({
				name: teamMember.name,
				linkedinUrl: teamMember.linkedinUrl,
				email: teamMember.email,
				photo: teamMember.photo,
				localizations: allLocalizations,
			});
			if (teamMember.photo) {
				setPhotoPreview(teamMember.photo);
			}
			// İlk dili seç
			if (!selectedLanguageCode && languages[0]) {
				setSelectedLanguageCode(languages[0].code);
			}
		} else if (languages.length > 0 && formData.localizations.length === 0) {
			// Eğer teamMember yoksa ve diller yüklendiyse, tüm dilleri ekle
			setFormData((prev) => ({
				...prev,
				localizations: languages.map((lang) => ({
					languageCode: lang.code,
					title: "",
					description: "",
				})),
			}));
			// İlk dili seç
			if (!selectedLanguageCode && languages[0]) {
				setSelectedLanguageCode(languages[0].code);
			}
		}
	}, [teamMember, languages, selectedLanguageCode]);

	// Dil değiştiğinde, eğer o dil için entry yoksa ekle
	useEffect(() => {
		if (selectedLanguageCode && formData.localizations.length > 0) {
			const exists = formData.localizations.some(loc => loc.languageCode === selectedLanguageCode);
			if (!exists) {
				setFormData((prev) => ({
					...prev,
					localizations: [
						...prev.localizations,
						{
							languageCode: selectedLanguageCode,
							title: "",
							description: "",
						},
					],
				}));
			}
		}
	}, [selectedLanguageCode]);

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


	const handleLocalizationChange = (
		field: "title" | "description",
		value: string
	) => {
		if (!selectedLanguageCode) return;
		
		const newLocalizations = [...formData.localizations];
		let currentIndex = newLocalizations.findIndex(loc => loc.languageCode === selectedLanguageCode);
		
		// Eğer bu dil için entry yoksa, ekle
		if (currentIndex === -1) {
			newLocalizations.push({
				languageCode: selectedLanguageCode,
				title: "",
				description: "",
			});
			currentIndex = newLocalizations.length - 1;
		}
		
		newLocalizations[currentIndex] = { ...newLocalizations[currentIndex], [field]: value };
		
		// Eğer başlık veya açıklama değiştiyse, diğer dillere de kopyala
		if (field === "title" || field === "description") {
			const sourceValue = newLocalizations[currentIndex][field];
			// Diğer tüm dillere aynı değeri kopyala
			newLocalizations.forEach((loc, idx) => {
				if (idx !== currentIndex) {
					loc[field] = sourceValue;
				}
			});
		}
		
		setFormData({ ...formData, localizations: newLocalizations });
	};

	const getCurrentLocalization = () => {
		if (!selectedLanguageCode) return { languageCode: "", title: "", description: "" };
		return formData.localizations.find(loc => loc.languageCode === selectedLanguageCode) || { languageCode: selectedLanguageCode, title: "", description: "" };
	};

	const currentLocalization = getCurrentLocalization();
	const selectedLanguage = languages.find(lang => lang.code === selectedLanguageCode);

	const handleTranslate = async () => {
		if (!selectedLanguageCode || (!currentLocalization.title.trim() && !currentLocalization.description.trim())) {
			toast.warning("Lütfen önce başlık veya açıklama giriniz");
			return;
		}

		setTranslating(true);
		try {
			const sourceTitle = currentLocalization.title.trim();
			const sourceDescription = currentLocalization.description.trim();

			if (!sourceTitle && !sourceDescription) {
				toast.warning("Lütfen önce başlık veya açıklama giriniz");
				setTranslating(false);
				return;
			}

			const newLocalizations = [...formData.localizations];

			// Diğer tüm dillere çevir
			const translatePromises = languages
				.filter(lang => lang.code !== selectedLanguageCode)
				.map(async (lang) => {
					const targetIndex = newLocalizations.findIndex(loc => loc.languageCode === lang.code);
					
					// Eğer bu dil için entry yoksa, oluştur
					if (targetIndex === -1) {
						newLocalizations.push({
							languageCode: lang.code,
							title: "",
							description: "",
						});
					}

					const finalIndex = targetIndex === -1 ? newLocalizations.length - 1 : targetIndex;

					// Başlık çevir
					if (sourceTitle) {
						try {
							const translatedTitle = await translateText(sourceTitle, lang.code, selectedLanguageCode);
							newLocalizations[finalIndex] = {
								...newLocalizations[finalIndex],
								title: translatedTitle,
							};
						} catch (error) {
							console.error(`Title translation error for ${lang.code}:`, error);
						}
					}

					// Açıklama çevir (HTML içeriği)
					if (sourceDescription) {
						try {
							const translatedDescription = await translateHtml(sourceDescription, lang.code, selectedLanguageCode);
							newLocalizations[finalIndex] = {
								...newLocalizations[finalIndex],
								description: translatedDescription,
							};
						} catch (error) {
							console.error(`Description translation error for ${lang.code}:`, error);
						}
					}
				});

			await Promise.all(translatePromises);
			setFormData({ ...formData, localizations: newLocalizations });
			toast.success("Diğer dillere çeviri işlemi tamamlandı");
		} catch (error: any) {
			console.error("Translation error:", error);
			toast.error(error?.message || "Çeviri işlemi sırasında bir hata oluştu");
		} finally {
			setTranslating(false);
		}
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
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!teamMember) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Takım üyesi bulunamadı</p>
					<Button onClick={() => navigate("/team-members")} className="bg-primary text-primary-foreground hover:bg-primary/90">
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center gap-4 border-b border-border px-6 -mx-6 mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/team-members")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Takım Üyesi Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Takım üyesi bilgilerini güncelleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<User className="h-5 w-5 text-muted-foreground" />
						Takım Üyesi Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Takım üyesi bilgilerini güncelleyin</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Name Field */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-p3 font-semibold flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							İsim
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`h-11 ${
								errors.name ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="İsim giriniz"
						/>
						{errors.name && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.name}
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

					{/* LinkedIn URL Field */}
					<div className="space-y-2">
						<Label htmlFor="linkedinUrl" className="text-p3 font-semibold flex items-center gap-2">
							<Linkedin className="h-4 w-4 text-muted-foreground" />
							LinkedIn URL
						</Label>
						<Input
							id="linkedinUrl"
							type="url"
							value={formData.linkedinUrl}
							onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
							className={`h-11 ${
								errors.linkedinUrl ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="https://linkedin.com/in/..."
						/>
						{errors.linkedinUrl && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.linkedinUrl}
							</p>
						)}
					</div>

					{/* Photo Field */}
					<div className="space-y-2">
						<Label htmlFor="photo" className="text-p3 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
							Fotoğraf
						</Label>
						{photoPreview ? (
							<div className="relative inline-block">
								<div className="relative group">
									<img
										src={photoPreview}
										alt="Preview"
										className="h-32 w-32 rounded-xl object-cover border-2 border-border shadow-lg"
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
									className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors text-p3 font-semibold"
								>
									<Upload className="h-4 w-4 text-muted-foreground" />
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
								className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-all hover:border-primary group"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
									<p className="text-p3 font-semibold mb-2">
										Fotoğraf Yükle
									</p>
									<p className="text-p3 text-muted-foreground text-center px-4">
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
						<p className="text-p3 text-muted-foreground">
							Yeni fotoğraf yüklemek için dosya seçin (opsiyonel)
						</p>
					</div>

					{/* Çoklu Dil İçerikleri */}
					<div className="space-y-4">
						{/* Header */}
						<div className="flex items-center justify-between">
							<Label className="text-p3 font-semibold flex items-center gap-2">
								<Globe className="h-4 w-4 text-muted-foreground" />
								Çoklu Dil İçerikleri <span className="text-destructive">*</span>
							</Label>
							<Button
								type="button"
								variant="default"
								size="sm"
								onClick={handleTranslate}
								disabled={translating}
								className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${translating ? "animate-spin" : ""}`} />
								{translating ? "Çeviriliyor..." : "Diğer Dilleri Çevir"}
							</Button>
						</div>

						{/* Dil Seçimi Toggle Butonları */}
						<div className="flex flex-wrap gap-2">
							{languages.map((lang) => {
								const isSelected = selectedLanguageCode === lang.code;
								return (
									<Button
										key={lang.id}
										type="button"
										variant={isSelected ? "default" : "outline"}
										size="sm"
										onClick={() => setSelectedLanguageCode(lang.code)}
										className={
											isSelected
												? "bg-primary text-primary-foreground hover:bg-primary/90"
												: ""
										}
									>
										{lang.code.toUpperCase()}
									</Button>
								);
							})}
						</div>

						{errors.localizations && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.localizations}
							</p>
						)}

						{selectedLanguageCode && (
							<>
								{/* Başlık */}
								<div className="space-y-2">
									<Label className="text-p3 font-semibold">
										Başlık <span className="text-destructive">*</span>
									</Label>
									<Input
										value={currentLocalization.title}
										onChange={(e) => handleLocalizationChange("title", e.target.value)}
										className="h-11"
										placeholder={`${selectedLanguage?.code === "tr" ? "TR" : selectedLanguage?.code === "en" ? "EN" : selectedLanguage?.code?.toUpperCase() || ""} başlığını girin`}
									/>
									{formData.localizations.map((loc, index) => {
										if (loc.languageCode !== selectedLanguageCode) return null;
										return errors[`localizations.${index}.title`] ? (
											<p key={index} className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
												<span>•</span>
												{errors[`localizations.${index}.title`]}
											</p>
										) : null;
									})}
								</div>

								{/* Açıklama */}
								<div className="space-y-2">
									<Label className="text-p3 font-semibold">
										Açıklama <span className="text-destructive">*</span>
									</Label>
									<RichTextEditor
										value={currentLocalization.description}
										onChange={(content) => handleLocalizationChange("description", content)}
										placeholder={`${selectedLanguage?.code === "tr" ? "TR" : selectedLanguage?.code === "en" ? "EN" : selectedLanguage?.code?.toUpperCase() || ""} açıklamasını girin`}
										height={300}
										className="border border-border rounded-lg overflow-hidden"
									/>
									{formData.localizations.map((loc, index) => {
										if (loc.languageCode !== selectedLanguageCode) return null;
										return errors[`localizations.${index}.description`] ? (
											<p key={index} className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
												<span>•</span>
												{errors[`localizations.${index}.description`]}
											</p>
										) : null;
									})}
								</div>
							</>
						)}
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/team-members")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateTeamMemberMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
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

