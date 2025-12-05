import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePartners, useDeletePartner } from "@/hooks/use-partners";
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
	Handshake,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { PartnerResponse } from "@/types/partners.types";

export default function PartnersListPage() {
	const navigate = useNavigate();
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);

	// Data fetching
	const { data, isLoading, isError } = usePartners();
	const deletePartnerMutation = useDeletePartner();

	// Silme işlemi
	const handleDelete = useCallback(async () => {
		if (selectedPartnerId) {
			try {
				await deletePartnerMutation.mutateAsync(selectedPartnerId);
				setDeleteModalOpen(false);
				setSelectedPartnerId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedPartnerId, deletePartnerMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((partnerId: number) => {
		setSelectedPartnerId(partnerId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedPartnerId(null);
	}, []);

	// Computed values
	const partners = useMemo(() => {
		// API Page formatında dönebilir veya direkt array olabilir
		const partnerList = Array.isArray(data) ? data : (data?.content || []);
		return [...partnerList].sort((a, b) => a.orderIndex - b.orderIndex);
	}, [data]);

	const selectedPartner = useMemo(
		() => partners.find((partner) => partner.id === selectedPartnerId),
		[partners, selectedPartnerId]
	);

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<h1 className="text-h2 font-semibold text-foreground">
					Partnerler
				</h1>
				<Button
					onClick={() => navigate("/partners/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Partner
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
						) : partners.length > 0 ? (
							partners.map((partner) => (
								<PartnerTableRow
									key={partner.id}
									partner={partner}
									onView={() => navigate(`/partners/detail/${partner.id}`)}
									onEdit={() => navigate(`/partners/edit/${partner.id}`)}
									onDelete={() => handleOpenDeleteModal(partner.id)}
								/>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="p-0">
									<Empty className="border-0 py-12">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Handshake className="h-6 w-6" />
											</EmptyMedia>
											<EmptyTitle>Partner bulunamadı</EmptyTitle>
											<EmptyDescription>
												Henüz partner eklenmemiş. Yeni bir partner ekleyerek başlayabilirsiniz.
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/partners/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												Yeni Partner Ekle
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
				title="Partner'ı Sil"
				description={`Sıra ${selectedPartner?.orderIndex} numaralı partner'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={`Sıra ${selectedPartner?.orderIndex}`}
				confirmText="Sil"
				cancelText="İptal"
				loading={deletePartnerMutation.isPending}
			/>
		</div>
	);
}

// Partner table row component
interface PartnerTableRowProps {
	partner: PartnerResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function PartnerTableRow({ partner, onView, onEdit, onDelete }: PartnerTableRowProps) {
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
						alt={`Partner ${partner.orderIndex}`}
						className="h-16 w-16 object-contain border border-green-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 p-2"
					/>
				) : (
					<div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-green-200 dark:border-gray-600">
						<Handshake className="h-8 w-8 text-gray-400" />
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

