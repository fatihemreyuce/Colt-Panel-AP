import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdatePage, useGetPage } from "@/hooks/use-page";
import { usePageTypes } from "@/hooks/use-page-type";
import { useLanguages } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { ArrowLeft, Save, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { PageRequest, localizations } from "@/types/page.types";
import { translateText } from "@/services/translate-service";
import { toast } from "sonner";
import { PageBasicInfoStep } from "./steps/page-basic-info-step";
import { PageComponentsStep } from "./steps/page-components-step";
import { PageTeamMembersStep } from "./steps/page-team-members-step";
import { PageSummaryStep } from "./steps/page-summary-step";

const STEPS = [
	{ id: "basic", label: "Temel Bilgiler", description: "Sayfa bilgileri ve çeviriler" },
	{ id: "components", label: "Bileşenler", description: "Bileşen seçimi" },
	{ id: "team-members", label: "Takım Üyeleri", description: "Takım üyesi seçimi" },
	{ id: "summary", label: "Özet", description: "Kontrol ve kaydet" },
];

export default function PageEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const pageId = id ? parseInt(id, 10) : 0;
	const { data: page, isLoading } = useGetPage(pageId);
	const updatePageMutation = useUpdatePage();

	// Data fetching
	const { data: pageTypesData } = usePageTypes("", 0, 1000, "id,ASC");
	const { data: languagesData } = useLanguages(0, 1000, "id,ASC");

	const pageTypes = pageTypesData?.content || [];
	const languages = languagesData?.content || [];

	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<PageRequest>({
		slug: "",
		name: "",
		typeId: 0,
		fileAsset: undefined,
		fileAssetId: 0,
		imageAsset: undefined,
		imageAssetId: 0,
		localizations: [],
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [activeLanguageTab, setActiveLanguageTab] = useState<string>("");
	const [isTranslating, setIsTranslating] = useState(false);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// Load page data
	useEffect(() => {
		if (page) {
			setFormData({
				slug: page.slug,
				name: page.name,
				typeId: page.typeId,
				fileAsset: undefined,
				fileAssetId: page.file?.id || 0,
				imageAsset: undefined,
				imageAssetId: page.image?.id || 0,
				localizations: page.localizations || [],
			});
			if (page.file?.url) {
				setFilePreview(page.file.url);
			}
			if (page.image?.url) {
				setImagePreview(page.image.url);
			}
			if (page.localizations && page.localizations.length > 0) {
				setActiveLanguageTab(page.localizations[0].languageCode);
			}
		}
	}, [page]);

	// Initialize localizations when languages are loaded
	useEffect(() => {
		if (languages.length > 0 && formData.localizations.length === 0 && !page) {
			setFormData((prev) => ({
				...prev,
				localizations: languages.map((lang) => ({
					languageCode: lang.code,
					title: "",
					content: "",
					excerpt: "",
					metaTitle: "",
					metaDescription: "",
					metaKeywords: "",
				})),
			}));
			if (languages.length > 0 && !activeLanguageTab) {
				setActiveLanguageTab(languages[0].code);
			}
		}
	}, [languages, page, activeLanguageTab]);

	const validateBasicInfo = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.slug.trim()) {
			newErrors.slug = "Slug gereklidir";
		}
		if (!formData.name.trim()) {
			newErrors.name = "Ad gereklidir";
		}
		if (!formData.typeId || formData.typeId === 0) {
			newErrors.typeId = "Sayfa tipi seçilmelidir";
		}

		// Validate localizations
		formData.localizations.forEach((loc, index) => {
			if (!loc.title.trim()) {
				newErrors[`localizations.${index}.title`] = "Başlık gereklidir";
			}
			if (!loc.content.trim()) {
				newErrors[`localizations.${index}.content`] = "İçerik gereklidir";
			}
		});

		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) {
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
		}
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateBasicInfo()) {
			try {
				// Clean up formData before sending
				const cleanedFormData = { ...formData };
				// Remove fileAssetId and imageAssetId if they are 0
				if (cleanedFormData.fileAssetId === 0) {
					delete cleanedFormData.fileAssetId;
				}
				if (cleanedFormData.imageAssetId === 0) {
					delete cleanedFormData.imageAssetId;
				}
				// Remove fileAsset and imageAsset if they are undefined
				if (!cleanedFormData.fileAsset) {
					delete cleanedFormData.fileAsset;
				}
				if (!cleanedFormData.imageAsset) {
					delete cleanedFormData.imageAsset;
				}
				await updatePageMutation.mutateAsync({ id: pageId, page: cleanedFormData });
				navigate("/pages");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	const handleNext = () => {
		if (currentStep === 0) {
			// Validate basic info before moving to next step
			if (validateBasicInfo()) {
				setCurrentStep(1);
			}
		} else if (currentStep < STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepClick = (step: number) => {
		if (step < currentStep || step === currentStep) {
			setCurrentStep(step);
		} else if (step === currentStep + 1 && currentStep === 0) {
			// Allow going to next step if basic info is valid
			if (validateBasicInfo()) {
				setCurrentStep(step);
			}
		}
	};

	const handleLocalizationChange = (
		index: number,
		field: keyof localizations,
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			localizations: prev.localizations.map((loc, i) =>
				i === index ? { ...loc, [field]: value } : loc
			),
		}));
	};

	const handleTranslate = async (sourceLanguageCode: string) => {
		const sourceIndex = formData.localizations.findIndex(
			(loc) => loc.languageCode === sourceLanguageCode
		);
		if (sourceIndex === -1) {
			toast.error("Kaynak dil bulunamadı");
			return;
		}

		const sourceLoc = formData.localizations[sourceIndex];
		if (!sourceLoc.title && !sourceLoc.content && !sourceLoc.excerpt) {
			toast.error("Çevrilecek içerik bulunamadı");
			return;
		}

		setIsTranslating(true);
		try {
			const translationPromises = formData.localizations
				.filter((_, index) => index !== sourceIndex)
				.map(async (targetLoc) => {
					const updates: Partial<localizations> = {};

					if (sourceLoc.title && sourceLoc.title.trim()) {
						try {
							const titleTranslation = await translateText(
								sourceLoc.title,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.title = titleTranslation;
						} catch (error: any) {
							console.error(`Title translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					if (sourceLoc.excerpt && sourceLoc.excerpt.trim()) {
						try {
							const excerptTranslation = await translateText(
								sourceLoc.excerpt,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.excerpt = excerptTranslation;
						} catch (error: any) {
							console.error(`Excerpt translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					if (sourceLoc.content && sourceLoc.content.trim()) {
						try {
							const textContent = sourceLoc.content.replace(/<[^>]*>/g, "");
							const contentTranslation = await translateText(
								textContent,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.content = contentTranslation;
						} catch (error: any) {
							console.error(`Content translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					if (sourceLoc.metaTitle && sourceLoc.metaTitle.trim()) {
						try {
							const metaTitleTranslation = await translateText(
								sourceLoc.metaTitle,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.metaTitle = metaTitleTranslation;
						} catch (error: any) {
							console.error(`Meta title translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					if (sourceLoc.metaDescription && sourceLoc.metaDescription.trim()) {
						try {
							const metaDescriptionTranslation = await translateText(
								sourceLoc.metaDescription,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.metaDescription = metaDescriptionTranslation;
						} catch (error: any) {
							console.error(`Meta description translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					if (sourceLoc.metaKeywords && sourceLoc.metaKeywords.trim()) {
						try {
							const metaKeywordsTranslation = await translateText(
								sourceLoc.metaKeywords,
								targetLoc.languageCode,
								sourceLanguageCode
							);
							updates.metaKeywords = metaKeywordsTranslation;
						} catch (error: any) {
							console.error(`Meta keywords translation failed for ${targetLoc.languageCode}:`, error);
						}
					}

					return { targetLoc, updates };
				});

			const results = await Promise.all(translationPromises);

			setFormData((prev) => ({
				...prev,
				localizations: prev.localizations.map((loc) => {
					const result = results.find((r) => r.targetLoc.languageCode === loc.languageCode);
					if (result) {
						return { ...loc, ...result.updates };
					}
					return loc;
				}),
			}));

			toast.success("Çeviriler tamamlandı");
		} catch (error: any) {
			toast.error("Çeviri sırasında bir hata oluştu");
		} finally {
			setIsTranslating(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, fileAsset: file, fileAssetId: 0 }));
			setFilePreview(URL.createObjectURL(file));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, imageAsset: file, imageAssetId: 0 }));
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const handleRemoveFile = () => {
		setFormData((prev) => ({ ...prev, fileAsset: undefined, fileAssetId: 0 }));
		setFilePreview(null);
	};

	const handleRemoveImage = () => {
		setFormData((prev) => ({ ...prev, imageAsset: undefined, imageAssetId: 0 }));
		setImagePreview(null);
	};

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!page) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Sayfa bulunamadı</p>
					<Button
						onClick={() => navigate("/pages")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<PageBasicInfoStep
						formData={formData}
						errors={errors}
						pageTypes={pageTypes}
						languages={languages.map((l) => ({ id: l.id, code: l.code }))}
						activeLanguageTab={activeLanguageTab}
						isTranslating={isTranslating}
						filePreview={filePreview}
						imagePreview={imagePreview}
						onFormDataChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
						onLocalizationChange={handleLocalizationChange}
						onActiveLanguageTabChange={setActiveLanguageTab}
						onFileChange={handleFileChange}
						onImageChange={handleImageChange}
						onRemoveFile={handleRemoveFile}
						onRemoveImage={handleRemoveImage}
						onTranslate={handleTranslate}
					/>
				);
			case 1:
				return <PageComponentsStep pageId={pageId} />;
			case 2:
				return <PageTeamMembersStep pageId={pageId} />;
			case 3:
				return <PageSummaryStep pageId={pageId} />;
			default:
				return null;
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
						onClick={() => navigate("/pages")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Sayfa Düzenle
						</h1>
						<p className="text-muted-foreground text-sm ml-1">{page.name}</p>
					</div>
				</div>
			</div>

			{/* Stepper */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardContent className="pt-6 bg-gradient-to-br from-primary/5 to-transparent">
					<Stepper
						steps={STEPS}
						currentStep={currentStep}
						onStepClick={handleStepClick}
					/>
				</CardContent>
			</Card>

			{/* Form Container */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">{STEPS[currentStep].label}</CardTitle>
							<CardDescription className="text-xs">{STEPS[currentStep].description}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{renderStepContent()}

						{/* Form Actions */}
						<div className="flex items-center justify-between pt-6 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/pages")}
								size="lg"
								className="min-w-[120px]"
							>
								İptal
							</Button>
							<div className="flex items-center gap-3">
								{currentStep > 0 && (
									<Button
										type="button"
										variant="outline"
										onClick={handlePrevious}
										size="lg"
										className="min-w-[120px]"
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Önceki
									</Button>
								)}
								{currentStep < STEPS.length - 1 ? (
									<Button
										type="button"
										onClick={handleNext}
										size="lg"
										className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[120px]"
									>
										Sonraki
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								) : (
									<Button
										type="submit"
										disabled={updatePageMutation.isPending}
										size="lg"
										className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
									>
										{updatePageMutation.isPending ? (
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
								)}
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
