import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useComponents, useDeleteComponent } from "@/hooks/use-components";
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
	Box,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { componentResponse } from "@/types/components.types";

type SortField = "id" | "name" | "type";
type SortOrder = "ASC" | "DESC";

interface SortConfig {
	field: SortField;
	order: SortOrder;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT: SortConfig = { field: "id", order: "DESC" };
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

export default function ComponentsListPage() {
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
	const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);

	// Data fetching
	const { data, isLoading, isError } = useComponents(search, page, size, sortString);
	const deleteComponentMutation = useDeleteComponent();

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
		if (selectedComponentId) {
			try {
				await deleteComponentMutation.mutateAsync(selectedComponentId);
				setDeleteModalOpen(false);
				setSelectedComponentId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedComponentId, deleteComponentMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((id: number) => {
		setSelectedComponentId(id);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedComponentId(null);
	}, []);

	// Computed values
	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const components = data?.content ?? [];

	const selectedComponent = useMemo(
		() => components.find((c) => c.id === selectedComponentId),
		[components, selectedComponentId]
	);

	// Sort indicator component
	const SortIndicator = ({ field }: { field: SortField }) => {
		if (sortConfig.field !== field) {
			return <ArrowUpDown className="h-4 w-4 opacity-50" />;
		}
		return (
			<span className="text-primary text-xs font-semibold">
				{sortConfig.order === "ASC" ? "↑" : "↓"}
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
					Bileşenler
				</h1>
				<Button
					onClick={() => navigate("/components/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Bileşen
				</Button>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Bileşen ara..."
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
							<SortableHeader field="name">Ad</SortableHeader>
							<SortableHeader field="type">Tip</SortableHeader>
							<TableHead>Değer</TableHead>
							<TableHead>Setler</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-12">
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
								<TableCell colSpan={6} className="text-center py-12">
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
						) : components.length > 0 ? (
							components.map((component) => (
								<ComponentTableRow
									key={component.id}
									component={component}
									onView={() => navigate(`/components/detail/${component.id}`)}
									onEdit={() => navigate(`/components/edit/${component.id}`)}
									onDelete={() => handleOpenDeleteModal(component.id)}
								/>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="p-0">
									<Empty className="border-0 py-12">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Box className="h-6 w-6" />
											</EmptyMedia>
											<EmptyTitle>Bileşen bulunamadı</EmptyTitle>
											<EmptyDescription>
												{search
													? "Arama kriterlerinize uygun bileşen bulunamadı. Lütfen farklı bir arama terimi deneyin."
													: "Henüz bileşen eklenmemiş. Yeni bir bileşen ekleyerek başlayabilirsiniz."}
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/components/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												Yeni Bileşen Ekle
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
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-p3 text-muted-foreground">
						Toplam <span className="font-semibold text-foreground">{totalElements}</span> bileşen
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={currentPage === 0 || isLoading}
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
				title="Bileşeni Sil"
				description={`"${selectedComponent?.name}" adlı bileşeni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedComponent?.name || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteComponentMutation.isPending}
			/>
		</div>
	);
}

// Component table row component
interface ComponentTableRowProps {
	component: componentResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function ComponentTableRow({ component, onView, onEdit, onDelete }: ComponentTableRowProps) {
	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-medium">{component.id}</TableCell>
			<TableCell className="font-medium">{component.name}</TableCell>
			<TableCell>
				<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
					{component.type}
				</span>
			</TableCell>
			<TableCell>
				{component.value ? (
					<span className="text-p3 text-foreground">{component.value}</span>
				) : (
					<span className="text-p3 text-muted-foreground">-</span>
				)}
			</TableCell>
			<TableCell>
				<span className="text-p3 text-foreground">{component.assets?.length || 0} set</span>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={onView}
						className="h-8 w-8 p-0"
						title="Detayları Görüntüle"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onEdit}
						className="h-8 w-8 p-0"
						title="Düzenle"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onDelete}
						className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
						title="Sil"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

