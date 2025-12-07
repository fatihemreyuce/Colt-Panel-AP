import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePartners, useDeletePartner } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
	MoreVertical,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Handshake className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Partnerler
						</h1>
					</div>
					<p className="text-muted-foreground ml-[52px] text-sm">
						Tüm partnerleri görüntüleyin ve yönetin
					</p>
				</div>
				<Button
					onClick={() => navigate("/partners/create")}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					size="lg"
				>
					<Plus className="h-5 w-5 mr-2" />
					Yeni Partner
				</Button>
			</div>

			{/* Table Section */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-transparent border-b">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-1.5 rounded-lg bg-primary/10">
								<Handshake className="h-4 w-4 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold">Partner Listesi</CardTitle>
								<CardDescription className="text-xs mt-0.5">
									Toplam <span className="font-semibold text-foreground">{partners.length}</span> partner bulundu
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0 bg-gradient-to-b from-transparent to-muted/10">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gradient-to-r from-muted/80 via-muted/60 to-muted/40 hover:bg-muted/60 border-b-2">
									<TableHead className="w-16">Sıra</TableHead>
									<TableHead>Logo</TableHead>
									<TableHead>ID</TableHead>
									<TableHead className="text-right">İşlemler</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={4} className="h-[400px]">
											<div className="flex flex-col items-center justify-center gap-4">
												<Loader2 className="h-10 w-10 animate-spin text-primary" />
												<p className="text-sm text-muted-foreground font-medium">
													Yükleniyor...
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : isError ? (
									<TableRow>
										<TableCell colSpan={4} className="h-[400px]">
											<div className="flex flex-col items-center justify-center gap-4">
												<div className="rounded-full bg-destructive/10 p-3">
													<Handshake className="h-8 w-8 text-destructive" />
												</div>
												<div className="text-center">
													<p className="text-sm font-semibold text-destructive">
														Bir hata oluştu
													</p>
													<p className="text-sm text-muted-foreground mt-1">
														Lütfen sayfayı yenileyin
													</p>
												</div>
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
														<Handshake className="h-12 w-12 text-muted-foreground" />
													</EmptyMedia>
													<EmptyTitle>Partner bulunamadı</EmptyTitle>
													<EmptyDescription>
														Henüz partner eklenmemiş. Yeni bir partner ekleyerek başlayabilirsiniz.
													</EmptyDescription>
												</EmptyHeader>
												<EmptyContent>
													<Button
														onClick={() => navigate("/partners/create")}
														className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
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
				</CardContent>
			</Card>

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
		<TableRow className="hover:bg-muted/30 transition-colors border-b">
			<TableCell className="font-semibold">
				<Badge variant="outline" className="font-bold">
					{partner.orderIndex}
				</Badge>
			</TableCell>
			<TableCell>
				{partner.logo ? (
					<div className="relative group">
						<img
							src={partner.logo}
							alt={`Partner ${partner.orderIndex}`}
							className="h-16 w-16 object-contain border-2 border-border rounded-xl bg-card p-2 shadow-md group-hover:shadow-lg transition-shadow"
						/>
					</div>
				) : (
					<div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center border-2 border-border shadow-md">
						<Handshake className="h-8 w-8 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell className="font-semibold text-foreground">{partner.id}</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-muted"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem onClick={onView} className="cursor-pointer">
							<Eye className="h-4 w-4 mr-2" />
							Detayları Gör
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onEdit} className="cursor-pointer">
							<Edit className="h-4 w-4 mr-2" />
							Düzenle
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={onDelete}
							className="cursor-pointer text-destructive focus:text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Sil
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}

