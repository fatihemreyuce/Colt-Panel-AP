import { useParams, useNavigate } from "react-router-dom";
import { useGetOffice } from "@/hooks/use-offices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Building2, MapPin, Phone, Loader2 } from "lucide-react";

export default function OfficeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const officeId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: office, isLoading } = useGetOffice(officeId);

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

	if (!office) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Ofis Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız ofis mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/offices")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Ofisler Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/offices")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold mb-1">Ofis Detayları</h1>
					<p className="text-muted-foreground text-sm">Ofis bilgilerini görüntüleyin</p>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Ofis Bilgileri Card */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle>Ofis Bilgileri</CardTitle>
									<CardDescription>Ofis detay bilgileri</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Grid Info */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Building2 className="h-3.5 w-3.5 text-primary" />
										Ofis ID
									</div>
									<div className="text-2xl font-bold text-primary">{office.id}</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Building2 className="h-3.5 w-3.5" />
										Ofis Adı
									</div>
									<div className="text-base font-semibold text-foreground">{office.name}</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card md:col-span-2">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<MapPin className="h-3.5 w-3.5" />
										Adres
									</div>
									<div className="text-sm font-medium text-foreground">{office.address}</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Phone className="h-3.5 w-3.5" />
										Telefon Numarası
									</div>
									<div className="text-sm font-medium text-foreground">{office.phoneNumber}</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Quick Info */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Hızlı Bilgiler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Ofis ID</label>
								<p className="text-sm font-medium">{office.id}</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Ofis Adı</label>
								<p className="text-sm font-medium">{office.name}</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Telefon</label>
								<p className="text-sm font-medium">{office.phoneNumber}</p>
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
								onClick={() => navigate(`/offices/edit/${office.id}`)}
								className="w-full"
								size="lg"
							>
								<Edit className="h-4 w-4 mr-2" />
								Düzenle
							</Button>
							<Button
								variant="outline"
								onClick={() => navigate("/offices")}
								className="w-full"
								size="lg"
							>
								Geri Dön
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

