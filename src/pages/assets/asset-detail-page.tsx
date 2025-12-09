import { useParams, useNavigate } from "react-router-dom";
import { useGetAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Image as ImageIcon, FileImage, Loader2, Globe, ExternalLink, File } from "lucide-react";
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

export default function AssetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const assetId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: asset, isLoading } = useGetAsset(assetId);

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
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							{defaultTitle}
						</h1>
						<p className="text-muted-foreground text-sm">Medya detay bilgileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/assets/edit/${asset.id}`)}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					size="lg"
				>
					<Edit className="h-5 w-5 mr-2" />
					Düzenle
				</Button>
			</div>

			{/* Main Info Card */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<FileImage className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Medya Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel medya bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileImage className="h-4 w-4 text-primary" />
								Medya ID
							</div>
							<div className="text-3xl font-bold text-primary">{asset.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileImage className="h-4 w-4" />
								Tip
							</div>
							<Badge variant="secondary" className="text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
								{asset.type}
							</Badge>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileImage className="h-4 w-4" />
								MIME Tipi
							</div>
							<div className="text-sm font-bold text-foreground">{asset.mime}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<ImageIcon className="h-4 w-4" />
								Boyutlar
							</div>
							<div className="text-lg font-bold text-foreground">
								{asset.width} × {asset.height}
							</div>
						</div>
					</div>

					<Separator />

					{/* File Preview */}
					{asset.url && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-primary/10">
									<ImageIcon className="h-4 w-4 text-primary" />
								</div>
								<h3 className="text-lg font-bold">Dosya Önizleme</h3>
							</div>
							{asset.mime?.startsWith("image/") ? (
								<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
									<CardContent className="pt-4">
										<div className="relative w-full h-96 rounded-xl overflow-hidden border-2 border-border shadow-lg group hover:shadow-xl transition-all duration-200">
											<img
												src={asset.url}
												alt={defaultTitle}
												className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
												onError={(e) => {
													const target = e.target as HTMLImageElement;
													target.style.display = "none";
												}}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
									</CardContent>
								</Card>
							) : (
								<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
									<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
										<CardTitle className="text-base flex items-center gap-2 font-bold">
											<div className="p-1.5 rounded-lg bg-primary/20">
												<File className="h-4 w-4 text-primary" />
											</div>
											Dosya
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-4">
										<div className="flex flex-col items-center gap-4 p-8">
											<FileImage className="h-16 w-16 text-muted-foreground" />
											<p className="text-sm text-muted-foreground font-medium">Dosya önizlemesi mevcut değil</p>
											<a
												href={asset.url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all duration-200 hover:scale-105 shadow-sm"
											>
												<ExternalLink className="h-4 w-4" />
												Dosyayı Görüntüle
											</a>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					<Separator />

					{/* Localizations */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-primary/10">
								<Globe className="h-4 w-4 text-primary" />
							</div>
							<h3 className="text-lg font-bold">Çoklu Dil İçerikleri</h3>
							<Badge variant="secondary" className="bg-background/80 border border-border/50 font-bold">
								{asset.localizations.length}
							</Badge>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{[...asset.localizations].sort((a, b) => {
								const aIsTurkish = a.languageCode.toLowerCase() === "tr";
								const bIsTurkish = b.languageCode.toLowerCase() === "tr";
								if (aIsTurkish && !bIsTurkish) return -1;
								if (!aIsTurkish && bIsTurkish) return 1;
								return 0;
							}).map((loc, index) => (
								<Card key={index} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
									<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
										<div className="flex items-center gap-2">
											<div className="p-1.5 rounded-lg bg-primary/20">
												<Globe className="h-4 w-4 text-primary" />
											</div>
											<CardTitle className="text-base uppercase font-bold">
												{loc.languageCode}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										{loc.title && (
											<div>
												<div className="text-xs font-semibold text-muted-foreground mb-1">
													Başlık
												</div>
												<div className="text-sm font-medium text-foreground">{loc.title}</div>
											</div>
										)}
										{loc.description && (
											<div>
												<div className="text-xs font-semibold text-muted-foreground mb-1">
													Açıklama
												</div>
												<div
													className="text-sm text-foreground prose prose-sm max-w-none"
													dangerouslySetInnerHTML={{ __html: loc.description }}
												/>
											</div>
										)}
										{loc.subdescription && (
											<div>
												<div className="text-xs font-semibold text-muted-foreground mb-1">
													Alt Açıklama
												</div>
												<div className="text-sm text-foreground">{loc.subdescription}</div>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
