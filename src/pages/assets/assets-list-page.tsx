import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const parseSort = (sortString: string): SortConfig => {
	const [field, order] = sortString.split(",");
	return {
		field: (field as SortField) || DEFAULT_SORT.field,
		order: (order?.toUpperCase() as SortOrder) || DEFAULT_SORT.order,
	};
};

const formatSort = (config: SortConfig): string => {
	return `${config.field},${config.order}`;
};

export default function AssetsListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);
	const sortString = searchParams.get("sort") || formatSort(DEFAULT_SORT);
	const sortConfig = useMemo(() => parseSort(sortString), [sortString]);

	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

	const { data, isLoading, isError } = useAssets(search, page, size, sortString);
	const deleteAssetMutation = useDeleteAsset();

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

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

	const handleClearSearch = useCallback(() => {
		setSearchInput("");
		updateSearchParams((params) => {
			params.delete("search");
			params.set("page", "0");
		});
	}, [updateSearchParams]);

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

	const handlePageChange = useCallback(
		(newPage: number) => {
			updateSearchParams((params) => {
				params.set("page", String(newPage));
			});
		},
		[updateSearchParams]
	);

	const handleSizeChange = useCallback(
		(newSize: number) => {
			updateSearchParams((params) => {
				params.set("size", String(newSize));
				params.set("page", "0");
			});
		},
		[updateSearchParams]
	);

	const handleDelete = useCallback(async () => {
		if (selectedAssetId) {
			try {
				await deleteAssetMutation.mutateAsync(selectedAssetId);
				setDeleteModalOpen(false);
				setSelectedAssetId(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	}, [selectedAssetId, deleteAssetMutation]);

	const handleOpenDeleteModal = useCallback((assetId: number) => {
		setSelectedAssetId(assetId);
		setDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedAssetId(null);
	}, []);

	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const assets = data?.content ?? [];

	const selectedAsset = useMemo(
		() => assets.find((asset) => asset.id === selectedAssetId),
		[assets, selectedAssetId]
	);

	const SortIndicator = ({ field }: { field: SortField }) => {
		if (sortConfig.field !== field) {
			return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
		}
		return (
			<span className="text-primary font-semibold">
				{sortConfig.order === "ASC" ? "↑" : "↓"}
			</span>
		);
	};

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
				className="flex items-center gap-2 hover:text-primary transition-colors w-full text-left font-bold group"
			>
				{children}
				<SortIndicator field={field} />
			</button>
		</TableHead>
	);

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header Section */}
			<div className="flex flex-col gap-6">
				{/* Title and Create Button */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<ImageIcon className="h-6 w-6 text-primary" />
						</div>
						<div className="space-y-1">
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
								Medya Listesi
							</h1>
							<p className="text-muted-foreground text-sm">
								Tüm medyaları görüntüleyin ve yönetin
							</p>
						</div>
					</div>
					<Button
						onClick={() => navigate("/assets/create")}
						className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						size="lg"
					>
						<Plus className="h-5 w-5 mr-2" />
						Yeni Medya
					</Button>
				</div>
				
				{/* Search */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative flex-1 w-full sm:w-auto">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Medya ara..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-10 pr-10 h-11 w-full sm:w-[300px]"
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
					<Select value={size.toString()} onValueChange={(value) => handleSizeChange(Number(value))}>
						<SelectTrigger className="h-11 w-full sm:w-[140px]">
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
			</div>

			{/* Table Section */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
								<ImageIcon className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Medya Listesi</CardTitle>
								<CardDescription className="text-xs">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> medya bulundu
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0 bg-gradient-to-b from-transparent to-muted/10">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gradient-to-r from-muted/50 via-muted/30 to-transparent hover:bg-muted/60 border-b-2 border-border/50">
									<SortableHeader field="id">
										<span className="text-sm font-bold text-foreground">ID</span>
									</SortableHeader>
									<SortableHeader field="type">
										<span className="text-sm font-bold text-foreground">Tip</span>
									</SortableHeader>
									<TableHead>
										<span className="text-sm font-bold text-foreground">Görsel</span>
									</TableHead>
									<TableHead>
										<span className="text-sm font-bold text-foreground">Başlık</span>
									</TableHead>
									<TableHead>
										<span className="text-sm font-bold text-foreground">Boyut</span>
									</TableHead>
									<TableHead className="text-right">
										<span className="text-sm font-bold text-foreground">İşlemler</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="h-[400px]">
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
										<TableCell colSpan={6} className="h-[400px]">
											<div className="flex flex-col items-center justify-center gap-4">
												<div className="rounded-full bg-destructive/10 p-3">
													<ImageIcon className="h-8 w-8 text-destructive" />
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
								) : assets.length > 0 ? (
									assets.map((asset) => (
										<AssetTableRow
											key={asset.id}
											asset={asset}
											onView={() => navigate(`/assets/detail/${asset.id}`)}
											onEdit={() => navigate(`/assets/edit/${asset.id}`)}
											onDelete={() => handleOpenDeleteModal(asset.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-[400px] p-0">
											<Empty className="border-0 py-12">
												<EmptyHeader>
													<EmptyMedia variant="icon">
														<div className="rounded-full bg-muted p-4">
															<ImageIcon className="h-8 w-8 text-muted-foreground" />
														</div>
													</EmptyMedia>
													<EmptyTitle>Medya bulunamadı</EmptyTitle>
													<EmptyDescription>
														{search
															? "Arama kriterlerinize uygun medya bulunamadı. Lütfen farklı bir arama terimi deneyin."
															: "Henüz medya eklenmemiş. Yeni bir medya ekleyerek başlayabilirsiniz."}
													</EmptyDescription>
												</EmptyHeader>
												<EmptyContent>
													<Button
														onClick={() => navigate("/assets/create")}
														className="bg-primary text-primary-foreground hover:bg-primary/90"
													>
														<Plus className="h-4 w-4 mr-2" />
														Yeni Medya Ekle
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
			{totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="text-sm text-muted-foreground">
						Sayfa <span className="font-bold text-foreground">{currentPage + 1}</span> /{" "}
						<span className="font-bold text-foreground">{totalPages}</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={currentPage === 0 || isLoading}
							className="h-9 border-2 border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary hover:scale-105 transition-all shadow-sm disabled:opacity-50"
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Önceki
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page + 1)}
							disabled={currentPage >= totalPages - 1 || isLoading}
							className="h-9 border-2 border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary hover:scale-105 transition-all shadow-sm disabled:opacity-50"
						>
							Sonraki
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDelete}
				onCancel={handleCloseDeleteModal}
				title="Medyayı Sil"
				description={`Bu medyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedAsset ? (getPreferredLocalization(selectedAsset.localizations)?.title || "Medya") : "Medya"}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteAssetMutation.isPending}
			/>
		</div>
	);
}

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
		<TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 group border-b border-border/30">
			<TableCell className="font-bold text-green-500 py-4">{asset.id}</TableCell>
			<TableCell className="py-4">
				<Badge variant="secondary" className="font-medium px-3 py-1 bg-blue-500/20 border-blue-500/30 text-blue-500">
					{asset.type}
				</Badge>
			</TableCell>
			<TableCell className="py-4">
				{asset.url ? (
					<div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-border shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
						<img
							src={asset.url}
							alt={defaultTitle}
							className="w-full h-full object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>
				) : (
					<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center shadow-sm">
						<ImageIcon className="h-5 w-5 text-muted-foreground/50" />
					</div>
				)}
			</TableCell>
			<TableCell className="py-4">
				<div className="max-w-[200px]">
					<p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{defaultTitle}</p>
					{defaultDescription && (
						<p className="text-xs text-muted-foreground truncate mt-1">
							{defaultDescription.replace(/<[^>]*>/g, "").substring(0, 50)}...
						</p>
					)}
				</div>
			</TableCell>
			<TableCell className="py-4">
				<span className="text-sm text-foreground">
					{asset.width} × {asset.height}
				</span>
			</TableCell>
			<TableCell className="text-right py-4">
				<div className="flex items-center justify-end gap-1.5">
					<Button
						variant="ghost"
						size="sm"
						onClick={onView}
						className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-500 transition-all duration-200 rounded-lg"
						title="Görüntüle"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onEdit}
						className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-200 rounded-lg"
						title="Düzenle"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onDelete}
						className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 rounded-lg"
						title="Sil"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
