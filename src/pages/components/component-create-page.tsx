import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateComponent, useCreateComponentAsset } from "@/hooks/use-components";
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

export default function ComponentCreatePage() {
	const navigate = useNavigate();
	const createComponentMutation = useCreateComponent();
	const createAssetMutation = useCreateComponentAsset();
	
	// Component types ve languages için data fetching
	const { data: componentTypesData } = useComponentTypes("", 0, 1000, "id,ASC");
	const { data: languagesData } = useLanguages(0, 1000, "id,ASC");
	const { data: assetsData } = useAssets("", 0, 1000, "id,ASC");
	
	const componentTypes = useMemo(() => componentTypesData?.content || [], [componentTypesData?.content]);
	const languages = useMemo(() => languagesData?.content || [], [languagesData?.content]);
	const availableAssets = useMemo(() => assetsData?.content || [], [assetsData?.content]);

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
	const [selectedMediaId, setSelectedMediaId] = useState<string>("");
	const [assetActiveTabs, setAssetActiveTabs] = useState<Record<number, string>>({});
	const [isTranslatingAsset, setIsTranslatingAsset] = useState<Record<number, boolean>>({});

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
					subdescription: "",
				}))
			}));
			// İlk dili aktif tab olarak ayarla
			if (languages.length > 0 && !activeLanguageTab) {
				setActiveLanguageTab(languages[0].code);
			}
		}
	}, [languages]);

	// Tip seçildiğinde veya değiştiğinde Value ve Link alanlarını otomatik güncelle
	const prevTypeIdRef = useRef<number>(0);
	useEffect(() => {
		// Sadece typeId gerçekten değiştiğinde çalış
		if (formData.typeId === prevTypeIdRef.current) {
			return;
		}
		prevTypeIdRef.current = formData.typeId;

		if (formData.typeId && formData.typeId !== 0 && componentTypes.length > 0) {
			const selectedType = componentTypes.find(type => type.id === formData.typeId);
			if (selectedType) {
				setFormData(prev => {
					const newValue = selectedType.hasValue 
						? selectedType.type.toLowerCase().replace(/\s+/g, '-')
						: "";
					const newLink = selectedType.hasLink
						? `#${selectedType.type.toLowerCase().replace(/\s+/g, '-')}`
						: "";
					
					// Sadece değerler gerçekten değiştiyse güncelle
					if (prev.value === newValue && prev.link === newLink) {
						return prev;
					}
					
					return {
						...prev,
						value: newValue,
						link: newLink,
					};
				});
			}
		} else if (formData.typeId === 0) {
			// Tip seçilmediğinde alanları temizle
			setFormData(prev => {
				if (prev.value === "" && prev.link === "") {
					return prev;
				}
				return {
					...prev,
					value: "",
					link: "",
				};
			});
		}
	}, [formData.typeId, componentTypes]);

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
				
				const newAssetIndex = formData.assets.length;
				const newLocalizations = selectedAsset.localizations.length > 0 
					? selectedAsset.localizations 
					: languages.map(lang => ({
						languageCode: lang.code,
						title: "",
						description: "",
						subdescription: "",
					}));
				const firstLanguageCode = newLocalizations[0]?.languageCode || languages[0]?.code || "";
				
				setFormData(prev => ({
					...prev,
					assets: [
						...prev.assets,
						{
							type: selectedAsset.type,
							assetId: selectedAsset.id,
							localizations: newLocalizations
						}
					]
				}));
				
				// İlk dil tab'ını aktif yap
				if (firstLanguageCode) {
					setAssetActiveTabs(prev => ({
						...prev,
						[newAssetIndex]: firstLanguageCode
					}));
				}
				
				toast.success("Medya başarıyla eklendi");
			}
		} else {
			// Yeni boş asset ekle
			const newAssetIndex = formData.assets.length;
			const newLocalizations = languages.map(lang => ({
				languageCode: lang.code,
				title: "",
				description: "",
				subdescription: "",
			}));
			const firstLanguageCode = newLocalizations[0]?.languageCode || languages[0]?.code || "";
			
			setFormData(prev => ({
				...prev,
				assets: [
					...prev.assets,
					{
						type: undefined,
						file: undefined,
						localizations: newLocalizations
					}
				]
			}));
			
			// İlk dil tab'ını aktif yap
			if (firstLanguageCode) {
				setAssetActiveTabs(prev => ({
					...prev,
					[newAssetIndex]: firstLanguageCode
				}));
			}
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
				// Component'i assets olmadan oluştur (backend assets'ı component ile birlikte kabul etmiyor)
				const componentWithoutAssets = {
					...formData,
					assets: []
				};
				const createdComponent = await createComponentMutation.mutateAsync(componentWithoutAssets);
				
				// Assets'ı ayrı ayrı ekle
				if (formData.assets.length > 0 && createdComponent?.id) {
					for (const asset of formData.assets) {
						try {
							await createAssetMutation.mutateAsync({
								componentId: createdComponent.id,
								asset: asset
							});
						} catch (assetError) {
							console.error("Asset eklenirken hata:", assetError);
							toast.error(`Medya eklenirken hata: ${assetError instanceof Error ? assetError.message : "Bilinmeyen hata"}`);
						}
					}
				}
				
				navigate("/components");
			} catch (error) {
				// Error handled by mutation
				console.error("Component oluşturulurken hata:", error);
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
						onClick={() => navigate("/components")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Yeni Bileşen Oluştur
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Yeni bir bileşen oluşturun
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
							<Box className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Bileşen Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Yeni bileşen için gerekli bilgileri giriniz</p>
						</div>
					</div>
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
						onValueChange={(value) => setFormData({ ...formData, value })}
						onLinkChange={(value) => setFormData({ ...formData, link: value })}
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
						componentTypeId={formData.typeId !== 0 ? formData.typeId : undefined}
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
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createComponentMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
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

