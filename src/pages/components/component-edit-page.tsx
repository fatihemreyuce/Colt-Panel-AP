import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateComponent, useGetComponentById } from "@/hooks/use-components";
import { useComponentTypes } from "@/hooks/use-component-type";
import { useLanguages } from "@/hooks/use-languages";
import { useAssets } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Box, Loader2 } from "lucide-react";
import { translateText } from "@/services/translate-service";
import { toast } from "sonner";
import { ComponentBasicFields } from "@/components/component-basic-fields";
import { ComponentLocalizations } from "@/components/component-localizations";
import { AssetList } from "@/components/asset-list";
import type { componentRequest, localization } from "@/types/components.types";
import type { localization as assetLocalization } from "@/types/assets.types";

export default function ComponentEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const componentId = id ? parseInt(id) : 0;
	const { data: component, isLoading: isLoadingComponent } = useGetComponentById(componentId);
	const updateComponentMutation = useUpdateComponent();
	
	// Component types ve languages için data fetching
	const { data: componentTypesData } = useComponentTypes("", 0, 1000, "id,ASC");
	const { data: languagesData } = useLanguages(0, 1000, "id,ASC");
	const { data: assetsData } = useAssets("", 0, 1000, "id,ASC");
	
	const componentTypes = componentTypesData?.content || [];
	const languages = languagesData?.content || [];
	const availableAssets = assetsData?.content || [];

	const [formData, setFormData] = useState<componentRequest>({
		name: "",
		typeId: 0,
		value: "",
		localizations: [],
		assets: [],
		link: "",
		sortOrder: 0,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [activeLanguageTab, setActiveLanguageTab] = useState<string>("");
	const [isTranslating, setIsTranslating] = useState(false);
	const [assetActiveTabs, setAssetActiveTabs] = useState<Record<number, string>>({});
	const [isTranslatingAsset, setIsTranslatingAsset] = useState<Record<number, boolean>>({});
	const [selectedMediaId, setSelectedMediaId] = useState<string>("");

	// Tip seçildiğinde veya değiştiğinde Value ve Link alanlarını otomatik güncelle
	useEffect(() => {
		if (formData.typeId && formData.typeId !== 0 && componentTypes.length > 0) {
			const selectedType = componentTypes.find(type => type.id === formData.typeId);
			if (selectedType) {
				setFormData(prev => {
					const updates: Partial<componentRequest> = {};
					
					// Value alanını güncelle (eğer tip value destekliyorsa)
					if (selectedType.hasValue) {
						updates.value = selectedType.type.toLowerCase().replace(/\s+/g, '-');
					} else {
						updates.value = "";
					}
					
					// Link alanını güncelle (eğer tip link destekliyorsa)
					if (selectedType.hasLink) {
						updates.link = `#${selectedType.type.toLowerCase().replace(/\s+/g, '-')}`;
					} else {
						updates.link = "";
					}
					
					return { ...prev, ...updates };
				});
			}
		}
	}, [formData.typeId, componentTypes]);

	// Component yüklendiğinde formData'yı doldur
	useEffect(() => {
		if (component && languages.length > 0) {
			// Mevcut localizations'ı koru veya eksik dilleri ekle
			const existingLocalizations = component.localizations || [];
			const allLocalizations = languages.map(lang => {
				const existing = existingLocalizations.find(loc => loc.languageCode === lang.code);
				return existing || {
					languageCode: lang.code,
					title: "",
					description: "",
					excerpt: "",
					subdescription: "",
				};
			});

			// Mevcut assets'ı koru
			const existingAssets = (component.assets || []).map(asset => ({
				type: asset.type,
				file: asset.url, // Mevcut URL'i koru
				localizations: asset.localizations || languages.map(lang => ({
					languageCode: lang.code,
					title: "",
					description: "",
					subdescription: "",
				}))
			}));

			setFormData({
				name: component.name || "",
				typeId: component.typeId || 0,
				value: component.value || "",
				localizations: allLocalizations,
				assets: existingAssets,
				link: component.link || "",
				sortOrder: component.sortOrder || 0,
			});
			// İlk dili aktif tab olarak ayarla
			if (allLocalizations.length > 0 && !activeLanguageTab) {
				setActiveLanguageTab(allLocalizations[0].languageCode);
			}
		}
	}, [component, languages]);

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
					if (sourceLoc.title && sourceLoc.title.trim()) {
						try {
							const titleTranslation = await translateText(
								sourceLoc.title,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.title = titleTranslation;
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Title translation failed for ${targetLoc.languageCode}:`, errorMessage);
							// Backend hatası için daha açıklayıcı mesaj
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Başlık çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
						}
					}

					// Özet çevirisi
					if (sourceLoc.excerpt && sourceLoc.excerpt.trim()) {
						try {
							const excerptTranslation = await translateText(
								sourceLoc.excerpt,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.excerpt = excerptTranslation;
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Excerpt translation failed for ${targetLoc.languageCode}:`, errorMessage);
							// Backend hatası için daha açıklayıcı mesaj
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Özet çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
						}
					}

					// Açıklama çevirisi (HTML içeriği için)
					if (sourceLoc.description) {
						try {
							// HTML tag'lerini temizle
							const plainText = sourceLoc.description.replace(/<[^>]*>/g, "");
							if (plainText.trim()) {
								const descTranslation = await translateText(
									plainText,
									targetLoc.languageCode,
									sourceLanguageCode
								);
								updates.description = descTranslation;
							}
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Description translation failed for ${targetLoc.languageCode}:`, errorMessage);
							// Backend hatası için daha açıklayıcı mesaj
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Açıklama çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
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

			// Başarılı çeviri sayısını kontrol et
			const successfulTranslations = results.filter(r => r.updates && Object.keys(r.updates).length > 0).length;
			if (successfulTranslations > 0) {
				toast.success(`${successfulTranslations} dil için çeviriler tamamlandı`);
			} else {
				toast.warning("Çeviriler tamamlandı ancak bazı çeviriler başarısız oldu. Lütfen manuel olarak kontrol edin.");
			}
		} catch (error: any) {
			if (error?.status === 500) {
				toast.error("Çeviri servisi şu anda kullanılamıyor. Lütfen backend servisini kontrol edin veya daha sonra tekrar deneyin.", {
					duration: 6000,
				});
			} else {
				toast.error("Çeviri sırasında bir hata oluştu");
			}
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

	const handleAssetLocalizationChange = (assetIndex: number, locIndex: number, field: keyof assetLocalization, value: string) => {
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

	// Asset çeviri fonksiyonu
	const handleAssetTranslate = async (assetIndex: number, sourceLanguageCode: string) => {
		const asset = formData.assets[assetIndex];
		if (!asset) {
			toast.error("Medya bulunamadı");
			return;
		}

		const sourceIndex = asset.localizations.findIndex(loc => loc.languageCode === sourceLanguageCode);
		if (sourceIndex === -1) {
			toast.error("Kaynak dil bulunamadı");
			return;
		}

		const sourceLoc = asset.localizations[sourceIndex];
		if (!sourceLoc.title && !sourceLoc.description && !sourceLoc.subdescription) {
			toast.error("Çevrilecek içerik bulunamadı");
			return;
		}

		setIsTranslatingAsset(prev => ({ ...prev, [assetIndex]: true }));
		try {
			// Tüm dilleri çevir
			const translationPromises = asset.localizations
				.filter((_, index) => index !== sourceIndex)
				.map(async (targetLoc) => {
					const updates: Partial<assetLocalization> = {};

					// Başlık çevirisi
					if (sourceLoc.title && sourceLoc.title.trim()) {
						try {
							const titleTranslation = await translateText(
								sourceLoc.title,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.title = titleTranslation;
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Asset title translation failed for ${targetLoc.languageCode}:`, errorMessage);
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Başlık çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
						}
					}

					// Açıklama çevirisi
					if (sourceLoc.description) {
						try {
							const plainText = sourceLoc.description.replace(/<[^>]*>/g, "");
							if (plainText.trim()) {
								const descTranslation = await translateText(
									plainText,
									targetLoc.languageCode,
									sourceLanguageCode
								);
								updates.description = descTranslation;
							}
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Asset description translation failed for ${targetLoc.languageCode}:`, errorMessage);
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Açıklama çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
						}
					}

					// Alt açıklama çevirisi
					if (sourceLoc.subdescription) {
						try {
							const plainText = sourceLoc.subdescription.replace(/<[^>]*>/g, "");
							if (plainText.trim()) {
								const subdescTranslation = await translateText(
									plainText,
									targetLoc.languageCode,
									sourceLanguageCode
								);
								updates.subdescription = subdescTranslation;
							}
						} catch (error: any) {
							const errorMessage = error?.message || error?.data?.message || "An internal server error occurred. Please try again later.";
							console.error(`Asset subdescription translation failed for ${targetLoc.languageCode}:`, errorMessage);
							if (error?.status === 500) {
								toast.error(`Çeviri servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. (${targetLoc.languageCode.toUpperCase()})`, {
									duration: 5000,
								});
							} else {
								toast.error(`Alt açıklama çevirisi başarısız (${targetLoc.languageCode.toUpperCase()}): ${errorMessage}`);
							}
						}
					}

					return { targetIndex: asset.localizations.findIndex(loc => loc.languageCode === targetLoc.languageCode), updates };
				});

			const results = await Promise.all(translationPromises);

			// Çevirileri formData'ya uygula
			setFormData(prev => ({
				...prev,
				assets: prev.assets.map((a, i) => {
					if (i === assetIndex) {
						return {
							...a,
							localizations: a.localizations.map((loc, index) => {
								const result = results.find(r => r.targetIndex === index);
								if (result) {
									return { ...loc, ...result.updates };
								}
								return loc;
							})
						};
					}
					return a;
				})
			}));

			// Başarılı çeviri sayısını kontrol et
			const successfulTranslations = results.filter(r => r.updates && Object.keys(r.updates).length > 0).length;
			if (successfulTranslations > 0) {
				toast.success(`${successfulTranslations} dil için çeviriler tamamlandı`);
			} else {
				toast.warning("Çeviriler tamamlandı ancak bazı çeviriler başarısız oldu. Lütfen manuel olarak kontrol edin.");
			}
		} catch (error: any) {
			if (error?.status === 500) {
				toast.error("Çeviri servisi şu anda kullanılamıyor. Lütfen backend servisini kontrol edin veya daha sonra tekrar deneyin.", {
					duration: 6000,
				});
			} else {
				toast.error("Çeviri sırasında bir hata oluştu");
			}
			console.error("Asset translation error:", error);
		} finally {
			setIsTranslatingAsset(prev => ({ ...prev, [assetIndex]: false }));
		}
	};

	const addAsset = (assetId?: string) => {
		if (assetId) {
			// Mevcut asset'ı seç
			const selectedAsset = availableAssets.find(a => a.id.toString() === assetId);
			if (selectedAsset) {
				// Bu asset zaten ekli mi kontrol et
				const isAlreadyAdded = formData.assets.some(a => 
					a.assetId === selectedAsset.id
				);
				
				if (isAlreadyAdded) {
					toast.warning("Bu medya zaten eklenmiş");
					return;
				}
				
				setFormData(prev => ({
					...prev,
					assets: [
						...prev.assets,
						{
							type: selectedAsset.type,
							assetId: selectedAsset.id,
							localizations: selectedAsset.localizations.length > 0 
								? selectedAsset.localizations 
								: languages.map(lang => ({
									languageCode: lang.code,
									title: "",
									description: "",
									subdescription: "",
								}))
						}
					]
				}));
				toast.success("Medya başarıyla eklendi");
			}
		} else {
			// Yeni boş asset ekle
			setFormData(prev => ({
				...prev,
				assets: [
					...prev.assets,
					{
						type: undefined,
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
		}
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
				await updateComponentMutation.mutateAsync({
					id: componentId,
					component: formData,
				});
				navigate("/components");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoadingComponent) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!component) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Bileşen bulunamadı</p>
					<Button
						onClick={() => navigate("/components")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
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
					onClick={() => navigate("/components")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Bileşen Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Bileşen bilgilerini güncelleyin</p>
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
					<p className="text-p3 text-muted-foreground mt-1">Bileşen bilgilerini güncelleyin</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<ComponentBasicFields
						name={formData.name}
						typeId={formData.typeId}
						value={formData.value}
						link={formData.link}
						componentTypes={componentTypes}
						errors={errors}
						onNameChange={(value) => setFormData({ ...formData, name: value })}
						onTypeChange={(value) => setFormData({ ...formData, typeId: value })}
					/>

					<ComponentLocalizations
						localizations={formData.localizations}
						languages={languages}
						activeLanguageTab={activeLanguageTab}
						isTranslating={isTranslating}
						onTabChange={setActiveLanguageTab}
						onLocalizationChange={handleLocalizationChange}
						onTranslate={handleTranslate}
					/>

					<AssetList
						assets={formData.assets}
						availableAssets={availableAssets}
						languages={languages}
						selectedMediaId={selectedMediaId}
						assetActiveTabs={assetActiveTabs}
						isTranslatingAsset={isTranslatingAsset}
						onSelectMedia={setSelectedMediaId}
						onAddAsset={addAsset}
						onRemoveAsset={removeAsset}
						onAssetTypeChange={(assetIndex, value) => setFormData(prev => ({
							...prev,
							assets: prev.assets.map((a, i) =>
								i === assetIndex ? { ...a, type: value } : a
							)
						}))}
						onAssetFileChange={handleAssetFileChange}
						onAssetLocalizationChange={handleAssetLocalizationChange}
						onAssetTabChange={(assetIndex, value) => setAssetActiveTabs(prev => ({ ...prev, [assetIndex]: value }))}
						onAssetTranslate={handleAssetTranslate}
					/>

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
							disabled={updateComponentMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{updateComponentMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

