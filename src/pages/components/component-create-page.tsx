import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateComponent } from "@/hooks/use-components";
import { useComponentTypes } from "@/hooks/use-component-type";
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
import { ArrowLeft, Save, Box, Plus, X, Loader2, Upload, Image as ImageIcon, Languages as LanguagesIcon, FileImage, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { translateText } from "@/services/translation-service";
import { toast } from "sonner";
import type { componentRequest, localization } from "@/types/components.types";
import type { assetRequest } from "@/types/assets.types";

export default function ComponentCreatePage() {
	const navigate = useNavigate();
	const createComponentMutation = useCreateComponent();
	
	// Component types ve languages için data fetching
	const { data: componentTypesData } = useComponentTypes("", 0, 1000, "id,ASC");
	const { data: languagesData } = useLanguages(0, 1000, "id,ASC");
	
	const componentTypes = componentTypesData?.content || [];
	const languages = languagesData?.content || [];

	const [formData, setFormData] = useState<componentRequest>({
		name: "",
		typeId: 0,
		value: "",
		localizations: [],
		assets: [],
		link: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [activeLanguageTab, setActiveLanguageTab] = useState<string>("");
	const [isTranslating, setIsTranslating] = useState(false);

	// Languages yüklendiğinde localizations'ı initialize et
	useEffect(() => {
		if (languages.length > 0 && formData.localizations.length === 0) {
			setFormData(prev => ({
				...prev,
				localizations: languages.map(lang => ({
					languageCode: lang.code,
					title: "",
					description: "",
					excerpt: "",
				}))
			}));
			// İlk dili aktif tab olarak ayarla
			if (languages.length > 0 && !activeLanguageTab) {
				setActiveLanguageTab(languages[0].code);
			}
		}
	}, [languages]);

	// Çeviri fonksiyonu
	const handleTranslate = async (sourceLanguageCode: string) => {
		const sourceIndex = formData.localizations.findIndex(loc => loc.languageCode === sourceLanguageCode);
		if (sourceIndex === -1) {
			toast.error("Kaynak dil bulunamadı");
			return;
		}

		const sourceLoc = formData.localizations[sourceIndex];
		if (!sourceLoc.title && !sourceLoc.excerpt && !sourceLoc.description) {
			toast.error("Çevrilecek içerik bulunamadı");
			return;
		}

		setIsTranslating(true);
		try {
			// Tüm dilleri çevir
			const translationPromises = formData.localizations
				.filter((_, index) => index !== sourceIndex)
				.map(async (targetLoc) => {
					const updates: Partial<localization> = {};

					// Başlık çevirisi
					if (sourceLoc.title) {
						try {
							const titleTranslation = await translateText({
								sourceLanguage: sourceLanguageCode,
								targetLanguage: targetLoc.languageCode,
								text: sourceLoc.title,
							});
							updates.title = titleTranslation.translatedText;
						} catch (error) {
							console.error(`Title translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					// Özet çevirisi
					if (sourceLoc.excerpt) {
						try {
							const excerptTranslation = await translateText({
								sourceLanguage: sourceLanguageCode,
								targetLanguage: targetLoc.languageCode,
								text: sourceLoc.excerpt,
							});
							updates.excerpt = excerptTranslation.translatedText;
						} catch (error) {
							console.error(`Excerpt translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					// Açıklama çevirisi (HTML içeriği için)
					if (sourceLoc.description) {
						try {
							// HTML tag'lerini temizle
							const plainText = sourceLoc.description.replace(/<[^>]*>/g, "");
							if (plainText.trim()) {
								const descTranslation = await translateText({
									sourceLanguage: sourceLanguageCode,
									targetLanguage: targetLoc.languageCode,
									text: plainText,
								});
								updates.description = descTranslation.translatedText;
							}
						} catch (error) {
							console.error(`Description translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					return { targetIndex: formData.localizations.findIndex(loc => loc.languageCode === targetLoc.languageCode), updates };
				});

			const results = await Promise.all(translationPromises);

			// Çevirileri formData'ya uygula
			setFormData(prev => ({
				...prev,
				localizations: prev.localizations.map((loc, index) => {
					const result = results.find(r => r.targetIndex === index);
					if (result) {
						return { ...loc, ...result.updates };
					}
					return loc;
				})
			}));

			toast.success("Çeviriler başarıyla tamamlandı");
		} catch (error) {
			toast.error("Çeviri sırasında bir hata oluştu");
			console.error("Translation error:", error);
		} finally {
			setIsTranslating(false);
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim()) {
			newErrors.name = "Ad gereklidir";
		}
		if (!formData.typeId || formData.typeId === 0) {
			newErrors.typeId = "Tip seçimi gereklidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLocalizationChange = (index: number, field: keyof localization, value: string) => {
		setFormData(prev => ({
			...prev,
			localizations: prev.localizations.map((loc, i) =>
				i === index ? { ...loc, [field]: value } : loc
			)
		}));
	};

	const handleAssetFileChange = (assetIndex: number, file: File | null) => {
		if (!file) return;
		setFormData(prev => ({
			...prev,
			assets: prev.assets.map((asset, i) =>
				i === assetIndex ? { ...asset, file } : asset
			)
		}));
	};

	const handleAssetLocalizationChange = (assetIndex: number, locIndex: number, field: keyof localization, value: string) => {
		setFormData(prev => ({
			...prev,
			assets: prev.assets.map((asset, i) => {
				if (i === assetIndex) {
					return {
						...asset,
						localizations: asset.localizations.map((loc, j) =>
							j === locIndex ? { ...loc, [field]: value } : loc
						)
					};
				}
				return asset;
			})
		}));
	};

	const addAsset = () => {
		setFormData(prev => ({
			...prev,
			assets: [
				...prev.assets,
				{
					type: "",
					file: undefined,
					localizations: languages.map(lang => ({
						languageCode: lang.code,
						title: "",
						description: "",
						subdescription: "",
					}))
				}
			]
		}));
	};

	const removeAsset = (index: number) => {
		setFormData(prev => ({
			...prev,
			assets: prev.assets.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createComponentMutation.mutateAsync(formData);
				navigate("/components");
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
					onClick={() => navigate("/components")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Bileşen Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir bileşen oluşturun</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Box className="h-5 w-5 text-muted-foreground" />
						Bileşen Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bileşen için gerekli bilgileri giriniz</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Basic Fields */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* Name Field */}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-p3 font-semibold flex items-center gap-2">
								<Box className="h-4 w-4 text-muted-foreground" />
								Ad
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className={`h-11 ${
									errors.name ? "border-destructive focus-visible:ring-destructive" : ""
								}`}
								placeholder="Bileşen adı giriniz"
							/>
							{errors.name && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.name}
								</p>
							)}
						</div>

						{/* Type Field */}
						<div className="space-y-2">
							<Label htmlFor="typeId" className="text-p3 font-semibold flex items-center gap-2">
								<Box className="h-4 w-4 text-muted-foreground" />
								Tip
							</Label>
							<Select
								value={formData.typeId.toString()}
								onValueChange={(value) => setFormData({ ...formData, typeId: parseInt(value) })}
							>
								<SelectTrigger className={`h-11 ${
									errors.typeId ? "border-destructive focus-visible:ring-destructive" : ""
								}`}>
									<SelectValue placeholder="Tip seçiniz" />
								</SelectTrigger>
								<SelectContent>
									{componentTypes.map((type) => (
										<SelectItem key={type.id} value={type.id.toString()}>
											{type.type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.typeId && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.typeId}
								</p>
							)}
						</div>
					</div>

					{/* Value Field */}
					<div className="space-y-2">
						<Label htmlFor="value" className="text-p3 font-semibold">
							Değer
						</Label>
						<Input
							id="value"
							value={formData.value}
							onChange={(e) => setFormData({ ...formData, value: e.target.value })}
							className="h-11"
							placeholder="Değer giriniz (opsiyonel)"
						/>
					</div>

					{/* Link Field */}
					<div className="space-y-2">
						<Label htmlFor="link" className="text-p3 font-semibold">
							Link
						</Label>
						<Input
							id="link"
							value={formData.link}
							onChange={(e) => setFormData({ ...formData, link: e.target.value })}
							className="h-11"
							placeholder="Link giriniz (opsiyonel)"
						/>
					</div>

					{/* Localizations Section */}
					<div className="space-y-4 pt-4 border-t border-border">
						<div className="flex items-center justify-between">
							<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
								<LanguagesIcon className="h-5 w-5" />
								Çeviriler
							</h3>
							{activeLanguageTab && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => handleTranslate(activeLanguageTab)}
									disabled={isTranslating}
									className="gap-2"
								>
									<RefreshCw className={`h-4 w-4 ${isTranslating ? "animate-spin" : ""}`} />
									Diğer Dilleri Çevir
								</Button>
							)}
						</div>
						{formData.localizations.length > 0 && (
							<Tabs value={activeLanguageTab} onValueChange={setActiveLanguageTab} className="w-full">
								<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${formData.localizations.length}, minmax(0, 1fr))` }}>
									{formData.localizations.map((localization, index) => {
										const language = languages.find(l => l.code === localization.languageCode);
										return (
											<TabsTrigger key={index} value={localization.languageCode}>
												{language?.code.toUpperCase() || localization.languageCode}
											</TabsTrigger>
										);
									})}
								</TabsList>
								{formData.localizations.map((localization, index) => {
									const language = languages.find(l => l.code === localization.languageCode);
									return (
										<TabsContent key={index} value={localization.languageCode} className="mt-4">
											<div className="space-y-3">
												<div className="space-y-2">
													<Label className="text-p3 font-semibold">Başlık *</Label>
													<Input
														value={localization.title}
														onChange={(e) => handleLocalizationChange(index, "title", e.target.value)}
														className="h-11"
														placeholder={`${language?.code.toUpperCase() || localization.languageCode} başlığını girin`}
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-p3 font-semibold">Özet</Label>
													<Input
														value={localization.excerpt}
														onChange={(e) => handleLocalizationChange(index, "excerpt", e.target.value)}
														className="h-11"
														placeholder={`${language?.code.toUpperCase() || localization.languageCode} özetini girin`}
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-p3 font-semibold">Açıklama *</Label>
													<RichTextEditor
														value={localization.description}
														onChange={(content) => handleLocalizationChange(index, "description", content)}
														placeholder={`${language?.code.toUpperCase() || localization.languageCode} açıklamasını girin`}
														height={400}
													/>
												</div>
											</div>
										</TabsContent>
									);
								})}
							</Tabs>
						)}
					</div>

					{/* Assets Section */}
					<div className="space-y-4 pt-4 border-t border-border">
						<div className="flex items-center justify-between">
							<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
								<FileImage className="h-5 w-5" />
								Setler
							</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addAsset}
							>
								<Plus className="h-4 w-4 mr-2" />
								Set Ekle
							</Button>
						</div>
						<div className="space-y-4">
							{formData.assets.map((asset, assetIndex) => (
								<div key={assetIndex} className="p-4 rounded-lg border border-border bg-muted/30">
									<div className="flex items-center justify-between mb-4">
										<h4 className="text-p3 font-semibold text-foreground">
											Set {assetIndex + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeAsset(assetIndex)}
											className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									<div className="space-y-3">
										{/* Asset Type */}
										<div className="space-y-2">
											<Label className="text-xs font-medium text-muted-foreground">Tip</Label>
											<Input
												value={asset.type}
												onChange={(e) => setFormData(prev => ({
													...prev,
													assets: prev.assets.map((a, i) =>
														i === assetIndex ? { ...a, type: e.target.value } : a
													)
												}))}
												className="h-10"
												placeholder="Set tipi giriniz"
											/>
										</div>
										{/* Asset File */}
										<div className="space-y-2">
											<Label className="text-xs font-medium text-muted-foreground">Dosya</Label>
											<label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
												<div className="flex flex-col items-center justify-center pt-3 pb-2">
													<Upload className="h-6 w-6 text-muted-foreground mb-1" />
													<p className="text-xs text-muted-foreground">
														<span className="font-semibold">Dosya yüklemek için tıklayın</span>
													</p>
												</div>
												<input
													type="file"
													className="hidden"
													accept="image/*,video/*,application/*"
													onChange={(e) => handleAssetFileChange(assetIndex, e.target.files?.[0] || null)}
												/>
											</label>
											{asset.file && (
												<p className="text-xs text-muted-foreground">
													Seçili: {asset.file instanceof File ? asset.file.name : asset.file}
												</p>
											)}
										</div>
										{/* Asset Localizations */}
										<div className="space-y-3 pt-2 border-t border-border">
											<Label className="text-xs font-medium text-muted-foreground">Çeviriler</Label>
											{asset.localizations.length > 0 && (
												<Tabs defaultValue={asset.localizations[0]?.languageCode || ""} className="w-full">
													<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${asset.localizations.length}, minmax(0, 1fr))` }}>
														{asset.localizations.map((loc, locIndex) => {
															const language = languages.find(l => l.code === loc.languageCode);
															return (
																<TabsTrigger key={locIndex} value={loc.languageCode} className="text-xs">
																	{language?.code.toUpperCase() || loc.languageCode}
																</TabsTrigger>
															);
														})}
													</TabsList>
													{asset.localizations.map((loc, locIndex) => {
														const language = languages.find(l => l.code === loc.languageCode);
														return (
															<TabsContent key={locIndex} value={loc.languageCode} className="mt-3">
																<div className="space-y-2">
																	<Input
																		value={loc.title}
																		onChange={(e) => handleAssetLocalizationChange(assetIndex, locIndex, "title", e.target.value)}
																		className="h-9 text-xs"
																		placeholder="Başlık"
																	/>
																	<RichTextEditor
																		value={loc.description}
																		onChange={(content) => handleAssetLocalizationChange(assetIndex, locIndex, "description", content)}
																		placeholder={`${language?.code.toUpperCase() || loc.languageCode} açıklamasını girin`}
																		height={250}
																	/>
																	<RichTextEditor
																		value={loc.subdescription}
																		onChange={(content) => handleAssetLocalizationChange(assetIndex, locIndex, "subdescription", content)}
																		placeholder={`${language?.code.toUpperCase() || loc.languageCode} alt açıklamasını girin`}
																		height={250}
																	/>
																</div>
															</TabsContent>
														);
													})}
												</Tabs>
											)}
										</div>
									</div>
								</div>
							))}
							{formData.assets.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									<p className="text-p3">Henüz set eklenmemiş</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addAsset}
										className="mt-4"
									>
										<Plus className="h-4 w-4 mr-2" />
										İlk Seti Ekle
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/components")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createComponentMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{createComponentMutation.isPending ? (
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
	);
}

