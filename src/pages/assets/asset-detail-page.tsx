import { useParams, useNavigate } from "react-router-dom";
import { useGetAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Image as ImageIcon, FileImage, Loader2, Globe } from "lucide-react";

export default function AssetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const assetId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: asset, isLoading } = useGetAsset(assetId);

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

	if (!asset) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Set bulunamadı</p>
					<Button
						onClick={() => navigate("/assets")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Setler Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	const defaultTitle = asset.localizations[0]?.title || "Başlık yok";
	const defaultDescription = asset.localizations[0]?.description || "";
	const defaultSubdescription = asset.localizations[0]?.subdescription || "";

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/assets")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Set Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Set bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/assets/edit/${asset.id}`)}
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
						<FileImage className="h-5 w-5 text-muted-foreground" />
						Set Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Set detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileImage className="h-4 w-4" />
								Set ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{asset.id}
							</div>
						</div>

						{/* Type */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileImage className="h-4 w-4" />
								Tip
							</div>
							<div className="text-h5 font-bold text-foreground">
								{asset.type}
							</div>
						</div>

						{/* MIME */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileImage className="h-4 w-4" />
								MIME Tipi
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{asset.mime}
							</div>
						</div>

						{/* Dimensions */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<ImageIcon className="h-4 w-4" />
								Boyutlar
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{asset.width} × {asset.height}
							</div>
						</div>
					</div>

					{/* File Preview */}
					{asset.url && (
						<div className="mt-6 space-y-2">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<ImageIcon className="h-4 w-4" />
								Dosya Önizleme
							</div>
							<div className="flex items-center justify-center p-6 border border-border rounded-lg bg-muted/50">
								{asset.mime?.startsWith("image/") ? (
									<img
										src={asset.url}
										alt={defaultTitle}
										className="max-w-full max-h-96 rounded-lg border border-border shadow-lg object-contain"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
										}}
									/>
								) : (
									<div className="flex flex-col items-center gap-4 p-8">
										<FileImage className="h-16 w-16 text-muted-foreground" />
										<p className="text-p3 text-muted-foreground">Dosya önizlemesi mevcut değil</p>
										<a
											href={asset.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-p3 text-primary hover:underline"
										>
											Dosyayı Görüntüle
										</a>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Localizations */}
					<div className="mt-6 space-y-4">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<Globe className="h-4 w-4" />
							Çoklu Dil İçerikleri
						</div>
						<div className="grid gap-4">
							{asset.localizations.map((loc, index) => (
								<div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
									<div className="flex items-center gap-2 mb-3">
										<span className="text-p3 font-semibold text-foreground bg-primary/10 text-primary px-3 py-1 rounded-md">
											{loc.languageCode.toUpperCase()}
										</span>
									</div>
									<div className="space-y-3">
										{loc.title && (
											<div>
												<div className="text-p3 font-semibold text-muted-foreground mb-1">Başlık</div>
												<div className="text-p1 font-medium text-foreground">{loc.title}</div>
											</div>
										)}
										{loc.description && (
											<div>
												<div className="text-p3 font-semibold text-muted-foreground mb-1">Açıklama</div>
												<div 
													className="text-p3 text-foreground prose prose-sm max-w-none"
													dangerouslySetInnerHTML={{ __html: loc.description }}
												/>
											</div>
										)}
										{loc.subdescription && (
											<div>
												<div className="text-p3 font-semibold text-muted-foreground mb-1">Alt Açıklama</div>
												<div className="text-p3 text-foreground">{loc.subdescription}</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/assets")}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/assets/edit/${asset.id}`)}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							<Edit className="h-4 w-4 mr-2" />
							Düzenle
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

