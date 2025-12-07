import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotifications, useDeleteNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Bell className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Bildirimler
						</h1>
					</div>
					<p className="text-muted-foreground ml-[52px] text-sm">
						Tüm bildirimleri görüntüleyin ve yönetin
					</p>
				</div>
				<Button
					onClick={() => navigate("/notifications/create")}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					size="lg"
				>
					<Plus className="h-5 w-5 mr-2" />
					Yeni Bildirim
				</Button>
			</div>

			{/* Filters Section */}
			<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Bildirim ara..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-10 pr-10 h-11"
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
							<SelectTrigger className="w-full sm:w-[140px] h-11">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZE_OPTIONS.map((option) => (
									<SelectItem key={option} value={option.toString()}>
										{option} / sayfa
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Table Section */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-transparent border-b">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-1.5 rounded-lg bg-primary/10">
								<Bell className="h-4 w-4 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold">Bildirim Listesi</CardTitle>
								<CardDescription className="text-xs mt-0.5">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> bildirim bulundu
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
									<SortableHeader field="id">ID</SortableHeader>
									<SortableHeader field="title">Başlık</SortableHeader>
									<TableHead>İçerik</TableHead>
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
													<Bell className="h-8 w-8 text-destructive" />
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
														<Bell className="h-12 w-12 text-muted-foreground" />
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
														className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
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
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 0 && (
				<Card className="border-2 shadow-lg bg-gradient-to-r from-card to-card/50 backdrop-blur-sm">
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-muted-foreground">
								Toplam <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">{totalElements}</span> bildirim
								{totalPages > 1 && (
									<>
										{" • "}
										Sayfa <span className="font-bold text-primary">{currentPage + 1}</span> /{" "}
										<span className="font-bold text-foreground">{totalPages}</span>
									</>
								)}
							</div>
							{totalPages > 1 && (
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 0 || isLoading}
										className="h-9 border-2 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all shadow-sm"
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Önceki
									</Button>
									<div className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 text-sm font-bold text-primary shadow-sm">
										{currentPage + 1} / {totalPages}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage >= totalPages - 1 || isLoading}
										className="h-9 border-2 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all shadow-sm"
									>
										Sonraki
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

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
	// HTML içeriğinden metin çıkar
	const getTextContent = (html: string): string => {
		const div = document.createElement("div");
		div.innerHTML = html;
		return div.textContent || div.innerText || "";
	};

	const textContent = getTextContent(notification.content);
	const truncatedContent = textContent.length > 100 
		? `${textContent.substring(0, 100)}...` 
		: textContent;

	return (
		<TableRow className="hover:bg-muted/30 transition-colors border-b">
			<TableCell className="font-semibold text-foreground">{notification.id}</TableCell>
			<TableCell>
				<div className="font-semibold text-foreground">{notification.title}</div>
			</TableCell>
			<TableCell>
				<div className="text-sm text-muted-foreground max-w-md truncate">
					{truncatedContent}
				</div>
			</TableCell>
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

