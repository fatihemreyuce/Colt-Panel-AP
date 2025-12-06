import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBackups, useDeleteBackup } from "@/hooks/use-backups";
import { getAccessToken } from "@/utils/token-manager";
import { refreshTokens } from "@/utils/fetch-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Database,
	Download,
	Eye,
	CheckCircle2,
	XCircle,
	Clock,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { backupResponse } from "@/types/backups.types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

const getBackupTypeLabel = (type: string | undefined): string => {
	if (!type) return "-";
	switch (type.toUpperCase()) {
		case "UPLOADS":
			return "Yüklemeler";
		case "DATABASE":
			return "Veritabanı";
		case "FULL":
			return "Tam Yedekleme";
		default:
			return type;
	}
};

const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString("tr-TR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getStatusBadge = (status: backupResponse["status"]) => {
	switch (status) {
		case "COMPLETED":
		case "SUCCESS":
			return (
				<Badge variant="default" className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
					<CheckCircle2 className="h-3 w-3" />
					Tamamlandı
				</Badge>
			);
		case "IN_PROGRESS":
			return (
				<Badge variant="secondary" className="gap-1.5">
					<Clock className="h-3 w-3 animate-spin" />
					Devam Ediyor
				</Badge>
			);
		case "FAILED":
			return (
				<Badge variant="destructive" className="gap-1.5 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
					<XCircle className="h-3 w-3" />
					Başarısız
				</Badge>
			);
		default:
			return null;
	}
};

