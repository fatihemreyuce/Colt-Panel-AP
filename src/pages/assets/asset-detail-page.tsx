import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon, Loader2, Download, ExternalLink } from "lucide-react";
import type { localization } from "@/types/assets.types";

// Helper function to get Turkish localization first, fallback to first available
const getPreferredLocalization = (localizations: localization[]): localization | null => {
	if (!localizations || localizations.length === 0) return null;
	
	// Try to find Turkish first
	const turkish = localizations.find(loc => loc.languageCode.toLowerCase() === "tr");
	if (turkish) return turkish;
	
	// Fallback to first available
	return localizations[0];
};

// Helper function to strip HTML tags from text
const stripHtml = (html: string): string => {
	if (!html) return "";
	const tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
};

export default function AssetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const assetId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: asset, isLoading } = useGetAsset(assetId);
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");

	// Set initial selected language to Turkish or first available
	// This must be before any conditional returns (Rules of Hooks)
	useEffect(() => {
		if (asset && asset.localizations.length > 0 && selectedLanguageCode === "") {
			const turkish = asset.localizations.find(loc => loc.languageCode.toLowerCase() === "tr");
			setSelectedLanguageCode(turkish ? turkish.languageCode : asset.localizations[0].languageCode);
		}
	}, [asset, selectedLanguageCode]);

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

	if (!asset) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Medya Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız medya mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/assets")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Medya Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const preferredLoc = getPreferredLocalization(asset.localizations);
	const defaultTitle = preferredLoc?.title || "Başlık yok";

	// Get selected localization
	const selectedLoc = asset.localizations.find(loc => loc.languageCode === selectedLanguageCode) || preferredLoc || asset.localizations[0];

	// Sort localizations: Turkish first, then others
	const sortedLocalizations = [...asset.localizations].sort((a, b) => {
		const aIsTurkish = a.languageCode.toLowerCase() === "tr";
		const bIsTurkish = b.languageCode.toLowerCase() === "tr";
		if (aIsTurkish && !bIsTurkish) return -1;
		if (!aIsTurkish && bIsTurkish) return 1;
		return 0;
	});

	const handleDownload = async () => {
		if (!asset.url) return;
		
		try {
			const response = await fetch(asset.url);
			if (!response.ok) throw new Error("İndirme başarısız");
			
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `asset-${asset.id}.${asset.mime?.split("/")[1] || "file"}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Download error:", error);
		}
	};

	const handleView = () => {
		if (asset.url) {
			window.open(asset.url, "_blank");
		}
	};

	return (
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/assets")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold mb-1">Asset Detayı</h1>
					<p className="text-muted-foreground text-sm">Asset bilgilerini görüntüleyin</p>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Preview Card */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<ImageIcon className="h-5 w-5" />
								<CardTitle>Önizleme</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							{asset.url && asset.mime?.startsWith("image/") ? (
								<div className="w-full rounded-lg overflow-hidden border">
									<img
										src={asset.url}
										alt={defaultTitle}
										className="w-full h-auto object-contain"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
										}}
									/>
								</div>
							) : (
								<div className="w-full h-64 rounded-lg border flex items-center justify-center bg-muted">
									<p className="text-muted-foreground">Önizleme mevcut değil</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Multi-Language Contents Card */}
					<Card>
						<CardHeader>
							<CardTitle>Çoklu Dil İçerikleri</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Language Selection Badges */}
							<div className="flex flex-wrap gap-2 mb-4">
								{sortedLocalizations.map((loc) => (
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
							{selectedLoc && (
								<div className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Başlık</label>
										<Input
											value={selectedLoc.title || ""}
											readOnly
											className="bg-background"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Açıklama</label>
										<Textarea
											value={stripHtml(selectedLoc.description || "")}
											readOnly
											className="bg-background min-h-[100px]"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Alt Açıklama</label>
										<Input
											value={selectedLoc.subdescription || ""}
											readOnly
											className="bg-background"
										/>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
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
									<Badge className="bg-green-500 text-white">#{asset.id}</Badge>
								</div>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Tür:</label>
								<div className="mt-1">
									<Badge variant="secondary" className="bg-blue-100 text-blue-800">
										{asset.type}
									</Badge>
								</div>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">MIME:</label>
								<p className="mt-1 text-sm font-medium">{asset.mime}</p>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Diller:</label>
								<div className="mt-1 flex flex-wrap gap-2">
									{asset.localizations.map((loc, index) => (
										<Badge key={index} className="bg-green-500 text-white">
											{loc.languageCode.toUpperCase()}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Actions Card */}
					<Card>
						<CardHeader>
							<CardTitle>İşlemler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								onClick={handleView}
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								Görüntüle
							</Button>
							<Button
								onClick={handleDownload}
								variant="outline"
								className="w-full"
							>
								<Download className="h-4 w-4 mr-2" />
								İndir
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
