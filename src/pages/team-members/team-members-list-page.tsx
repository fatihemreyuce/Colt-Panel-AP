import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTeamMembers, useDeleteTeamMember } from "@/hooks/use-team-members";
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
	Users,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { TeamMemberResponse } from "@/types/team-members.types";

type SortField = "id" | "name" | "email";
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

export default function TeamMembersListPage() {
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
	const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<number | null>(null);

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
	const { data, isLoading, isError } = useTeamMembers(search, page, size, sortString);
	const deleteTeamMemberMutation = useDeleteTeamMember();

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
		if (selectedTeamMemberId) {
			try {
				await deleteTeamMemberMutation.mutateAsync(selectedTeamMemberId);
				setDeleteModalOpen(false);
				setSelectedTeamMemberId(null);
			} catch (error) {
				// Error handling is done in the mutation hook
			}
		}
	}, [selectedTeamMemberId, deleteTeamMemberMutation]);

	// Modal açma
	const handleOpenDeleteModal = useCallback((teamMemberId: number) => {
		setSelectedTeamMemberId(teamMemberId);
		setDeleteModalOpen(true);
	}, []);

	// Modal kapatma
	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedTeamMemberId(null);
	}, []);

	// Computed values
	// Backend nested yapı döndürüyor: data.page.totalPages
	const totalPages = (data as any)?.page?.totalPages ?? data?.totalPages ?? 0;
	const currentPage = (data as any)?.page?.number ?? data?.number ?? 0;
	const totalElements = (data as any)?.page?.totalElements ?? data?.totalElements ?? 0;
	const teamMembers = data?.content ?? [];

	const selectedTeamMember = useMemo(
		() => teamMembers.find((member) => member.id === selectedTeamMemberId),
		[teamMembers, selectedTeamMemberId]
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
					Takım Üyeleri
				</h1>
				<Button
					onClick={() => navigate("/team-members/create")}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Plus className="h-4 w-4 mr-2" />
					Yeni Takım Üyesi
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center justify-between gap-4">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Takım üyesi ara..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-10 pr-10"
					/>
					{searchInput && (
						<button
							onClick={handleClearSearch}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
							<TableHead>Fotoğraf</TableHead>
							<SortableHeader field="name">İsim</SortableHeader>
							<SortableHeader field="email">E-posta</SortableHeader>
							<TableHead>LinkedIn</TableHead>
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
						) : teamMembers.length > 0 ? (
							teamMembers.map((member) => (
								<TeamMemberTableRow
									key={member.id}
									member={member}
									onView={() => navigate(`/team-members/detail/${member.id}`)}
									onEdit={() => navigate(`/team-members/edit/${member.id}`)}
									onDelete={() => handleOpenDeleteModal(member.id)}
								/>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="p-0">
									<Empty className="border-0 py-12">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<Users className="h-6 w-6" />
											</EmptyMedia>
											<EmptyTitle>Takım üyesi bulunamadı</EmptyTitle>
											<EmptyDescription>
												{search
													? "Arama kriterlerinize uygun takım üyesi bulunamadı. Lütfen farklı bir arama terimi deneyin veya yeni bir takım üyesi ekleyin."
													: "Henüz takım üyesi eklenmemiş. Yeni bir takım üyesi ekleyerek başlayabilirsiniz."}
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												onClick={() => navigate("/team-members/create")}
												className="bg-primary text-primary-foreground hover:bg-primary/90"
											>
												<Plus className="h-4 w-4 mr-2" />
												Yeni Takım Üyesi Ekle
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
					Toplam <span className="font-semibold text-foreground">{totalElements}</span> takım üyesi
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
				title="Takım Üyesini Sil"
				description={`"${selectedTeamMember?.name}" isimli takım üyesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedTeamMember?.name || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteTeamMemberMutation.isPending}
			/>
		</div>
	);
}

// Team member table row component
interface TeamMemberTableRowProps {
	member: TeamMemberResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function TeamMemberTableRow({ member, onView, onEdit, onDelete }: TeamMemberTableRowProps) {
	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<TableCell className="font-medium">{member.id}</TableCell>
			<TableCell>
				{member.photo ? (
					<img
						src={member.photo}
						alt={member.name}
						className="h-10 w-10 rounded-full object-cover border-2 border-border"
					/>
				) : (
					<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
						<Users className="h-5 w-5 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell className="font-medium">{member.name}</TableCell>
			<TableCell>{member.email}</TableCell>
			<TableCell>
				{member.linkedinUrl ? (
					<a
						href={member.linkedinUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						LinkedIn
					</a>
				) : (
					<span className="text-muted-foreground">-</span>
				)}
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

