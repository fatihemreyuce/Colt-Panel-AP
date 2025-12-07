import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotificationSubscribers, useDeleteNotificationSubscriber } from "@/hooks/use-notification-subscribers";
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
	Trash2,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Eye,
	X,
	Loader2,
	Mail,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { notificationSubscriberResponse } from "@/types/notification-subscribers.types";

type SortField = "id" | "email";
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

export default function NotificationSubscribersListPage() {
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
	const [selectedSubscriberId, setSelectedSubscriberId] = useState<number | null>(null);

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
	const { data, isLoading, isError } = useNotificationSubscribers(page, size, sortString);
	const deleteSubscriberMutation = useDeleteNotificationSubscriber();

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
		if (selectedSubscriberId) {
			try {
				await deleteSubscriberMutation.mutateAsync(selectedSubscriberId);
				setDeleteModalOpen(false);
				setSelectedSubscriberId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedSubscriberId, deleteSubscriberMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((subscriberId: number) => {
		setSelectedSubscriberId(subscriberId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedSubscriberId(null);
	}, []);

	// Computed values
	// Backend nested yapı döndürüyor: data.page.totalPages
	const totalPages = (data as any)?.page?.totalPages ?? data?.totalPages ?? 0;
	const currentPage = (data as any)?.page?.number ?? data?.number ?? 0;
	const totalElements = (data as any)?.page?.totalElements ?? data?.totalElements ?? 0;
	const subscribers = data?.content ?? [];

	const selectedSubscriber = useMemo(
		() => subscribers.find((subscriber) => subscriber.id === selectedSubscriberId),
		[subscribers, selectedSubscriberId]
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
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Bildirim Aboneleri
						</h1>
					</div>
					<p className="text-muted-foreground ml-[52px] text-sm">
						Tüm aboneleri görüntüleyin ve yönetin
					</p>
				</div>
				<Button
					onClick={() => navigate("/notification-subscribers/create")}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					size="lg"
				>
					<Plus className="h-5 w-5 mr-2" />
					Yeni Abone
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
								placeholder="E-posta ara..."
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
								<Mail className="h-4 w-4 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold">Abone Listesi</CardTitle>
								<CardDescription className="text-xs mt-0.5">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> abone bulundu
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
									<SortableHeader field="email">E-posta</SortableHeader>
									<TableHead className="text-right">İşlemler</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={3} className="h-[400px]">
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
										<TableCell colSpan={3} className="h-[400px]">
											<div className="flex flex-col items-center justify-center gap-4">
												<div className="rounded-full bg-destructive/10 p-3">
													<Mail className="h-8 w-8 text-destructive" />
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
								) : subscribers.length > 0 ? (
									subscribers.map((subscriber) => (
										<SubscriberTableRow
											key={subscriber.id}
											subscriber={subscriber}
											onView={() => navigate(`/notification-subscribers/detail/${subscriber.id}`)}
											onDelete={() => handleOpenDeleteModal(subscriber.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={3} className="p-0">
											<Empty className="border-0 py-12">
												<EmptyHeader>
													<EmptyMedia variant="icon">
														<Mail className="h-12 w-12 text-muted-foreground" />
													</EmptyMedia>
													<EmptyTitle>Abone bulunamadı</EmptyTitle>
													<EmptyDescription>
														{search
															? "Arama kriterlerinize uygun abone bulunamadı. Lütfen farklı bir arama terimi deneyin veya yeni bir abone ekleyin."
															: "Henüz abone eklenmemiş. Yeni bir abone ekleyerek başlayabilirsiniz."}
													</EmptyDescription>
												</EmptyHeader>
												<EmptyContent>
													<Button
														onClick={() => navigate("/notification-subscribers/create")}
														className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
													>
														<Plus className="h-4 w-4 mr-2" />
														Yeni Abone Ekle
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
			<div className="flex items-center justify-between">
				<div className="text-p3 text-muted-foreground">
					Toplam <span className="font-semibold text-foreground">{totalElements}</span> abone
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
				title="Aboneyi Sil"
				description={`"${selectedSubscriber?.email}" e-posta adresli aboneyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedSubscriber?.email || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteSubscriberMutation.isPending}
			/>
		</div>
	);
}

// Subscriber table row component
interface SubscriberTableRowProps {
	subscriber: notificationSubscriberResponse;
	onView: () => void;
	onDelete: () => void;
}

function SubscriberTableRow({ subscriber, onView, onDelete }: SubscriberTableRowProps) {
	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-medium">{subscriber.id}</TableCell>
			<TableCell>
				<div className="font-semibold text-foreground flex items-center gap-2">
					<Mail className="h-4 w-4 text-muted-foreground" />
					{subscriber.email}
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

