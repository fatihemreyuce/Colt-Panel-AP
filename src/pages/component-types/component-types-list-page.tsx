import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useComponentTypes, useDeleteComponentType } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
	X,
	Loader2,
	Layers,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { componentTypeResponse } from "@/types/component-type.types";

type SortField = "id" | "type";
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

export default function ComponentTypesListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);
	const sortString = searchParams.get("sort") || formatSort(DEFAULT_SORT);
	const sortConfig = useMemo(() => parseSort(sortString), [sortString]);

	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedComponentTypeId, setSelectedComponentTypeId] = useState<number | null>(null);

	const { data, isLoading, isError } = useComponentTypes(search, page, size, sortString);
	const deleteComponentTypeMutation = useDeleteComponentType();

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
		if (selectedComponentTypeId) {
			try {
				await deleteComponentTypeMutation.mutateAsync(selectedComponentTypeId);
				setDeleteModalOpen(false);
				setSelectedComponentTypeId(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	}, [selectedComponentTypeId, deleteComponentTypeMutation]);

	const handleOpenDeleteModal = useCallback((id: number) => {
		setSelectedComponentTypeId(id);
		setDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedComponentTypeId(null);
	}, []);

	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const componentTypes = data?.content ?? [];

	const selectedComponentType = useMemo(
		() => componentTypes.find((ct) => ct.id === selectedComponentTypeId),
		[componentTypes, selectedComponentTypeId]
	);


	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header Section */}
			<div className="flex flex-col gap-6">
				{/* Title and Create Button */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Layers className="h-6 w-6 text-primary" />
						</div>
						<div className="space-y-1">
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
								Bileşen Tipleri Listesi
							</h1>
							<p className="text-muted-foreground text-sm">
								Tüm bileşen tiplerini görüntüleyin ve yönetin
							</p>
						</div>
					</div>
					<Button
						onClick={() => navigate("/component-types/create")}
						className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						size="lg"
					>
						<Plus className="h-5 w-5 mr-2" />
						Yeni Bileşen Tipi
					</Button>
				</div>
				
				{/* Search */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative flex-1 w-full sm:w-auto">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Bileşen tipi ara..."
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

			{/* Cards Grid Section */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
								<Layers className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Bileşen Tipi Listesi</CardTitle>
								<CardDescription className="text-xs">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> bileşen tipi bulundu
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-6 bg-gradient-to-b from-transparent to-muted/10">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
							<Loader2 className="h-10 w-10 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground font-medium">
								Yükleniyor...
							</p>
						</div>
					) : isError ? (
						<div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
							<div className="rounded-full bg-destructive/10 p-3">
								<Layers className="h-8 w-8 text-destructive" />
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
					) : componentTypes.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{componentTypes.map((componentType) => (
								<ComponentTypeCard
									key={componentType.id}
									componentType={componentType}
									onView={() => navigate(`/component-types/detail/${componentType.id}`)}
									onEdit={() => navigate(`/component-types/edit/${componentType.id}`)}
									onDelete={() => handleOpenDeleteModal(componentType.id)}
								/>
							))}
						</div>
					) : (
						<div className="min-h-[400px] flex items-center justify-center">
							<Empty className="border-0 py-12">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<div className="rounded-full bg-muted p-4">
											<Layers className="h-8 w-8 text-muted-foreground" />
										</div>
									</EmptyMedia>
									<EmptyTitle>Bileşen tipi bulunamadı</EmptyTitle>
									<EmptyDescription>
										{search
											? "Arama kriterlerinize uygun bileşen tipi bulunamadı. Lütfen farklı bir arama terimi deneyin."
											: "Henüz bileşen tipi eklenmemiş. Yeni bir bileşen tipi ekleyerek başlayabilirsiniz."}
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button
										onClick={() => navigate("/component-types/create")}
										className="bg-primary text-primary-foreground hover:bg-primary/90"
									>
										<Plus className="h-4 w-4 mr-2" />
										Yeni Bileşen Tipi Ekle
									</Button>
								</EmptyContent>
							</Empty>
						</div>
					)}
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
				title="Bileşen Tipini Sil"
				description={`"${selectedComponentType?.type}" adlı bileşen tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedComponentType?.type || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteComponentTypeMutation.isPending}
			/>
		</div>
	);
}

interface ComponentTypeCardProps {
	componentType: componentTypeResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function ComponentTypeCard({ componentType, onView, onEdit, onDelete }: ComponentTypeCardProps) {
	const features = [
		{ label: "Başlık", enabled: componentType.hasTitle, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
		{ label: "Özet", enabled: componentType.hasExcerpt, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
		{ label: "Açıklama", enabled: componentType.hasDescription, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
		{ label: "Medya", enabled: componentType.hasAssets, color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
		{ label: "Resim", enabled: componentType.hasImage, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
		{ label: "Bağlantı", enabled: componentType.hasLink, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
		{ label: "Değer", enabled: componentType.hasValue, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
	].filter(f => f.enabled);

	return (
		<Card className="group relative border-2 shadow-lg bg-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
			<CardContent className="p-5">
				<div className="flex items-start gap-4">
					{/* Preview Thumbnail */}
					<div className="relative flex-shrink-0">
						<div className="w-20 h-20 rounded-lg bg-white border-2 border-border shadow-md overflow-hidden">
							{componentType.photo ? (
								<img
									src={componentType.photo}
									alt={componentType.type}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
									<Layers className="h-8 w-8 text-muted-foreground/50" />
								</div>
							)}
						</div>
						{/* ID Badge */}
						<div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg">
							#{componentType.id}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{/* Title */}
						<h3 className="text-lg font-bold text-foreground mb-3 truncate">
							{componentType.type}
						</h3>

						{/* Features Badges */}
						<div className="flex flex-wrap gap-2 mb-4">
							{features.length > 0 ? (
								features.map((feature, index) => (
									<Badge
										key={index}
										variant="outline"
										className={`text-xs font-medium border ${feature.color}`}
									>
										{feature.label}
									</Badge>
								))
							) : (
								<span className="text-xs text-muted-foreground">Özellik yok</span>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-2 flex-shrink-0">
						<Button
							variant="outline"
							size="icon"
							onClick={onEdit}
							className="h-9 w-9 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={onDelete}
							className="h-9 w-9 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
