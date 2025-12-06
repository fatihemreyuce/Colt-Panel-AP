import { useParams, useNavigate } from "react-router-dom";
import { useGetOffice } from "@/hooks/use-offices";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Building2, MapPin, Phone, Loader2 } from "lucide-react";

export default function OfficeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const officeId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: office, isLoading } = useGetOffice(officeId);

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

	if (!office) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Ofis bulunamadı</p>
					<Button
						onClick={() => navigate("/offices")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Ofisler Listesine Dön
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
						onClick={() => navigate("/offices")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Ofis Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Ofis bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/offices/edit/${office.id}`)}
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
						<Building2 className="h-5 w-5 text-muted-foreground" />
						Ofis Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Ofis detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Building2 className="h-4 w-4" />
								Ofis ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{office.id}
							</div>
						</div>

						{/* Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Building2 className="h-4 w-4" />
								Ofis Adı
							</div>
							<div className="text-h5 font-bold text-foreground">
								{office.name}
							</div>
						</div>

						{/* Address */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<MapPin className="h-4 w-4" />
								Adres
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{office.address}
							</div>
						</div>

						{/* Phone Number */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Phone className="h-4 w-4" />
								Telefon Numarası
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{office.phoneNumber}
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/offices")}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/offices/edit/${office.id}`)}
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

