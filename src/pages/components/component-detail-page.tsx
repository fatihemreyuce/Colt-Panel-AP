import { useParams, useNavigate } from "react-router-dom";
import { useGetComponentById } from "@/hooks/use-components";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Box, Loader2, Link as LinkIcon, Languages as LanguagesIcon, FileImage, File, Video, Image as ImageIcon } from "lucide-react";

export default function ComponentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const componentId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: component, isLoading } = useGetComponentById(componentId);

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

	if (!component) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Bileşen bulunamadı</p>
					<Button
						onClick={() => navigate("/components")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Bileşenler Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/components")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Bileşen Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Bileşen bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/components/edit/${component.id}`)}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Edit className="h-4 w-4 mr-2" />
					Düzenle
				</Button>
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Box className="h-5 w-5 text-muted-foreground" />
						Bileşen Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Bileşen detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Box className="h-4 w-4" />
								Bileşen ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{component.id}
							</div>
						</div>

						{/* Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Box className="h-4 w-4" />
								Ad
							</div>
							<div className="text-h5 font-bold text-foreground">
								{component.name}
							</div>
						</div>

						{/* Type */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Box className="h-4 w-4" />
								Tip
							</div>
							<div className="text-h5 font-bold text-foreground">
								{component.type}
							</div>
						</div>

						{/* Value */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Box className="h-4 w-4" />
								Değer
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{component.value || "-"}
							</div>
						</div>

						{/* Link */}
						{component.link && (
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
									<LinkIcon className="h-4 w-4" />
									Link
								</div>
								<a
									href={component.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-p1 font-semibold text-primary hover:underline break-all"
								>
									{component.link}
								</a>
							</div>
						)}

						{/* Sort Order */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Box className="h-4 w-4" />
								Sıralama
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{component.sortOrder}
							</div>
						</div>
					</div>

					{/* Localizations Section */}
					{component.localizations && component.localizations.length > 0 && (
						<div className="space-y-4 pt-6 mt-6 border-t border-border">
							<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2 mb-4">
								<LanguagesIcon className="h-5 w-5" />
								Çeviriler
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{component.localizations.map((localization, index) => (
									<div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
										<h4 className="text-p3 font-semibold text-foreground mb-3">
											{localization.languageCode.toUpperCase()}
										</h4>
										<div className="space-y-2">
											{localization.title && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">Başlık</p>
													<p className="text-p3 text-foreground">{localization.title}</p>
												</div>
											)}
											{localization.excerpt && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">Özet</p>
													<p className="text-p3 text-foreground">{localization.excerpt}</p>
												</div>
											)}
											{localization.description && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">Açıklama</p>
													<p className="text-p3 text-foreground whitespace-pre-wrap">{localization.description}</p>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Assets Section */}
					{component.assets && component.assets.length > 0 ? (
						<div className="space-y-6 pt-6 mt-6 border-t border-border">
							<div className="flex items-center justify-between">
								<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
									<FileImage className="h-5 w-5 text-primary" />
									Medya
								</h3>
								<span className="text-p3 text-muted-foreground bg-muted px-3 py-1 rounded-full">
									{component.assets.length} {component.assets.length === 1 ? 'medya' : 'medya'}
								</span>
							</div>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{component.assets.map((assetItem: any, index: number) => {
									// Backend'den gelen response'da asset nested olabilir (asset.asset) veya direkt olabilir
									const asset = assetItem.asset || assetItem;
									const assetId = asset.id || assetItem.id || index;
									
									// Asset type'a göre icon seç
									const getAssetIcon = () => {
										if (asset.type === 'VIDEO') return <Video className="h-5 w-5 text-primary" />;
										if (asset.type === 'IMAGE') return <ImageIcon className="h-5 w-5 text-primary" />;
										return <File className="h-5 w-5 text-primary" />;
									};
									
									return (
										<div key={assetId} className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
											<div className="space-y-4">
												{/* Header with Type */}
												<div className="flex items-start justify-between">
													<div className="flex items-center gap-3">
														<div className="p-2 rounded-lg bg-primary/10">
															{getAssetIcon()}
														</div>
														<div>
															<Label className="text-xs font-medium text-muted-foreground mb-1 block">Tip</Label>
															<p className="text-p2 font-semibold text-foreground">{asset.type || "N/A"}</p>
														</div>
													</div>
												</div>

												{/* File Preview/URL */}
												{asset.url && (
													<div className="space-y-2">
														<Label className="text-xs font-medium text-muted-foreground">Dosya</Label>
														{asset.mime && asset.mime.startsWith('image/') ? (
															<div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted/50">
																<img 
																	src={asset.url} 
																	alt={asset.type || "Asset"}
																	className="w-full h-auto max-h-64 object-contain"
																	onError={(e) => {
																		console.error("Image load error:", asset.url);
																		(e.target as HTMLImageElement).style.display = 'none';
																	}}
																/>
															</div>
														) : (
															<div className="p-3 rounded-lg border border-border bg-muted/30">
																<a
																	href={asset.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-xs text-primary hover:underline break-all flex items-center gap-2"
																>
																	<File className="h-4 w-4 flex-shrink-0" />
																	<span className="truncate">{asset.url}</span>
																</a>
															</div>
														)}
													</div>
												)}

												{/* Localizations */}
												{asset.localizations && asset.localizations.length > 0 && (
													<div className="pt-4 border-t border-border">
														<Label className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
															<LanguagesIcon className="h-4 w-4" />
															Çeviriler
														</Label>
														<div className="space-y-3">
															{asset.localizations.map((loc: any, locIndex: number) => (
																<div key={locIndex} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
																	<div className="flex items-center gap-2">
																		<span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
																			{loc.languageCode?.toUpperCase() || "N/A"}
																		</span>
																		{loc.title && (
																			<span className="text-xs font-medium text-foreground truncate">{loc.title}</span>
																		)}
																	</div>
																	{loc.description && (
																		<div className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: loc.description }} />
																	)}
																	{loc.subdescription && (
																		<div className="text-xs text-muted-foreground italic">{loc.subdescription}</div>
																	)}
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						<div className="space-y-4 pt-6 mt-6 border-t border-border">
							<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2 mb-4">
								<FileImage className="h-5 w-5" />
								Medya
							</h3>
							<div className="p-8 rounded-lg border-2 border-dashed border-border bg-muted/30 text-center">
								<FileImage className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
								<p className="text-p3 text-muted-foreground">Bu bileşene henüz medya eklenmemiş.</p>
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border px-6 pb-6">
					<Button
						variant="outline"
						onClick={() => navigate("/components")}
						className="min-w-[100px]"
					>
						Geri Dön
					</Button>
					<Button
						onClick={() => navigate(`/components/edit/${component.id}`)}
						className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
					>
						<Edit className="h-4 w-4 mr-2" />
						Düzenle
					</Button>
				</div>
			</div>
		</div>
	);
}

