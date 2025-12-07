import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSettings, useDeleteSettings } from "@/hooks/use-settings";
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
	Search,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Eye,
	X,
	Loader2,
	Settings,
	MoreVertical,
	Globe,
	Twitter,
	Instagram,
	Youtube,
	Linkedin,
} from "lucide-react";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import type { settingsResponse } from "@/types/settings.types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 500;

export default function SettingsListPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "0", 10);
	const size = parseInt(searchParams.get("size") || String(DEFAULT_PAGE_SIZE), 10);

	const [searchInput, setSearchInput] = useState(search);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedSettingsId, setSelectedSettingsId] = useState<number | null>(null);

	const { data, isLoading, isError } = useSettings();
	const deleteSettingsMutation = useDeleteSettings();

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
		if (selectedSettingsId) {
			try {
				await deleteSettingsMutation.mutateAsync(selectedSettingsId);
				setDeleteModalOpen(false);
				setSelectedSettingsId(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	}, [selectedSettingsId, deleteSettingsMutation]);

	const handleOpenDeleteModal = useCallback((id: number) => {
		setSelectedSettingsId(id);
		setDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setSelectedSettingsId(null);
	}, []);

	// Filter and paginate settings
	const filteredSettings = useMemo(() => {
		if (!data?.content) return [];
		let filtered = data.content;
		
		if (search.trim()) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter((setting) => {
				const hasTranslation = setting.translations?.some((t) =>
					t.languageCode.toLowerCase().includes(searchLower) ||
					t.termsOfUse?.toLowerCase().includes(searchLower) ||
					t.privacyPolicy?.toLowerCase().includes(searchLower) ||
					t.cookiePolicy?.toLowerCase().includes(searchLower) ||
					t.footerDescription?.toLowerCase().includes(searchLower)
				);
				const hasSocialMedia = 
					setting.twitterUrl?.toLowerCase().includes(searchLower) ||
					setting.instagramUrl?.toLowerCase().includes(searchLower) ||
					setting.youtubeUrl?.toLowerCase().includes(searchLower) ||
					setting.linkedinUrl?.toLowerCase().includes(searchLower);
				return hasTranslation || hasSocialMedia || setting.id.toString().includes(searchLower);
			});
		}
		
		return filtered;
	}, [data?.content, search]);

	const totalElements = filteredSettings.length;
	const totalPages = Math.ceil(totalElements / size);
	const currentPage = Math.min(page, Math.max(0, totalPages - 1));
	const startIndex = currentPage * size;
	const endIndex = startIndex + size;
	const paginatedSettings = filteredSettings.slice(startIndex, endIndex);

	const selectedSettings = useMemo(
		() => paginatedSettings.find((s) => s.id === selectedSettingsId),
		[paginatedSettings, selectedSettingsId]
	);

	const getLanguageCount = (setting: settingsResponse) => {
		return setting.translations?.length || 0;
	};

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Settings className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Ayarlar
						</h1>
					</div>
					<p className="text-muted-foreground ml-[52px] text-sm">
						Tüm ayarları görüntüleyin ve yönetin
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader className="pb-4 bg-gradient-to-r from-muted/50 to-transparent border-b">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-primary/10">
							<Search className="h-4 w-4 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg font-bold">Filtreler ve Arama</CardTitle>
							<CardDescription className="text-xs">
								Ayarları arayın ve filtreleyin
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Ayar ara..."
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
								<Settings className="h-4 w-4 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold">Ayar Listesi</CardTitle>
								<CardDescription className="text-xs mt-0.5">
									Toplam <span className="font-semibold text-foreground">{totalElements}</span> ayar bulundu
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
									<TableHead>ID</TableHead>
									<TableHead>Diller</TableHead>
									<TableHead>Sosyal Medya</TableHead>
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
													<Settings className="h-8 w-8 text-destructive" />
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
								) : paginatedSettings.length > 0 ? (
									paginatedSettings.map((setting) => (
										<SettingsTableRow
											key={setting.id}
											setting={setting}
											onView={() => navigate(`/settings/detail/${setting.id}`)}
											onEdit={() => navigate(`/settings/edit/${setting.id}`)}
											onDelete={() => handleOpenDeleteModal(setting.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className="h-[400px] p-0">
											<Empty className="border-0 py-12">
												<EmptyHeader>
													<EmptyMedia variant="icon">
														<div className="rounded-full bg-muted p-4">
															<Settings className="h-8 w-8 text-muted-foreground" />
														</div>
													</EmptyMedia>
													<EmptyTitle>Ayar bulunamadı</EmptyTitle>
													<EmptyDescription>
														{search
															? "Arama kriterlerinize uygun ayar bulunamadı. Lütfen farklı bir arama terimi deneyin."
															: "Henüz ayar eklenmemiş."}
													</EmptyDescription>
												</EmptyHeader>
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
				<Card className="border-2 shadow-lg bg-gradient-to-r from-card to-card/50 backdrop-blur-sm">
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-muted-foreground">
								Toplam <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">{totalElements}</span> ayar
								{" • "}
								Sayfa <span className="font-bold text-primary">{currentPage + 1}</span> /{" "}
								<span className="font-bold text-foreground">{totalPages}</span>
							</div>
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
						</div>
					</CardContent>
				</Card>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDelete}
				onCancel={handleCloseDeleteModal}
				title="Ayarı Sil"
				description={`ID: ${selectedSettingsId} numaralı ayarı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
				confirmationText={selectedSettingsId?.toString() || ""}
				confirmText="Sil"
				cancelText="İptal"
				loading={deleteSettingsMutation.isPending}
			/>
		</div>
	);
}

interface SettingsTableRowProps {
	setting: settingsResponse;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function SettingsTableRow({ setting, onView, onEdit, onDelete }: SettingsTableRowProps) {
	const languageCount = setting.translations?.length || 0;
	const hasSocialMedia = 
		setting.twitterUrl || 
		setting.instagramUrl || 
		setting.youtubeUrl || 
		setting.linkedinUrl;

	return (
		<TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 group border-b border-border/50">
			<TableCell className="font-bold text-primary/80">{setting.id}</TableCell>
			<TableCell>
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4 text-muted-foreground" />
					<Badge variant="secondary" className="font-medium bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary shadow-sm">
						{languageCount} Dil
					</Badge>
				</div>
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-2">
					{setting.twitterUrl && (
						<Twitter className="h-4 w-4 text-blue-400" />
					)}
					{setting.instagramUrl && (
						<Instagram className="h-4 w-4 text-pink-500" />
					)}
					{setting.youtubeUrl && (
						<Youtube className="h-4 w-4 text-red-500" />
					)}
					{setting.linkedinUrl && (
						<Linkedin className="h-4 w-4 text-blue-600" />
					)}
					{!hasSocialMedia && (
						<span className="text-sm text-muted-foreground">-</span>
					)}
				</div>
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-lg"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44 shadow-xl border-2">
						<DropdownMenuItem onClick={onView} className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10">
							<Eye className="h-4 w-4 mr-2 text-primary" />
							<span className="font-medium">Detaylar</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onEdit} className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10">
							<Edit className="h-4 w-4 mr-2 text-primary" />
							<span className="font-medium">Düzenle</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={onDelete}
							className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<span className="font-medium">Sil</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}

