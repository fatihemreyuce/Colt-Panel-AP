import { useParams, useNavigate } from "react-router-dom";
import { useGetComponentById } from "@/hooks/use-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	ArrowLeft,
	Edit,
	Box,
	Loader2,
	Link as LinkIcon,
	Languages as LanguagesIcon,
	FileImage,
	File,
	Video,
	Image as ImageIcon,
	Calendar,
	Clock,
	ExternalLink,
} from "lucide-react";

export default function ComponentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const componentId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: component, isLoading } = useGetComponentById(componentId);

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
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							{component.name}
						</h1>
						<p className="text-muted-foreground text-sm">Bileşen detay bilgileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/components/edit/${component.id}`)}
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
							<Box className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Bileşen Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel bileşen bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Box className="h-4 w-4 text-primary" />
								Bileşen ID
							</div>
							<div className="text-3xl font-bold text-primary">{component.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Box className="h-4 w-4" />
								Ad
							</div>
							<div className="text-lg font-bold text-foreground">{component.name}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Box className="h-4 w-4" />
								Tip
							</div>
							<Badge variant="secondary" className="text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
								{component.type}
							</Badge>
						</div>

						{component.value && (
							<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
								<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
									<Box className="h-4 w-4" />
									Değer
								</div>
								<code className="text-sm font-mono font-bold text-foreground bg-gradient-to-r from-background to-muted/30 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
									{component.value}
								</code>
							</div>
						)}

						{component.link && (
							<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
								<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
									<LinkIcon className="h-4 w-4" />
									Link
								</div>
								<a
									href={component.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-bold text-primary hover:underline break-all flex items-center gap-2"
								>
									<ExternalLink className="h-4 w-4" />
									{component.link}
								</a>
							</div>
						)}

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Box className="h-4 w-4" />
								Sıralama
							</div>
							<div className="text-lg font-bold text-foreground">{component.sortOrder}</div>
						</div>
					</div>

					<Separator />

					{/* Localizations Section */}
					{component.localizations && component.localizations.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-primary/10">
									<LanguagesIcon className="h-4 w-4 text-primary" />
								</div>
								<h3 className="text-lg font-bold">Çeviriler</h3>
								<Badge variant="secondary" className="bg-background/80 border border-border/50 font-bold">
									{component.localizations.length}
								</Badge>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								{[...component.localizations]
									.sort((a, b) => {
										const aIsTurkish = a.languageCode.toLowerCase() === "tr";
										const bIsTurkish = b.languageCode.toLowerCase() === "tr";
										if (aIsTurkish && !bIsTurkish) return -1;
										if (!aIsTurkish && bIsTurkish) return 1;
										return 0;
									})
									.map((localization, index) => (
										<Card key={index} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
											<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
												<div className="flex items-center gap-2">
													<div className="p-1.5 rounded-lg bg-primary/20">
														<LanguagesIcon className="h-4 w-4 text-primary" />
													</div>
													<CardTitle className="text-base uppercase font-bold">
														{localization.languageCode}
													</CardTitle>
												</div>
											</CardHeader>
											<CardContent className="space-y-3">
												{localization.title && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Başlık
														</div>
														<div className="text-sm font-medium text-foreground">{localization.title}</div>
													</div>
												)}
												{localization.excerpt && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Özet
														</div>
														<div className="text-sm text-foreground">{localization.excerpt}</div>
													</div>
												)}
												{localization.description && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Açıklama
														</div>
														<div
															className="text-sm text-foreground prose prose-sm max-w-none"
															dangerouslySetInnerHTML={{ __html: localization.description }}
														/>
													</div>
												)}
											</CardContent>
										</Card>
									))}
							</div>
						</div>
					)}

					<Separator />

					{/* Assets Section */}
					{component.assets && component.assets.length > 0 ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="p-1.5 rounded-lg bg-primary/10">
										<FileImage className="h-4 w-4 text-primary" />
									</div>
									<h3 className="text-lg font-bold">Medya</h3>
									<Badge variant="secondary" className="bg-background/80 border border-border/50 font-bold">
										{component.assets.length}
									</Badge>
								</div>
							</div>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{[...component.assets]
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
										const assetId = asset.id || assetItem.id || index;
										const preferredLoc = getPreferredLocalization(asset.localizations || []);

										const getAssetIcon = () => {
											if (asset.type === "VIDEO") return <Video className="h-5 w-5 text-primary" />;
											if (asset.type === "IMAGE") return <ImageIcon className="h-5 w-5 text-primary" />;
											return <File className="h-5 w-5 text-primary" />;
										};

										return (
											<Card key={assetId} className="border-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
												<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
													<div className="flex items-center gap-2">
														<div className="p-1.5 rounded-lg bg-primary/20">
															{getAssetIcon()}
														</div>
														<CardTitle className="text-base font-bold">{asset.type || "N/A"}</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="space-y-4 pt-4">
													{asset.url && (
														<div className="space-y-2">
															{asset.mime && asset.mime.startsWith("image/") ? (
																<div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-border shadow-lg group hover:shadow-xl transition-all duration-200">
																	<img
																		src={asset.url}
																		alt={preferredLoc?.title || asset.type || "Asset"}
																		className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
																		onError={(e) => {
																			const target = e.target as HTMLImageElement;
																			target.style.display = "none";
																		}}
																	/>
																	<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
																</div>
															) : (
																<div className="p-4 rounded-lg border-2 border-border bg-muted/30">
																	<div className="flex items-center gap-3">
																		{getAssetIcon()}
																		<div className="flex-1 min-w-0">
																			<p className="text-xs font-medium text-muted-foreground mb-1">Dosya</p>
																			<a
																				href={asset.url}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-xs text-primary hover:underline break-all flex items-center gap-2"
																			>
																				<ExternalLink className="h-3 w-3 flex-shrink-0" />
																				<span className="truncate">{asset.url}</span>
																			</a>
																		</div>
																	</div>
																</div>
															)}
														</div>
													)}

													{asset.localizations && asset.localizations.length > 0 && (
														<div className="pt-4 border-t space-y-2">
															<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
																<LanguagesIcon className="h-3 w-3" />
																Çeviriler
															</div>
															{preferredLoc && (
																<div className="p-2 rounded-lg border border-border bg-muted/30">
																	<div className="flex items-center gap-2 mb-1">
																		<Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
																			{preferredLoc.languageCode?.toUpperCase() || "N/A"}
																		</Badge>
																		{preferredLoc.title && (
																			<span className="text-xs font-medium text-foreground truncate">{preferredLoc.title}</span>
																		)}
																	</div>
																	{preferredLoc.description && (
																		<div className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: preferredLoc.description }} />
																	)}
																</div>
															)}
														</div>
													)}
												</CardContent>
											</Card>
										);
									})}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-primary/10">
									<FileImage className="h-4 w-4 text-primary" />
								</div>
								<h3 className="text-lg font-bold">Medya</h3>
							</div>
							<div className="p-12 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
								<FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
								<p className="text-sm text-muted-foreground font-medium">Bu bileşene henüz medya eklenmemiş.</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