export default function BackupsListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// URL'den parametreleri oku
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);

	// Local state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);

	// Data fetching
	const { data, isLoading, isError } = useBackups(page, size);
	const deleteBackupMutation = useDeleteBackup();

	// URL parametrelerini güncelleme helper fonksiyonu
	const updateSearchParams = useCallback(
		(updater: (params: URLSearchParams) => void) => {
			setSearchParams((prev) => {
				const newParams = new URLSearchParams(prev);
				updater(newParams);
				return newParams;
			});
		},
		[setSearchParams]
	);

	// Sayfa değiştirme
	const handlePageChange = useCallback(
		(newPage: number) => {
			updateSearchParams((params) => {
				params.set("page", String(newPage));
			});
		},
		[updateSearchParams]
	);

	// Sayfa boyutu değiştirme
	const handleSizeChange = useCallback(
		(newSize: number) => {
			updateSearchParams((params) => {
				params.set("size", String(newSize));
				params.set("page", "0");
			});
		},
		[updateSearchParams]
	);

	// Silme işlemi
	const handleDelete = useCallback(async () => {
		if (selectedBackupId) {
			try {
				await deleteBackupMutation.mutateAsync(selectedBackupId);
				setDeleteModalOpen(false);
				setSelectedBackupId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedBackupId, deleteBackupMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((backupId: number) => {
		setSelectedBackupId(backupId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedBackupId(null);
	}, []);

	// Download işlemi
	const handleDownload = useCallback(async (backup: backupResponse) => {
		if (backup.status !== "COMPLETED" && backup.status !== "SUCCESS") {
			return;
		}

		try {
			let accessToken = getAccessToken();
			if (!accessToken) {
				const refreshed = await refreshTokens();
				if (!refreshed) {
					toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
					return;
				}
				accessToken = getAccessToken();
			}

			const response = await fetch(`/api/v1/admin/backups/${backup.id}/download`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "application/octet-stream",
				},
			});

			if (response.status === 401) {
				const refreshed = await refreshTokens();
				if (refreshed) {
					accessToken = getAccessToken();
					const retryResponse = await fetch(`/api/v1/admin/backups/${backup.id}/download`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${accessToken}`,
							"Accept": "application/octet-stream",
						},
					});
					if (retryResponse.ok) {
						const blob = await retryResponse.blob();
						downloadBlob(blob, backup.filename);
					} else {
						throw new Error("İndirme başarısız");
					}
				} else {
					throw new Error("Oturum süreniz dolmuş");
				}
			} else if (response.ok) {
				const blob = await response.blob();
				downloadBlob(blob, backup.filename);
			} else {
				const errorData = await response.json().catch(() => ({ message: "İndirme başarısız" }));
				toast.error(errorData.message || "İndirme başarısız");
			}
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Dosya indirilemedi. Lütfen tekrar deneyin.");
		}
	}, []);

	const downloadBlob = (blob: Blob, filename: string) => {
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	// Computed values
	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const backups = data?.content ?? [];

	const selectedBackup = useMemo(
		() => backups.find((backup) => backup.id === selectedBackupId),
		[backups, selectedBackupId]
	);

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div>
					<h1 className="text-h2 font-semibold text-foreground">Yedeklemeler</h1>
					<p className="text-p3 text-muted-foreground mt-1">Tüm yedeklemeleri görüntüleyin ve yönetin</p>
				</div>
				<Button
					onClick={() => navigate("/backups/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Yedekleme
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<Select value={String(size)} onValueChange={(value) => handleSizeChange(Number(value))}>
					<SelectTrigger className="w-[140px] h-11 border-border">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((option) => (
							<SelectItem key={option} value={String(option)}>
								{option} / sayfa
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50 hover:bg-muted/50">
							<TableHead className="w-16">ID</TableHead>
							<TableHead className="min-w-[200px]">Dosya Adı</TableHead>
							<TableHead className="min-w-[120px]">Tip</TableHead>
							<TableHead className="min-w-[120px]">Durum</TableHead>
							<TableHead className="min-w-[100px]">Boyut</TableHead>
							<TableHead className="min-w-[180px]">Oluşturulma</TableHead>
							<TableHead className="min-w-[180px]">Son Geçerlilik</TableHead>
							<TableHead className="w-32 text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={8} className="h-64">
									<div className="flex flex-col items-center justify-center gap-4">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
										<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
									</div>
								</TableCell>
							</TableRow>
						) : isError || backups.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="h-64">
									<Empty>
										<EmptyMedia>
											<Database className="h-12 w-12 text-muted-foreground" />
										</EmptyMedia>
										<EmptyHeader>
											<EmptyTitle>Yedekleme bulunamadı</EmptyTitle>
											<EmptyDescription>
												Henüz hiç yedekleme oluşturulmamış
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/backups/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												İlk Yedeklemeyi Oluştur
											</Button>
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						) : (
							backups.map((backup) => (
								<BackupTableRow
									key={backup.id}
									backup={backup}
									onView={() => navigate(`/backups/detail/${backup.id}`)}
									onDownload={() => handleDownload(backup)}
									onDelete={() => handleOpenDeleteModal(backup.id)}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-p3 text-muted-foreground">
						Toplam <span className="font-semibold text-foreground">{totalElements}</span> yedekleme
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={currentPage === 0 || isLoading}
							className="border-border hover:bg-accent"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-p3 font-semibold px-4 min-w-[120px] text-center text-foreground">
							Sayfa {currentPage + 1} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page + 1)}
							disabled={currentPage >= totalPages - 1 || isLoading}
							className="border-border hover:bg-accent"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDelete}
				onCancel={handleCloseDeleteModal}
				title="Yedeklemeyi Sil"
				description={`"${selectedBackup?.filename}" adlı yedeklemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedBackup?.filename || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteBackupMutation.isPending}
			/>
		</div>
	);
}

// Backup table row component
interface BackupTableRowProps {
	backup: backupResponse;
	onView: () => void;
	onDownload: () => void;
	onDelete: () => void;
}

function BackupTableRow({ backup, onView, onDownload, onDelete }: BackupTableRowProps) {
	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-semibold text-foreground">{backup.id}</TableCell>
			<TableCell>
				<div className="flex items-center gap-2">
					<Database className="h-4 w-4 text-muted-foreground" />
					<span className="text-p3 font-medium text-foreground">{backup.filename}</span>
				</div>
			</TableCell>
			<TableCell>
				{(() => {
					const backupType = (backup as any).backup_type || (backup as any).backupType;
					return backupType ? (
						<Badge variant="outline" className="bg-muted/50">
							{getBackupTypeLabel(backupType)}
						</Badge>
					) : (
						<span className="text-p3 text-muted-foreground">-</span>
					);
				})()}
			</TableCell>
			<TableCell>{getStatusBadge(backup.status)}</TableCell>
			<TableCell>
				{(() => {
					const fileSize = (backup as any).file_size || (backup as any).fileSize;
					return fileSize ? (
						<span className="text-p3 text-muted-foreground">{formatFileSize(fileSize)}</span>
					) : (
						<span className="text-p3 text-muted-foreground">-</span>
					);
				})()}
			</TableCell>
			<TableCell>
				<span className="text-p3 text-foreground">{backup.createdAt ? formatDate(backup.createdAt) : "-"}</span>
			</TableCell>
			<TableCell>
				<span className="text-p3 text-foreground">{backup.expiresAt ? formatDate(backup.expiresAt) : "-"}</span>
			</TableCell>
			<TableCell>
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={onView}
						className="h-8 w-8 hover:bg-accent"
					>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</Button>
					{backup.status === "COMPLETED" && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onDownload}
							className="h-8 w-8 hover:bg-accent"
							title="İndir"
						>
							<Download className="h-4 w-4 text-muted-foreground" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={onDelete}
						className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

