import { useParams, useNavigate } from "react-router-dom";
import { useGetComponentTypeById } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Layers, Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";

export default function ComponentTypeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const componentTypeId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: componentType, isLoading } = useGetComponentTypeById(componentTypeId);

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

	if (!componentType) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Bileşen Tipi Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız bileşen tipi mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/component-types")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Bileşen Tipleri Listesine Dön
						</Button>
					</CardContent>
				</Card>
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
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/component-types")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							{componentType.type}
						</h1>
						<p className="text-muted-foreground text-sm">Bileşen tipi detay bilgileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/component-types/edit/${componentType.id}`)}
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
							<Layers className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Bileşen Tipi Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel bileşen tipi bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Layers className="h-4 w-4 text-primary" />
								Bileşen Tipi ID
							</div>
							<div className="text-3xl font-bold text-primary">{componentType.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Layers className="h-4 w-4" />
								Tip Adı
							</div>
							<Badge variant="secondary" className="text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
								{componentType.type}
							</Badge>
						</div>
					</div>

					<Separator />

					{/* Photo */}
					{componentType.photo && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-primary/10">
									<ImageIcon className="h-4 w-4 text-primary" />
								</div>
								<h3 className="text-lg font-bold">Fotoğraf</h3>
							</div>
							<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
								<CardContent className="pt-4">
									<div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-border shadow-lg group hover:shadow-xl transition-all duration-200">
										<img
											src={componentType.photo}
											alt={componentType.type}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					<Separator />

					{/* Features */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-primary/10">
								<Layers className="h-4 w-4 text-primary" />
							</div>
							<h3 className="text-lg font-bold">Özellikler</h3>
							<Badge variant="secondary" className="bg-background/80 border border-border/50 font-bold">
								{features.filter(f => f.value).length} / {features.length}
							</Badge>
						</div>
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{features.map((feature, index) => (
								<Card
									key={index}
									className={`border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] ${
										feature.value
											? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
											: "bg-gradient-to-br from-card to-card/50"
									}`}
								>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold text-foreground">
												{feature.label}
											</span>
											{feature.value ? (
												<div className="p-1.5 rounded-full bg-green-500/20 border border-green-500/30">
													<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
												</div>
											) : (
												<div className="p-1.5 rounded-full bg-muted border border-border">
													<X className="h-5 w-5 text-muted-foreground" />
												</div>
											)}
										</div>
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
