import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAsset } from "@/hooks/use-assets";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Image as ImageIcon, Upload, XCircle, Globe, RefreshCw, FileImage } from "lucide-react";
import { toast } from "sonner";
import type { assetRequest } from "@/types/assets.types";
import { translateText, translateHtml } from "@/services/translate-service";

const ASSET_TYPES = [
	{ value: "IMAGE", label: "Görsel" },
	{ value: "VIDEO", label: "Video" },
];

export default function AssetCreatePage() {
	const navigate = useNavigate();
	const createAssetMutation = useCreateAsset();
	
	// Languages listesi için
	const { data: languagesData } = useLanguages(0, 100, "code,asc");
	const languages = languagesData?.content || [];

	const [formData, setFormData] = useState<assetRequest>({
		file: undefined,
		type: "",
		localizations: [],
	});

	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");
	const [translating, setTranslating] = useState(false);

	// Tüm dilleri otomatik olarak ekle ve ilk dili seç
	useEffect(() => {
		if (languages.length > 0 && formData.localizations.length === 0) {
			setFormData((prev) => ({
				...prev,
				localizations: languages.map((lang) => ({
					languageCode: lang.code,
					title: "",
					description: "",
					subdescription: "",
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
							subdescription: "",
						},
					],
				}));
			}
		}
	}, [selectedLanguageCode]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.file) {
			newErrors.file = "Dosya gereklidir";
		}
		if (!formData.type || !formData.type.trim()) {
			newErrors.type = "Tip gereklidir";
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
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, file });
			const reader = new FileReader();
			reader.onloadend = () => {
				setFilePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const currentLocalization = formData.localizations.find(
		(loc) => loc.languageCode === selectedLanguageCode
	) || {
		languageCode: selectedLanguageCode,
		title: "",
		description: "",
		subdescription: "",
	};

	const selectedLanguage = languages.find((lang) => lang.code === selectedLanguageCode);

	const handleLocalizationChange = (field: "title" | "description" | "subdescription", value: string) => {
		setFormData((prev) => ({
			...prev,
			localizations: prev.localizations.map((loc) =>
				loc.languageCode === selectedLanguageCode
					? { ...loc, [field]: value }
					: loc
			),
		}));
	};

	const handleTranslate = async () => {
		if (!selectedLanguageCode) {
			toast.error("Lütfen önce bir dil seçin");
			return;
		}

		const sourceLocalization = formData.localizations.find(
			(loc) => loc.languageCode === selectedLanguageCode
		);

		if (!sourceLocalization || !sourceLocalization.title) {
			toast.error("Çeviri için kaynak dilde başlık gereklidir");
			return;
		}

		setTranslating(true);
		try {
			const sourceTitle = sourceLocalization.title;
			const sourceDescription = sourceLocalization.description || "";
			const sourceSubdescription = sourceLocalization.subdescription || "";

			const newLocalizations = [...formData.localizations];

			const translatePromises = languages
				.filter((lang) => lang.code !== selectedLanguageCode)
				.map(async (lang) => {
					const targetIndex = newLocalizations.findIndex(
						(loc) => loc.languageCode === lang.code
					);

					if (targetIndex === -1) {
						newLocalizations.push({
							languageCode: lang.code,
							title: "",
							description: "",
							subdescription: "",
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

					// Alt açıklama çevir
					if (sourceSubdescription) {
						try {
							const translatedSubdescription = await translateText(sourceSubdescription, lang.code, selectedLanguageCode);
							newLocalizations[finalIndex] = {
								...newLocalizations[finalIndex],
								subdescription: translatedSubdescription,
							};
						} catch (error) {
							console.error(`Subdescription translation error for ${lang.code}:`, error);
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
				await createAssetMutation.mutateAsync(formData);
				navigate("/assets");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/assets")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Yeni Set Oluştur
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Yeni bir set ekleyin
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
							<FileImage className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Set Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Yeni set için gerekli bilgileri giriniz</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Type Field */}
					<div className="space-y-2">
						<Label htmlFor="type" className="text-p3 font-semibold flex items-center gap-2">
							<FileImage className="h-4 w-4 text-muted-foreground" />
							Tip <span className="text-destructive">*</span>
						</Label>
						<Select
							value={formData.type}
							onValueChange={(value) => setFormData({ ...formData, type: value })}
						>
							<SelectTrigger className={`h-11 ${
								errors.type ? "border-destructive focus-visible:ring-destructive" : ""
							}`}>
								<SelectValue placeholder="Tip seçiniz" />
							</SelectTrigger>
							<SelectContent>
								{ASSET_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.type && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.type}
							</p>
						)}
					</div>

					{/* File Field */}
					<div className="space-y-2">
						<Label htmlFor="file" className="text-p3 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
							Dosya <span className="text-destructive">*</span>
						</Label>
						{filePreview ? (
							<div className="relative inline-block">
								<div className="relative group">
									<img
										src={filePreview}
										alt="Preview"
										className="h-32 w-32 rounded-xl object-cover border-2 border-border shadow-lg"
									/>
									<button
										type="button"
										onClick={() => {
											setFilePreview(null);
											setFormData({ ...formData, file: undefined });
										}}
										className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center shadow-lg transition-colors group-hover:scale-110"
										aria-label="Dosyayı kaldır"
									>
										<XCircle className="h-4 w-4" />
									</button>
								</div>
								<label
									htmlFor="file"
									className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors text-p3 font-semibold"
								>
									<Upload className="h-4 w-4 text-muted-foreground" />
									Dosyayı Değiştir
								</label>
								<Input
									id="file"
									type="file"
									accept="image/*,video/*,.pdf,.doc,.docx"
									onChange={handleFileChange}
									className="hidden"
								/>
							</div>
						) : (
							<label
								htmlFor="file"
								className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-all hover:border-primary group"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
									<p className="text-p3 font-semibold text-foreground mb-2">
										Dosya Yükle
									</p>
									<p className="text-p3 text-muted-foreground text-center px-4">
										Resim, Video veya Döküman (Max. 10MB)
									</p>
								</div>
								<Input
									id="file"
									type="file"
									accept="image/*,video/*,.pdf,.doc,.docx"
									onChange={handleFileChange}
									className="hidden"
								/>
							</label>
						)}
						{errors.file && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.file}
							</p>
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
												: "border-border hover:bg-accent"
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
										className="h-11 border-input focus-visible:ring-ring"
										placeholder={`${selectedLanguage?.code?.toUpperCase() || ""} başlığını girin`}
									/>
									{formData.localizations.map((loc, index) => {
										if (loc.languageCode !== selectedLanguageCode) return null;
										return errors[`localizations.${index}.title`] ? (
											<p key={index} className="text-p3 text-destructive flex items-center gap-1">
												<span>•</span>
												{errors[`localizations.${index}.title`]}
											</p>
										) : null;
									})}
								</div>

								{/* Açıklama */}
								<div className="space-y-2">
									<Label className="text-p3 font-semibold">
										Açıklama
									</Label>
									<RichTextEditor
										value={currentLocalization.description}
										onChange={(value) => handleLocalizationChange("description", value)}
										placeholder={`${selectedLanguage?.code?.toUpperCase() || ""} açıklamasını girin`}
									/>
								</div>

								{/* Alt Açıklama */}
								<div className="space-y-2">
									<Label className="text-p3 font-semibold">
										Alt Açıklama
									</Label>
									<Input
										value={currentLocalization.subdescription}
										onChange={(e) => handleLocalizationChange("subdescription", e.target.value)}
										className="h-11 border-input focus-visible:ring-ring"
										placeholder={`${selectedLanguage?.code?.toUpperCase() || ""} alt açıklamasını girin`}
									/>
								</div>
							</>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/assets")}
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createAssetMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{createAssetMutation.isPending ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

