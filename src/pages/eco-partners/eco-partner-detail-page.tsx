import { useParams, useNavigate } from "react-router-dom";
import { useGetEcoPartnerById } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Building2, Loader2, Hash, Image as ImageIcon } from "lucide-react";

export default function EcoPartnerDetailPage() {
	const { id } = useParams<{ id: string }>();
	const ecoPartnerId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: ecoPartner, isLoading } = useGetEcoPartnerById(ecoPartnerId);

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!ecoPartner) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Eco partner bulunamadı</p>
					<Button
						onClick={() => navigate("/eco-partners")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Eco Partnerler Listesine Dön
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
						onClick={() => navigate("/eco-partners")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Eco Partner Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Eco partner bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/eco-partners/edit/${ecoPartner.id}`)}
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
							Eco Partner Bilgileri
						</h2>
						<p className="text-p3 text-muted-foreground mt-1">Eco partner detay bilgileri</p>
					</div>

				{/* Info Content */}
				<div className="p-6 space-y-6">
					{/* Logo and Basic Info */}
					<div className="flex items-start gap-6">
						{ecoPartner.logo ? (
							<img
								src={ecoPartner.logo}
								alt={`Eco Partner ${ecoPartner.orderIndex}`}
								className="h-40 w-40 rounded-xl object-contain border-4 border-green-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700/50 p-4"
							/>
						) : (
							<div className="h-40 w-40 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-green-200 dark:border-gray-600">
								<Building2 className="h-20 w-20 text-gray-400" />
							</div>
						)}
					</div>

					{/* Info Grid */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								Eco Partner ID
							</div>
							<div className="text-h5 font-bold text-gray-900 dark:text-gray-100">
								{ecoPartner.id}
							</div>
						</div>

						{/* Order Index */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
								<Hash className="h-4 w-4 text-muted-foreground" />
								Sıra Numarası
							</div>
							<div className="text-h5 font-bold text-foreground">
								{ecoPartner.orderIndex}
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-green-200/50 dark:border-gray-600/50">
						<Button
							variant="outline"
							onClick={() => navigate("/eco-partners")}
							className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/eco-partners/edit/${ecoPartner.id}`)}
							className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
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

