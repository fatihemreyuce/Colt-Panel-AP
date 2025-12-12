import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTeamMember } from "@/hooks/use-team-members";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, Mail, Linkedin, Image as ImageIcon, Upload, XCircle, Globe, RefreshCw, Loader2, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import type { TeamMemberRequest } from "@/types/team-members.types";
import { translateText, translateHtml } from "@/services/translate-service";

export default function TeamMemberCreatePage() {
	const navigate = useNavigate();
	const createTeamMemberMutation = useCreateTeamMember();
	
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
	const [showPreview, setShowPreview] = useState(false);

	// Tüm dilleri otomatik olarak ekle ve ilk dili seç
	useEffect(() => {
		if (languages.length > 0 && formData.localizations.length === 0) {
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
	}, [languages, selectedLanguageCode]);

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
		return formData.localizations.find(loc => loc.languageCode === selectedLanguageCode) || {
			languageCode: selectedLanguageCode,
			title: "",
			description: "",
		};
	};

	const currentLocalization = getCurrentLocalization();
	const selectedLanguage = languages.find(lang => lang.code === selectedLanguageCode);

	// Helper function to strip HTML tags from text
	const stripHtml = (html: string): string => {
		if (!html) return "";
		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	// Get preview localization (prefer selected, then Turkish, then first available)
	const getPreviewLocalization = () => {
		if (selectedLanguageCode) {
			const selected = formData.localizations.find(loc => loc.languageCode === selectedLanguageCode);
			if (selected) return selected;
		}
		const turkish = formData.localizations.find(loc => loc.languageCode.toLowerCase() === "tr");
		if (turkish) return turkish;
		return formData.localizations[0] || null;
	};

	const previewLoc = getPreviewLocalization();

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
				await createTeamMemberMutation.mutateAsync(formData);
				navigate("/team-members");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	return (
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/team-members")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-1">Yeni Takım Üyesi Oluştur</h1>
						<p className="text-muted-foreground text-sm">Yeni bir takım üyesi ekleyin</p>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowPreview(!showPreview)}
						className="flex items-center gap-2"
					>
						<Eye className="h-4 w-4" />
						{showPreview ? "Önizlemeyi Gizle" : "Önizleme"}
					</Button>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Form */}
				<div className={`${showPreview ? "lg:col-span-2" : "lg:col-span-3"}`}>
					{/* Form Container */}
					<div className="rounded-xl border-2 border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
				{/* Form Header */}
				<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<User className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Takım Üyesi Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Yeni takım üyesi için gerekli bilgileri giriniz</p>
						</div>
					</div>
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
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.localizations}
							</p>
						)}

						{selectedLanguageCode && (
							<>
								{/* Başlık */}
								<div className="space-y-2">
									<Label className="text-p3 text-gray-700 dark:text-gray-200 font-semibold">
										Başlık <span className="text-red-500">*</span>
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
									<Label className="text-p3 text-gray-700 dark:text-gray-200 font-semibold">
										Açıklama <span className="text-red-500">*</span>
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
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createTeamMemberMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{createTeamMemberMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

				{/* Right Column - Preview */}
				{showPreview && (
					<div className="space-y-6">
						{/* Preview Card */}
						<Card>
							<CardHeader>
								<CardTitle>Önizleme</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Photo Preview */}
								{photoPreview && (
									<div className="w-full rounded-lg overflow-hidden border">
										<img
											src={photoPreview}
											alt={formData.name || "Preview"}
											className="w-full h-auto object-contain"
										/>
									</div>
								)}

								{/* Basic Info */}
								<div className="space-y-4">
									<div>
										<label className="text-sm text-muted-foreground">Ad:</label>
										<p className="mt-1 text-sm font-medium">{formData.name || "—"}</p>
									</div>
									{formData.email && (
										<div>
											<label className="text-sm text-muted-foreground">E-posta:</label>
											<div className="mt-1">
												<a
													href={`mailto:${formData.email}`}
													className="text-sm text-primary hover:underline flex items-center gap-1"
												>
													<Mail className="h-3 w-3" />
													<span className="truncate">{formData.email}</span>
												</a>
											</div>
										</div>
									)}
									{formData.linkedinUrl && (
										<div>
											<label className="text-sm text-muted-foreground">LinkedIn:</label>
											<div className="mt-1">
												<a
													href={formData.linkedinUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-primary hover:underline flex items-center gap-1"
												>
													<ExternalLink className="h-3 w-3" />
													<span className="truncate">LinkedIn Profili</span>
												</a>
											</div>
										</div>
									)}
								</div>

								{/* Localization Preview */}
								{previewLoc && (
									<div className="pt-4 border-t space-y-4">
										<div className="flex items-center gap-2 mb-2">
											<Globe className="h-4 w-4 text-primary" />
											<Badge className="bg-green-500 text-white">
												{previewLoc.languageCode.toUpperCase()}
											</Badge>
										</div>
										{previewLoc.title && (
											<div>
												<label className="text-sm font-medium">Başlık</label>
												<p className="mt-1 text-sm">{previewLoc.title}</p>
											</div>
										)}
										{previewLoc.description && (
											<div>
												<label className="text-sm font-medium">Açıklama</label>
												<div
													className="mt-1 text-sm prose prose-sm max-w-none"
													dangerouslySetInnerHTML={{ __html: previewLoc.description }}
												/>
											</div>
										)}
									</div>
								)}

								{/* All Languages Badge */}
								{formData.localizations.length > 0 && (
									<div className="pt-4 border-t">
										<label className="text-sm text-muted-foreground mb-2 block">Diller:</label>
										<div className="flex flex-wrap gap-2">
											{formData.localizations.map((loc) => (
												<Badge key={loc.languageCode} className="bg-green-500 text-white">
													{loc.languageCode.toUpperCase()}
												</Badge>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}

