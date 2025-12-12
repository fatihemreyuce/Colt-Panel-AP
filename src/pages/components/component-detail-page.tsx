import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetComponentById } from "@/hooks/use-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	ArrowLeft,
	Box,
	Loader2,
	FileImage,
	Video,
	Image as ImageIcon,
	ExternalLink,
} from "lucide-react";

export default function ComponentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const componentId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: component, isLoading } = useGetComponentById(componentId);

	// Language selection state - MUST be before conditional returns (Rules of Hooks)
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");

	// Set initial selected language - MUST be before conditional returns (Rules of Hooks)
	useEffect(() => {
		if (component && component.localizations && component.localizations.length > 0 && selectedLanguageCode === "") {
			const turkish = component.localizations.find((loc: any) => loc.languageCode.toLowerCase() === "tr");
			setSelectedLanguageCode(turkish ? turkish.languageCode : component.localizations[0].languageCode);
		}
	}, [component]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("tr-TR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
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

	if (!component) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Bileşen Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız bileşen mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/components")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Bileşenler Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Helper function to get Turkish localization first
	const getPreferredLocalization = (localizations: any[]) => {
		if (!localizations || localizations.length === 0) return null;
		const turkish = localizations.find((loc) => loc.languageCode.toLowerCase() === "tr");
		return turkish || localizations[0];
	};

	const preferredLoc = getPreferredLocalization(component.localizations || []);
	const displayLoc = selectedLanguageCode
		? component.localizations?.find((loc: any) => loc.languageCode === selectedLanguageCode)
		: null;
	const currentLoc = displayLoc || preferredLoc || (component.localizations && component.localizations.length > 0 ? component.localizations[0] : null);

	// Helper function to strip HTML tags from text
	const stripHtml = (html: string): string => {
		if (!html) return "";
		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	// Sort localizations: Turkish first, then others
	const sortedLocalizations = component.localizations
		? [...component.localizations].sort((a: any, b: any) => {
				const aIsTurkish = a.languageCode.toLowerCase() === "tr";
				const bIsTurkish = b.languageCode.toLowerCase() === "tr";
				if (aIsTurkish && !bIsTurkish) return -1;
				if (!aIsTurkish && bIsTurkish) return 1;
				return 0;
			})
		: [];

	return (
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/components")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold mb-1">{component.name}</h1>
					<p className="text-muted-foreground text-sm">Bileşen detay bilgileri</p>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Translations Card */}
					{component.localizations && component.localizations.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Çeviriler</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Language Selection Badges */}
								<div className="flex flex-wrap gap-2 mb-4">
									{sortedLocalizations.map((loc: any) => (
										<Badge
											key={loc.languageCode}
											className={`cursor-pointer transition-all ${
												selectedLanguageCode === loc.languageCode
													? "bg-green-500 text-white"
													: "bg-gray-200 text-gray-700 hover:bg-gray-300"
											}`}
											onClick={() => setSelectedLanguageCode(loc.languageCode)}
										>
											{loc.languageCode.toUpperCase()}
										</Badge>
									))}
								</div>

								{/* Selected Language Content */}
								{currentLoc && (
									<div className="space-y-4">
										{currentLoc.title && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Başlık</label>
												<Input
													value={currentLoc.title}
													readOnly
													className="bg-background"
												/>
											</div>
										)}
										{currentLoc.excerpt && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Özet</label>
												<Input
													value={currentLoc.excerpt}
													readOnly
													className="bg-background"
												/>
											</div>
										)}
										{currentLoc.description && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Açıklama</label>
												<Textarea
													value={stripHtml(currentLoc.description)}
													readOnly
													className="bg-background min-h-[100px]"
												/>
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Media Card */}
					{component.assets && component.assets.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Medya</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{component.assets
										.sort((a: any, b: any) => {
											const aSortOrder = a.sortOrder ?? null;
											const bSortOrder = b.sortOrder ?? null;
											if (aSortOrder === null && bSortOrder === null) return 0;
											if (aSortOrder === null) return 1;
											if (bSortOrder === null) return -1;
											return aSortOrder - bSortOrder;
										})
										.map((assetItem: any, index: number) => {
											const asset = assetItem.asset || assetItem;
											const assetLoc = getPreferredLocalization(asset.localizations || []);
											const assetTitle = assetLoc?.title || asset.type || `Medya ${index + 1}`;

											return (
												<div key={asset.id || index} className="space-y-2">
													{asset.url && asset.mime?.startsWith("image/") ? (
														<div className="w-full rounded-lg overflow-hidden border">
															<img
																src={asset.url}
																alt={assetTitle}
																className="w-full h-auto object-contain"
																onError={(e) => {
																	const target = e.target as HTMLImageElement;
																	target.style.display = "none";
																}}
															/>
														</div>
													) : asset.url && asset.mime?.startsWith("video/") ? (
														<div className="w-full rounded-lg overflow-hidden border">
															<video
																src={asset.url}
																controls
																className="w-full h-auto"
															/>
														</div>
													) : (
														<div className="w-full h-64 rounded-lg border flex items-center justify-center bg-muted">
															<p className="text-muted-foreground">Önizleme mevcut değil</p>
														</div>
													)}
												</div>
											);
										})}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column */}
				<div className="space-y-6">
					{/* Quick Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Hızlı Bilgiler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm text-muted-foreground">ID:</label>
								<div className="mt-1">
									<Badge className="bg-green-500 text-white">#{component.id}</Badge>
								</div>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Ad:</label>
								<p className="mt-1 text-sm font-medium">{component.name}</p>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Tip:</label>
								<div className="mt-1">
									<Badge variant="secondary" className="bg-blue-100 text-blue-800">
										{component.type}
									</Badge>
								</div>
							</div>
							{component.value && (
								<div>
									<label className="text-sm text-muted-foreground">Değer:</label>
									<p className="mt-1 text-sm font-medium">{component.value}</p>
								</div>
							)}
							{component.link && (
								<div>
									<label className="text-sm text-muted-foreground">Link:</label>
									<div className="mt-1">
										<a
											href={component.link}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-primary hover:underline flex items-center gap-1"
										>
											<ExternalLink className="h-3 w-3" />
											<span className="truncate">{component.link}</span>
										</a>
									</div>
								</div>
							)}
							<div>
								<label className="text-sm text-muted-foreground">Sıralama:</label>
								<p className="mt-1 text-sm font-medium">{component.sortOrder}</p>
							</div>
							{component.localizations && component.localizations.length > 0 && (
								<div>
									<label className="text-sm text-muted-foreground">Diller:</label>
									<div className="mt-1 flex flex-wrap gap-2">
										{sortedLocalizations.map((loc: any) => (
											<Badge key={loc.languageCode} className="bg-green-500 text-white">
												{loc.languageCode.toUpperCase()}
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Actions Card */}
					<Card>
						<CardHeader>
							<CardTitle>İşlemler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								onClick={() => navigate(`/components/edit/${component.id}`)}
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							>
								<Box className="h-4 w-4 mr-2" />
								Düzenle
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
