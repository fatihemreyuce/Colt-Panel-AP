import { useParams, useNavigate } from "react-router-dom";
import { useGetComponentTypeById } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Layers, Image as ImageIcon, Check, X, Loader2 } from "lucide-react";

export default function ComponentTypeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const componentTypeId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: componentType, isLoading } = useGetComponentTypeById(componentTypeId);

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

	if (!componentType) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Bileşen tipi bulunamadı</p>
					<Button
						onClick={() => navigate("/component-types")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Bileşen Tipleri Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	const features = [
		{ label: "Başlık", value: componentType.hasTitle },
		{ label: "Özet", value: componentType.hasExcerpt },
		{ label: "Açıklama", value: componentType.hasDescription },
		{ label: "Resim", value: componentType.hasImage },
		{ label: "Değer", value: componentType.hasValue },
		{ label: "Varlıklar", value: componentType.hasAssets },
		{ label: "Link", value: componentType.hasLink },
	];

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/component-types")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Bileşen Tipi Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Bileşen tipi bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/component-types/edit/${componentType.id}`)}
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
						<Layers className="h-5 w-5 text-muted-foreground" />
						Bileşen Tipi Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Bileşen tipi detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Layers className="h-4 w-4" />
								Bileşen Tipi ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{componentType.id}
							</div>
						</div>

						{/* Type */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Layers className="h-4 w-4" />
								Tip Adı
							</div>
							<div className="text-h5 font-bold text-foreground">
								{componentType.type}
							</div>
						</div>

						{/* Photo */}
						{componentType.photo && (
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground mb-3">
									<ImageIcon className="h-4 w-4" />
									Fotoğraf
								</div>
								<img
									src={componentType.photo}
									alt={componentType.type}
									className="h-48 w-48 rounded-lg object-cover border border-border"
								/>
							</div>
						)}

						{/* Features */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground mb-3">
								<Layers className="h-4 w-4" />
								Özellikler
							</div>
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{features.map((feature, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
									>
										<span className="text-p3 font-medium text-foreground">
											{feature.label}
										</span>
										{feature.value ? (
											<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
										) : (
											<X className="h-5 w-5 text-muted-foreground" />
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/component-types")}
							className="min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/component-types/edit/${componentType.id}`)}
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

