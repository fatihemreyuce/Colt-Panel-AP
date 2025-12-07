import { useParams, useNavigate } from "react-router-dom";
import { useGetEcoPartnerById } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Building2, Loader2, Hash } from "lucide-react";

export default function EcoPartnerDetailPage() {
	const { id } = useParams<{ id: string }>();
	const ecoPartnerId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: ecoPartner, isLoading } = useGetEcoPartnerById(ecoPartnerId);

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

	if (!ecoPartner) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Eco Partner Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız eco partner mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/eco-partners")}
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Eco Partnerler Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/eco-partners")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							Eco Partner Detayları
						</h1>
						<p className="text-muted-foreground text-sm">Eco partner bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/eco-partners/edit/${ecoPartner.id}`)}
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
							<Building2 className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Eco Partner Bilgileri</CardTitle>
							<CardDescription className="text-xs">Eco partner detay bilgileri</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Logo and Basic Info */}
					<div className="flex items-start gap-6">
						{ecoPartner.logo ? (
							<div className="relative group">
								<img
									src={ecoPartner.logo}
									alt={`Eco Partner ${ecoPartner.orderIndex}`}
									className="h-40 w-40 rounded-xl object-contain border-2 border-border shadow-lg bg-card p-4 group-hover:shadow-xl transition-shadow"
								/>
							</div>
						) : (
							<div className="h-40 w-40 rounded-xl bg-muted/50 flex items-center justify-center border-2 border-border shadow-md">
								<Building2 className="h-20 w-20 text-muted-foreground" />
							</div>
						)}
					</div>

					{/* Info Grid */}
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Building2 className="h-4 w-4 text-primary" />
								Eco Partner ID
							</div>
							<div className="text-3xl font-bold text-primary">{ecoPartner.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Hash className="h-4 w-4" />
								Sıra Numarası
							</div>
							<div className="text-3xl font-bold text-foreground">
								<Badge variant="outline" className="text-2xl px-4 py-2 font-bold">
									{ecoPartner.orderIndex}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


