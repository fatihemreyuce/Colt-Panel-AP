import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSetting, useUpdateSettings } from "@/hooks/use-settings";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Settings, Loader2, Globe, Twitter, Instagram, Youtube, Linkedin, FileText, Shield, Cookie } from "lucide-react";
import type { settingsRequest, translation } from "@/types/settings.types";

export default function SettingsEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const settingsId = id ? parseInt(id) : 0;
	const { data: setting, isLoading } = useGetSetting(settingsId);
	const updateSettingsMutation = useUpdateSettings();
	
	// Languages listesi için
	const { data: languagesData } = useLanguages(0, 100, "code,asc");
	const languages = languagesData?.content || [];

	const [formData, setFormData] = useState<settingsRequest>({
		translations: [],
		twitterUrl: "",
		instagramUrl: "",
		youtubeUrl: "",
		linkedinUrl: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");

	useEffect(() => {
		if (setting && languages.length > 0) {
			// Mevcut translations'ı al
			const existingTranslations = setting.translations || [];
			// Tüm dilleri kontrol et ve eksik olanları ekle
			const allTranslations = languages.map((lang) => {
				const existing = existingTranslations.find(
					(t) => t.languageCode === lang.code
				);
				return existing || {
					languageCode: lang.code,
					termsOfUse: "",
					privacyPolicy: "",
					cookiePolicy: "",
					footerDescription: "",
				};
			});

			setFormData({
				translations: allTranslations,
				twitterUrl: setting.twitterUrl || "",
				instagramUrl: setting.instagramUrl || "",
				youtubeUrl: setting.youtubeUrl || "",
				linkedinUrl: setting.linkedinUrl || "",
			});
			
			// İlk dili seç (Turkish first, then first available)
			if (!selectedLanguageCode) {
				const turkish = languages.find(l => l.code.toLowerCase() === "tr");
				setSelectedLanguageCode(turkish?.code || languages[0]?.code || "");
			}
		} else if (languages.length > 0 && formData.translations.length === 0) {
			// Eğer setting yoksa ve diller yüklendiyse, tüm dilleri ekle
			setFormData((prev) => ({
				...prev,
				translations: languages.map((lang) => ({
					languageCode: lang.code,
					termsOfUse: "",
					privacyPolicy: "",
					cookiePolicy: "",
					footerDescription: "",
				})),
			}));
			// İlk dili seç
			if (!selectedLanguageCode) {
				const turkish = languages.find(l => l.code.toLowerCase() === "tr");
				setSelectedLanguageCode(turkish?.code || languages[0]?.code || "");
			}
		}
	}, [setting, languages, selectedLanguageCode]);

	// Dil değiştiğinde, eğer o dil için entry yoksa ekle
	useEffect(() => {
		if (selectedLanguageCode && formData.translations.length > 0) {
			const exists = formData.translations.some(t => t.languageCode === selectedLanguageCode);
			if (!exists) {
				setFormData((prev) => ({
					...prev,
					translations: [
						...prev.translations,
						{
							languageCode: selectedLanguageCode,
							termsOfUse: "",
							privacyPolicy: "",
							cookiePolicy: "",
							footerDescription: "",
						},
					],
				}));
			}
		}
	}, [selectedLanguageCode]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (formData.translations.length === 0) {
			newErrors.translations = "En az bir dil çevirisi eklenmelidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const currentTranslation = formData.translations.find(
		(t) => t.languageCode === selectedLanguageCode
	) || {
		languageCode: selectedLanguageCode,
		termsOfUse: "",
		privacyPolicy: "",
		cookiePolicy: "",
		footerDescription: "",
	};

	const updateCurrentTranslation = (field: keyof translation, value: string) => {
		setFormData((prev) => ({
			...prev,
			translations: prev.translations.map((t) =>
				t.languageCode === selectedLanguageCode
					? { ...t, [field]: value }
					: t
			),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await updateSettingsMutation.mutateAsync({ id: settingsId, settings: formData });
				navigate("/settings");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-primary" />
					<p className="text-sm font-medium text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!setting) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<div className="text-center py-12">
					<p className="text-sm text-muted-foreground mb-4">Ayar bulunamadı</p>
					<Button
						onClick={() => navigate("/settings")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Ayarlar Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	// Sort languages: Turkish first, then others alphabetically
	const sortedLanguages = [...languages].sort((a, b) => {
		if (a.code.toLowerCase() === "tr") return -1;
		if (b.code.toLowerCase() === "tr") return 1;
		return a.code.localeCompare(b.code);
	});

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/settings")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Ayarı Düzenle
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Ayar bilgilerini güncelleyin
						</p>
					</div>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-xl border-2 border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
				{/* Form Header */}
				<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Settings className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Ayar Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Ayar bilgilerini güncelleyin</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Social Media URLs */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold flex items-center gap-2">
							<Twitter className="h-5 w-5 text-primary" />
							Sosyal Medya Bağlantıları
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="twitterUrl" className="flex items-center gap-2">
									<Twitter className="h-4 w-4 text-blue-400" />
									Twitter URL
								</Label>
								<Input
									id="twitterUrl"
									type="url"
									value={formData.twitterUrl}
									onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
									placeholder="https://twitter.com/..."
									className="h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="instagramUrl" className="flex items-center gap-2">
									<Instagram className="h-4 w-4 text-pink-500" />
									Instagram URL
								</Label>
								<Input
									id="instagramUrl"
									type="url"
									value={formData.instagramUrl}
									onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
									placeholder="https://instagram.com/..."
									className="h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="youtubeUrl" className="flex items-center gap-2">
									<Youtube className="h-4 w-4 text-red-500" />
									YouTube URL
								</Label>
								<Input
									id="youtubeUrl"
									type="url"
									value={formData.youtubeUrl}
									onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
									placeholder="https://youtube.com/..."
									className="h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="linkedinUrl" className="flex items-center gap-2">
									<Linkedin className="h-4 w-4 text-blue-600" />
									LinkedIn URL
								</Label>
								<Input
									id="linkedinUrl"
									type="url"
									value={formData.linkedinUrl}
									onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
									placeholder="https://linkedin.com/..."
									className="h-11"
								/>
							</div>
						</div>
					</div>

					{/* Translations */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold flex items-center gap-2">
								<Globe className="h-5 w-5 text-primary" />
								Çeviriler
							</h3>
							<Select
								value={selectedLanguageCode}
								onValueChange={setSelectedLanguageCode}
							>
								<SelectTrigger className="w-[200px] h-11">
									<SelectValue placeholder="Dil seçiniz" />
								</SelectTrigger>
								<SelectContent>
									{sortedLanguages.map((lang) => (
										<SelectItem key={lang.code} value={lang.code}>
											{lang.name} ({lang.code.toUpperCase()})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{selectedLanguageCode && (
							<div className="space-y-4 p-4 rounded-lg border-2 border-border bg-muted/20">
								<div className="flex items-center gap-2 mb-4">
									<Badge variant="secondary" className="font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
										{selectedLanguageCode.toUpperCase()}
									</Badge>
									<span className="text-sm text-muted-foreground">
										{sortedLanguages.find(l => l.code === selectedLanguageCode)?.name}
									</span>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="termsOfUse" className="flex items-center gap-2">
											<FileText className="h-4 w-4" />
											Kullanım Şartları
										</Label>
										<RichTextEditor
											value={currentTranslation.termsOfUse || ""}
											onChange={(value) => updateCurrentTranslation("termsOfUse", value)}
											placeholder="Kullanım şartlarını giriniz..."
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="privacyPolicy" className="flex items-center gap-2">
											<Shield className="h-4 w-4" />
											Gizlilik Politikası
										</Label>
										<RichTextEditor
											value={currentTranslation.privacyPolicy || ""}
											onChange={(value) => updateCurrentTranslation("privacyPolicy", value)}
											placeholder="Gizlilik politikasını giriniz..."
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="cookiePolicy" className="flex items-center gap-2">
											<Cookie className="h-4 w-4" />
											Çerez Politikası
										</Label>
										<RichTextEditor
											value={currentTranslation.cookiePolicy || ""}
											onChange={(value) => updateCurrentTranslation("cookiePolicy", value)}
											placeholder="Çerez politikasını giriniz..."
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="footerDescription" className="flex items-center gap-2">
											<FileText className="h-4 w-4" />
											Footer Açıklaması
										</Label>
										<Textarea
											id="footerDescription"
											value={currentTranslation.footerDescription || ""}
											onChange={(e) => updateCurrentTranslation("footerDescription", e.target.value)}
											placeholder="Footer açıklamasını giriniz..."
											className="min-h-[100px]"
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/settings")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateSettingsMutation.isPending}
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[120px]"
						>
							{updateSettingsMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Kaydediliyor...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Kaydet
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

