import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUsers, useDeleteUser } from "@/hooks/use-users";
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
	Users,
	Calendar,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { UserResponse } from "@/types/user.types";

type SortField = "id" | "username" | "email" | "createdAt";
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

const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString("tr-TR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export default function UsersListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);
	const sortString = searchParams.get("sort") || formatSort(DEFAULT_SORT);
	const sortConfig = useMemo(() => parseSort(sortString), [sortString]);

	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

	const { data, isLoading, isError } = useUsers(search, page, size, sortString);
	const deleteUserMutation = useDeleteUser();

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
		if (selectedUserId) {
			try {
				await deleteUserMutation.mutateAsync(selectedUserId);
				setDeleteModalOpen(false);
				setSelectedUserId(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	}, [selectedUserId, deleteUserMutation]);

	const handleOpenDeleteModal = useCallback((userId: number) => {
		setSelectedUserId(userId);
		setDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedUserId(null);
	}, []);

	const totalPages = data?.totalPages ?? 0;
	const currentPage = data?.number ?? 0;
	const totalElements = data?.totalElements ?? 0;
	const users = data?.content ?? [];

	const selectedUser = useMemo(
		() => users.find((user) => user.id === selectedUserId),
		[users, selectedUserId]
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
							<Users className="h-6 w-6 text-primary" />
						</div>
						<div className="space-y-1">
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
								Kullanıcılar Listesi
							</h1>
							<p className="text-muted-foreground text-sm">
								Tüm kullanıcıları görüntüleyin ve yönetin
							</p>
						</div>
					</div>
					<Button
						onClick={() => navigate("/users/create")}
						className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						size="lg"
					>
						<Plus className="h-5 w-5 mr-2" />
						Yeni Kullanıcı
					</Button>
				</div>
				
				{/* Search */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative flex-1 w-full sm:w-auto">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Kullanıcı ara..."
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
								<Users className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Kullanıcı Listesi</CardTitle>
								<CardDescription className="text-xs">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> kullanıcı bulundu
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
									<SortableHeader field="username">
										<span className="text-sm font-bold text-foreground">Kullanıcı Adı</span>
									</SortableHeader>
									<SortableHeader field="email">
										<span className="text-sm font-bold text-foreground">E-posta</span>
									</SortableHeader>
									<SortableHeader field="createdAt">
										<span className="text-sm font-bold text-foreground">Oluşturulma Tarihi</span>
									</SortableHeader>
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
													<Users className="h-8 w-8 text-destructive" />
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
								) : users.length > 0 ? (
									users.map((user) => (
										<UserTableRow
											key={user.id}
											user={user}
											onView={() => navigate(`/users/detail/${user.id}`)}
											onEdit={() => navigate(`/users/edit/${user.id}`)}
											onDelete={() => handleOpenDeleteModal(user.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="h-[400px] p-0">
											<Empty className="border-0 py-12">
												<EmptyHeader>
													<EmptyMedia variant="icon">
														<div className="rounded-full bg-muted p-4">
															<Users className="h-8 w-8 text-muted-foreground" />
														</div>
													</EmptyMedia>
													<EmptyTitle>Kullanıcı bulunamadı</EmptyTitle>
													<EmptyDescription>
														{search
															? "Arama kriterlerinize uygun kullanıcı bulunamadı. Lütfen farklı bir arama terimi deneyin."
															: "Henüz kullanıcı eklenmemiş. Yeni bir kullanıcı ekleyerek başlayabilirsiniz."}
													</EmptyDescription>
												</EmptyHeader>
												<EmptyContent>
													<Button
														onClick={() => navigate("/users/create")}
														className="bg-primary text-primary-foreground hover:bg-primary/90"
													>
														<Plus className="h-4 w-4 mr-2" />
														Yeni Kullanıcı Ekle
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
				title="Kullanıcıyı Sil"
				description={`"${selectedUser?.username}" adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedUser?.username || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteUserMutation.isPending}
			/>
		</div>
	);
}

interface UserTableRowProps {
	user: UserResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function UserTableRow({ user, onView, onEdit, onDelete }: UserTableRowProps) {
	return (
		<TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 group border-b border-border/30">
			<TableCell className="font-bold text-green-500 py-4">{user.id}</TableCell>
			<TableCell className="py-4">
				<div className="font-semibold text-foreground group-hover:text-primary transition-colors">
					{user.username}
				</div>
			</TableCell>
			<TableCell className="py-4">
				<span className="text-sm text-foreground">{user.email}</span>
			</TableCell>
			<TableCell className="py-4">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Calendar className="h-3.5 w-3.5" />
					{formatDate(user.createdAt)}
				</div>
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
