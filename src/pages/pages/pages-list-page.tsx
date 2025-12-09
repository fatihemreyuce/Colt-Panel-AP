import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePages, useDeletePage } from "@/hooks/use-page";
import { usePageTypes } from "@/hooks/use-page-type";
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
	FileText,
	Filter,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { PageResponse } from "@/types/page.types";

type SortField = "id" | "name" | "slug" | "type";
type SortOrder = "ASC" | "DESC";

interface SortConfig {
	field: SortField;
	order: SortOrder;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT: SortConfig = { field: "id", order: "DESC" };
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

export default function PagesListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";
	const type = searchParams.get("type") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);
	const sortString = searchParams.get("sort") || formatSort(DEFAULT_SORT);
	const sortConfig = useMemo(() => parseSort(sortString), [sortString]);

	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

	const { data, isLoading, isError } = usePages(search, type, page, size, sortString);
	const deletePageMutation = useDeletePage();
	
	const { data: pageTypesData } = usePageTypes("", 0, 1000, "id,ASC");
	const pageTypes = pageTypesData?.content || [];

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

	const handleTypeChange = useCallback(
		(newType: string) => {
			updateSearchParams((params) => {
				if (newType && newType !== "all") {
					params.set("type", newType);
				} else {
					params.delete("type");
				}
				params.set("page", "0");
			});
		},
		[updateSearchParams]
	);

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
		if (selectedPageId) {
			try {
				await deletePageMutation.mutateAsync(selectedPageId);
				setDeleteModalOpen(false);
				setSelectedPageId(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	}, [selectedPageId, deletePageMutation]);

	const handleOpenDeleteModal = useCallback((id: number) => {
		setSelectedPageId(id);
		setDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedPageId(null);
	}, []);

	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const pages = data?.content ?? [];

	const selectedPage = useMemo(
		() => pages.find((p) => p.id === selectedPageId),
		[pages, selectedPageId]
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
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div className="space-y-1">
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
								Sayfalar Listesi
							</h1>
							<p className="text-muted-foreground text-sm">
								Tüm sayfaları görüntüleyin ve yönetin
							</p>
						</div>
					</div>
					<Button
						onClick={() => navigate("/pages/create")}
						className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						size="lg"
					>
						<Plus className="h-5 w-5 mr-2" />
						Yeni Sayfa
					</Button>
				</div>
				
				{/* Search and Filter */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative flex-1 w-full sm:w-auto">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Sayfa ara..."
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
					<Select value={type || "all"} onValueChange={handleTypeChange}>
						<SelectTrigger className="h-11 w-full sm:w-[180px]">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filtreler" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tüm Tipler</SelectItem>
							{pageTypes.map((pageType) => (
								<SelectItem key={pageType.id} value={pageType.type}>
									{pageType.type}
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
								<FileText className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Sayfa Listesi</CardTitle>
								<CardDescription className="text-xs">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> sayfa bulundu
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
									<SortableHeader field="name">
										<span className="text-sm font-bold text-foreground">İsim</span>
									</SortableHeader>
									<SortableHeader field="type">
										<span className="text-sm font-bold text-foreground">Tip</span>
									</SortableHeader>
									<TableHead>
										<span className="text-sm font-bold text-foreground">Diller</span>
									</TableHead>
									<TableHead className="text-right">
										<span className="text-sm font-bold text-foreground">İşlemler</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={5} className="h-[400px]">
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
										<TableCell colSpan={5} className="h-[400px]">
											<div className="flex flex-col items-center justify-center gap-4">
												<div className="rounded-full bg-destructive/10 p-3">
													<FileText className="h-8 w-8 text-destructive" />
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
								) : pages.length > 0 ? (
									pages.map((page) => (
										<PageTableRow
											key={page.id}
											page={page}
											onView={() => navigate(`/pages/detail/${page.id}`)}
											onEdit={() => navigate(`/pages/edit/${page.id}`)}
											onDelete={() => handleOpenDeleteModal(page.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="h-[400px] p-0">
											<Empty className="border-0 py-12">
												<EmptyHeader>
													<EmptyMedia variant="icon">
														<div className="rounded-full bg-muted p-4">
															<FileText className="h-8 w-8 text-muted-foreground" />
														</div>
													</EmptyMedia>
													<EmptyTitle>Sayfa bulunamadı</EmptyTitle>
													<EmptyDescription>
														{search || type
															? "Arama kriterlerinize uygun sayfa bulunamadı. Lütfen farklı bir arama terimi veya tip deneyin."
															: "Henüz sayfa eklenmemiş. Yeni bir sayfa ekleyerek başlayabilirsiniz."}
													</EmptyDescription>
												</EmptyHeader>
												<EmptyContent>
													<Button
														onClick={() => navigate("/pages/create")}
														className="bg-primary text-primary-foreground hover:bg-primary/90"
													>
														<Plus className="h-4 w-4 mr-2" />
														Yeni Sayfa Ekle
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
				title="Sayfayı Sil"
				description={`"${selectedPage?.name}" adlı sayfayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedPage?.name || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deletePageMutation.isPending}
			/>
		</div>
	);
}

interface PageTableRowProps {
	page: PageResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function PageTableRow({ page, onView, onEdit, onDelete }: PageTableRowProps) {
	const languages = page.localizations?.map(loc => loc.languageCode.toUpperCase()).join(" ") || "";
	
	return (
		<TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 group border-b border-border/30">
			<TableCell className="font-bold text-green-500 py-4">{page.id}</TableCell>
			<TableCell className="py-4">
				<div className="font-semibold text-foreground group-hover:text-primary transition-colors">
					{page.name}
				</div>
			</TableCell>
			<TableCell className="py-4">
				<Badge variant="secondary" className="text-sm font-bold bg-blue-500/20 border-blue-500/30 text-blue-500 shadow-sm px-3 py-1">
					{page.type}
				</Badge>
			</TableCell>
			<TableCell className="py-4">
				{languages ? (
					<span className="text-sm font-semibold text-green-500">{languages}</span>
				) : (
					<span className="text-sm text-muted-foreground">-</span>
				)}
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
