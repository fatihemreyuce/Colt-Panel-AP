import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotifications, useDeleteNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	Search,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Eye,
	X,
	Loader2,
	Bell,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { notificationResponse } from "@/types/notifications.types";

type SortField = "id" | "title";
type SortOrder = "asc" | "desc";

interface SortConfig {
	field: SortField;
	order: SortOrder;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: SortConfig = { field: "id", order: "desc" };
const DEBOUNCE_DELAY = 500;

// Utility function to parse sort string
const parseSort = (sortString: string): SortConfig => {
	const [field, order] = sortString.split(",");
	return {
		field: (field as SortField) || DEFAULT_SORT.field,
		order: (order?.toLowerCase() as SortOrder) || DEFAULT_SORT.order,
	};
};

// Utility function to format sort string
const formatSort = (config: SortConfig): string => {
	return `${config.field},${config.order}`;
};

export default function NotificationsListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// URL'den parametreleri oku
	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);
	const sortString = searchParams.get("sort") || formatSort(DEFAULT_SORT);
	const sortConfig = useMemo(() => parseSort(sortString), [sortString]);

	// Local state
	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

	// İlk render'da URL parametrelerini set et
	useEffect(() => {
		const hasParams = searchParams.has("page") || searchParams.has("size") || searchParams.has("sort");
		if (!hasParams) {
			setSearchParams((prev) => {
				const newParams = new URLSearchParams(prev);
				newParams.set("page", "0");
				newParams.set("size", String(DEFAULT_PAGE_SIZE));
				newParams.set("sort", formatSort(DEFAULT_SORT));
				return newParams;
			}, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	// Data fetching
	const { data, isLoading, isError } = useNotifications(page, size, sortString);
	const deleteNotificationMutation = useDeleteNotification();

	// URL'den gelen search değerini searchInput'a senkronize et
	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	// Debounced search - URL parametresini güncelle
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== search) {
				setSearchParams((prev) => {
					const newParams = new URLSearchParams(prev);
					if (searchInput.trim()) {
						newParams.set("search", searchInput.trim());
					} else {
						newParams.delete("search");
					}
					newParams.set("page", "0");
					return newParams;
				});
			}
		}, DEBOUNCE_DELAY);

		return () => clearTimeout(timer);
	}, [searchInput, search, setSearchParams]);

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

	// Search temizleme
	const handleClearSearch = useCallback(() => {
		setSearchInput("");
		updateSearchParams((params) => {
			params.delete("search");
			params.set("page", "0");
		});
	}, [updateSearchParams]);

	// Sort işlemi
	const handleSort = useCallback(
		(field: SortField) => {
			const newOrder =
				sortConfig.field === field && sortConfig.order === "asc" ? "desc" : "asc";
			const newSort = formatSort({ field, order: newOrder });

			updateSearchParams((params) => {
				params.set("sort", newSort);
				params.set("page", "0");
			});
		},
		[sortConfig, updateSearchParams]
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
		if (selectedNotificationId) {
			try {
				await deleteNotificationMutation.mutateAsync(selectedNotificationId);
				setDeleteModalOpen(false);
				setSelectedNotificationId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedNotificationId, deleteNotificationMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((notificationId: number) => {
		setSelectedNotificationId(notificationId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedNotificationId(null);
	}, []);

	// Computed values
	// Backend nested yapı döndürüyor: data.page.totalPages
	const totalPages = (data as any)?.page?.totalPages ?? data?.totalPages ?? 0;
	const currentPage = (data as any)?.page?.number ?? data?.number ?? 0;
	const totalElements = (data as any)?.page?.totalElements ?? data?.totalElements ?? 0;
	const notifications = data?.content ?? [];

	const selectedNotification = useMemo(
		() => notifications.find((notification) => notification.id === selectedNotificationId),
		[notifications, selectedNotificationId]
	);

	// Sort indicator component
	const SortIndicator = ({ field }: { field: SortField }) => {
		if (sortConfig.field !== field) {
			return <ArrowUpDown className="h-4 w-4 opacity-50" />;
		}
		return (
			<span className="text-primary text-xs font-semibold">
				{sortConfig.order === "asc" ? "↑" : "↓"}
			</span>
		);
	};

	// Sortable table header component
	const SortableHeader = ({
		field,
		children,
	}: {
		field: SortField;
		children: React.ReactNode;
	}) => (
		<TableHead>
			<button
				onClick={() => handleSort(field)}
				className="flex items-center gap-2 hover:text-primary transition-colors w-full text-left font-semibold"
			>
				{children}
				<SortIndicator field={field} />
			</button>
		</TableHead>
	);

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<h1 className="text-h2 font-semibold text-foreground">
					Bildirimler
				</h1>
				<Button
					onClick={() => navigate("/notifications/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Bildirim
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center justify-between gap-4">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Bildirim ara..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-10 pr-10"
					/>
					{searchInput && (
						<button
							onClick={handleClearSearch}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Aramayı temizle"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Page Size */}
				<Select value={size.toString()} onValueChange={(value) => handleSizeChange(Number(value))}>
					<SelectTrigger className="w-[120px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((option) => (
							<SelectItem key={option} value={option.toString()}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<SortableHeader field="id">ID</SortableHeader>
							<SortableHeader field="title">Başlık</SortableHeader>
							<TableHead>İçerik</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-12">
									<div className="flex flex-col items-center justify-center gap-3">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
										<p className="text-p3 text-muted-foreground">
											Yükleniyor...
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : isError ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-12">
									<div className="flex flex-col items-center justify-center gap-3">
										<p className="text-p3 font-semibold text-destructive">
											Bir hata oluştu
										</p>
										<p className="text-p3 text-muted-foreground">
											Lütfen sayfayı yenileyin
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : notifications.length > 0 ? (
							notifications.map((notification) => (
								<NotificationTableRow
									key={notification.id}
									notification={notification}
									onView={() => navigate(`/notifications/detail/${notification.id}`)}
									onEdit={() => navigate(`/notifications/edit/${notification.id}`)}
									onDelete={() => handleOpenDeleteModal(notification.id)}
								/>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="p-0">
									<Empty className="border-0 py-12">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Bell className="h-6 w-6" />
											</EmptyMedia>
											<EmptyTitle>Bildirim bulunamadı</EmptyTitle>
											<EmptyDescription>
												{search
													? "Arama kriterlerinize uygun bildirim bulunamadı. Lütfen farklı bir arama terimi deneyin veya yeni bir bildirim ekleyin."
													: "Henüz bildirim eklenmemiş. Yeni bir bildirim ekleyerek başlayabilirsiniz."}
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/notifications/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												Yeni Bildirim Ekle
											</Button>
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="text-p3 text-muted-foreground">
					Toplam <span className="font-semibold text-foreground">{totalElements}</span> bildirim
				</div>
				<div className="flex items-center gap-1">
					{/* Önceki butonu */}
					{currentPage > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={isLoading}
							className="h-9 text-foreground hover:bg-muted"
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Önceki
						</Button>
					)}
					
					{/* Sayfa 1 */}
					<Button
						variant={currentPage === 0 ? "default" : "ghost"}
						size="sm"
						onClick={() => handlePageChange(0)}
						disabled={isLoading}
						className={`h-9 min-w-[40px] ${
							currentPage === 0 
								? "bg-muted text-foreground hover:bg-muted/80" 
								: "text-foreground hover:bg-muted"
						}`}
					>
						1
					</Button>
					
					{/* Sayfa 2 */}
					{totalPages > 1 && (
						<Button
							variant={currentPage === 1 ? "default" : "ghost"}
							size="sm"
							onClick={() => handlePageChange(1)}
							disabled={isLoading}
							className={`h-9 min-w-[40px] ${
								currentPage === 1 
									? "bg-muted text-foreground hover:bg-muted/80" 
									: "text-foreground hover:bg-muted"
							}`}
						>
							2
						</Button>
					)}
					
					{/* Sayfa 3 (eğer sayfa 1 veya 2'deysek) */}
					{(currentPage === 0 || currentPage === 1) && totalPages > 2 && (
						<Button
							variant={currentPage === 2 ? "default" : "ghost"}
							size="sm"
							onClick={() => handlePageChange(2)}
							disabled={isLoading}
							className={`h-9 min-w-[40px] ${
								currentPage === 2 
									? "bg-muted text-foreground hover:bg-muted/80" 
									: "text-foreground hover:bg-muted"
							}`}
						>
							3
						</Button>
					)}
					
					{/* Üç nokta (mevcut sayfa 2'den büyükse) */}
					{currentPage > 2 && (
						<span className="text-p3 text-muted-foreground px-1">...</span>
					)}
					
					{/* Sonraki butonu */}
					{currentPage < totalPages - 1 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={isLoading}
							className="h-9 text-foreground hover:bg-muted"
						>
							Sonraki
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					)}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDelete}
				onCancel={handleCloseDeleteModal}
				title="Bildirimi Sil"
				description={`"${selectedNotification?.title}" başlıklı bildirimi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedNotification?.title || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteNotificationMutation.isPending}
			/>
		</div>
	);
}

// Notification table row component
interface NotificationTableRowProps {
	notification: notificationResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function NotificationTableRow({ notification, onView, onEdit, onDelete }: NotificationTableRowProps) {
	const truncatedContent = notification.content.length > 100 
		? `${notification.content.substring(0, 100)}...` 
		: notification.content;

	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-medium">{notification.id}</TableCell>
			<TableCell>
				<div className="font-semibold text-foreground">{notification.title}</div>
			</TableCell>
			<TableCell>
				<div className="text-p3 text-muted-foreground max-w-md truncate">
					{truncatedContent}
				</div>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={onView}
						className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={onEdit}
						className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={onDelete}
						className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

