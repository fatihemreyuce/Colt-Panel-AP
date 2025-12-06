import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEcoPartners, useDeleteEcoPartner } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
	Plus,
	Edit,
	Trash2,
	Eye,
	Loader2,
	Building2,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { EcoPartnerResponse } from "@/types/eco-partners.types";

export default function EcoPartnersListPage() {
	const navigate = useNavigate();
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedEcoPartnerId, setSelectedEcoPartnerId] = useState<number | null>(null);

	// Data fetching
	const { data, isLoading, isError } = useEcoPartners();
	const deleteEcoPartnerMutation = useDeleteEcoPartner();

	// Silme işlemi
	const handleDelete = useCallback(async () => {
		if (selectedEcoPartnerId) {
			try {
				await deleteEcoPartnerMutation.mutateAsync(selectedEcoPartnerId);
				setDeleteModalOpen(false);
				setSelectedEcoPartnerId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedEcoPartnerId, deleteEcoPartnerMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((ecoPartnerId: number) => {
		setSelectedEcoPartnerId(ecoPartnerId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedEcoPartnerId(null);
	}, []);

	// Computed values
	const ecoPartners = useMemo(() => {
		// API Page formatında dönebilir veya direkt array olabilir
		const partners = Array.isArray(data) ? data : (data?.content || []);
		return [...partners].sort((a, b) => a.orderIndex - b.orderIndex);
	}, [data]);

	const selectedEcoPartner = useMemo(
		() => ecoPartners.find((partner) => partner.id === selectedEcoPartnerId),
		[ecoPartners, selectedEcoPartnerId]
	);

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<h1 className="text-h2 font-semibold text-foreground">
					Eco Partnerler
				</h1>
				<Button
					onClick={() => navigate("/eco-partners/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Eco Partner
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-16">Sıra</TableHead>
							<TableHead>Logo</TableHead>
							<TableHead>ID</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-12">
									<div className="flex flex-col items-center justify-center gap-3">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
										<p className="text-p3 text-gray-500 dark:text-gray-400">
											Yükleniyor...
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : isError ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-12">
									<div className="flex flex-col items-center justify-center gap-3">
										<p className="text-p3 font-semibold text-red-600 dark:text-red-400">
											Bir hata oluştu
										</p>
										<p className="text-p3 text-gray-500 dark:text-gray-400">
											Lütfen sayfayı yenileyin
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : ecoPartners.length > 0 ? (
							ecoPartners.map((partner) => (
								<EcoPartnerTableRow
									key={partner.id}
									partner={partner}
									onView={() => navigate(`/eco-partners/detail/${partner.id}`)}
									onEdit={() => navigate(`/eco-partners/edit/${partner.id}`)}
									onDelete={() => handleOpenDeleteModal(partner.id)}
								/>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="p-0">
									<Empty className="border-0 py-12">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Building2 className="h-6 w-6" />
											</EmptyMedia>
											<EmptyTitle>Eco partner bulunamadı</EmptyTitle>
											<EmptyDescription>
												Henüz eco partner eklenmemiş. Yeni bir eco partner ekleyerek başlayabilirsiniz.
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/eco-partners/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												Yeni Eco Partner Ekle
											</Button>
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDelete}
				onCancel={handleCloseDeleteModal}
				title="Eco Partner'ı Sil"
				description={`Sıra ${selectedEcoPartner?.orderIndex} numaralı eco partner'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={`Sıra ${selectedEcoPartner?.orderIndex}`}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteEcoPartnerMutation.isPending}
			/>
		</div>
	);
}

// Eco partner table row component
interface EcoPartnerTableRowProps {
	partner: EcoPartnerResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function EcoPartnerTableRow({ partner, onView, onEdit, onDelete }: EcoPartnerTableRowProps) {
	return (
		<TableRow className="hover:bg-green-50/30 dark:hover:bg-gray-700/30 transition-colors border-b dark:border-gray-700/50">
			<TableCell className="font-medium dark:text-gray-200">
				<div className="flex items-center gap-2">
					<span className="text-h6 font-bold text-foreground">
						{partner.orderIndex}
					</span>
				</div>
			</TableCell>
			<TableCell>
				{partner.logo ? (
					<img
						src={partner.logo}
						alt={`Eco Partner ${partner.orderIndex}`}
						className="h-16 w-16 object-contain border border-green-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 p-2"
					/>
				) : (
					<div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-green-200 dark:border-gray-600">
						<Building2 className="h-8 w-8 text-gray-400" />
					</div>
				)}
			</TableCell>
			<TableCell className="font-medium dark:text-gray-200">{partner.id}</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onView}
						className="border-green-300 dark:border-gray-600 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-600/50 dark:text-gray-200"
						title="Detayları Görüntüle"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onEdit}
						className="border-green-300 dark:border-gray-600 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-600/50 dark:text-gray-200"
						title="Düzenle"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onDelete}
						className="border-red-300 dark:border-red-800/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
						title="Sil"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

