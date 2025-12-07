import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
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
	Image as ImageIcon,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { assetResponse, localization } from "@/types/assets.types";

// Helper function to get Turkish localization first, fallback to first available
const getPreferredLocalization = (localizations: localization[]): localization | null => {
	if (!localizations || localizations.length === 0) return null;
	
	// Try to find Turkish first
	const turkish = localizations.find(loc => loc.languageCode.toLowerCase() === "tr");
	if (turkish) return turkish;
	
	// Fallback to first available
	return localizations[0];
};

type SortField = "id" | "type" | "createdAt";
type SortOrder = "ASC" | "DESC";

interface SortConfig {
	field: SortField;
	order: SortOrder;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT: SortConfig = { field: "createdAt", order: "DESC" };
const DEBOUNCE_DELAY = 500;

// Utility function to parse sort string
const parseSort = (sortString: string): SortConfig => {
	const [field, order] = sortString.split(",");
	return {
		field: (field as SortField) || DEFAULT_SORT.field,
		order: (order?.toUpperCase() as SortOrder) || DEFAULT_SORT.order,
	};
};

// Utility function to format sort string
const formatSort = (config: SortConfig): string => {
	return `${config.field},${config.order}`;
};

export default function AssetsListPage() {
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
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

	// Data fetching
	const { data, isLoading, isError } = useAssets(search, page, size, sortString);
	const deleteAssetMutation = useDeleteAsset();

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
				sortConfig.field === field && sortConfig.order === "ASC" ? "DESC" : "ASC";
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
		if (selectedAssetId) {
			try {
				await deleteAssetMutation.mutateAsync(selectedAssetId);
				setDeleteModalOpen(false);
				setSelectedAssetId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedAssetId, deleteAssetMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((assetId: number) => {
		setSelectedAssetId(assetId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedAssetId(null);
	}, []);

	// Computed values
	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const assets = data?.content ?? [];

	const selectedAsset = useMemo(
		() => assets.find((asset) => asset.id === selectedAssetId),
		[assets, selectedAssetId]
	);

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div>
					<h1 className="text-h2 font-semibold text-foreground">Setler</h1>
					<p className="text-p3 text-muted-foreground mt-1">Tüm setleri görüntüleyin ve yönetin</p>
				</div>
				<Button
					onClick={() => navigate("/assets/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Set
				</Button>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Set ara..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-10 h-11 border-border focus-visible:ring-ring"
					/>
					{searchInput && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
							onClick={handleClearSearch}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
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
							<TableHead className="w-16">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => handleSort("id")}
								>
									<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
								</Button>
							</TableHead>
							<TableHead className="min-w-[200px]">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 font-semibold text-foreground hover:bg-transparent"
									onClick={() => handleSort("type")}
								>
									Tip
									<ArrowUpDown className="h-3 w-3 ml-2 text-muted-foreground" />
								</Button>
							</TableHead>
							<TableHead className="min-w-[200px]">Görsel</TableHead>
							<TableHead className="min-w-[200px]">Başlık</TableHead>
							<TableHead className="min-w-[150px]">Boyut</TableHead>
							<TableHead className="w-32 text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-64">
									<div className="flex flex-col items-center justify-center gap-4">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
										<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
									</div>
								</TableCell>
							</TableRow>
						) : isError || assets.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-64">
									<Empty>
										<EmptyMedia>
											<ImageIcon className="h-12 w-12 text-muted-foreground" />
										</EmptyMedia>
										<EmptyHeader>
											<EmptyTitle>Set bulunamadı</EmptyTitle>
											<EmptyDescription>
												{search
													? "Arama kriterlerinize uygun set bulunamadı"
													: "Henüz hiç set eklenmemiş"}
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											{search ? (
												<Button
													variant="outline"
													onClick={handleClearSearch}
													className="border-border hover:bg-accent"
												>
													Aramayı Temizle
												</Button>
											) : (
												<Button
													onClick={() => navigate("/assets/create")}
													className="bg-primary text-primary-foreground hover:bg-primary/90"
												>
													<Plus className="h-4 w-4 mr-2" />
													İlk Seti Oluştur
												</Button>
											)}
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						) : (
							assets.map((asset) => (
								<AssetTableRow
									key={asset.id}
									asset={asset}
									onView={() => navigate(`/assets/detail/${asset.id}`)}
									onEdit={() => navigate(`/assets/edit/${asset.id}`)}
									onDelete={() => handleOpenDeleteModal(asset.id)}
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
						Toplam <span className="font-semibold text-foreground">{totalElements}</span> set
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
				title="Seti Sil"
				description={`Bu seti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedAsset ? (getPreferredLocalization(selectedAsset.localizations)?.title || "Set") : "Set"}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteAssetMutation.isPending}
			/>
		</div>
	);
}

// Asset table row component
interface AssetTableRowProps {
	asset: assetResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function AssetTableRow({ asset, onView, onEdit, onDelete }: AssetTableRowProps) {
	const preferredLoc = getPreferredLocalization(asset.localizations);
	const defaultTitle = preferredLoc?.title || "Başlık yok";
	const defaultDescription = preferredLoc?.description || "";

	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-semibold text-foreground">{asset.id}</TableCell>
			<TableCell>
				<span className="text-p3 font-medium text-foreground bg-muted px-3 py-1 rounded-md">
					{asset.type}
				</span>
			</TableCell>
			<TableCell>
				{asset.url ? (
					<div className="flex items-center gap-2">
						<img
							src={asset.url}
							alt={defaultTitle}
							className="w-16 h-16 object-cover rounded-lg border border-border"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
							}}
						/>
					</div>
				) : (
					<div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
						<ImageIcon className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell>
				<div className="max-w-[200px]">
					<p className="text-p3 font-medium text-foreground truncate">{defaultTitle}</p>
					{defaultDescription && (
						<p className="text-p4 text-muted-foreground truncate mt-1">
							{defaultDescription.replace(/<[^>]*>/g, "").substring(0, 50)}...
						</p>
					)}
				</div>
			</TableCell>
			<TableCell>
				<span className="text-p3 text-muted-foreground">
					{asset.width} × {asset.height}
				</span>
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
					<Button
						variant="ghost"
						size="icon"
						onClick={onEdit}
						className="h-8 w-8 hover:bg-accent"
					>
						<Edit className="h-4 w-4 text-muted-foreground" />
					</Button>
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

