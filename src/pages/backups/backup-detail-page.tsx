import { useParams, useNavigate } from "react-router-dom";
import { useGetBackupById } from "@/hooks/use-backups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Database, Loader2, CheckCircle2, XCircle, Clock, FileText, Calendar, AlertCircle } from "lucide-react";
import type { backupResponse } from "@/types/backups.types";
import { getAccessToken } from "@/utils/token-manager";
import { refreshTokens } from "@/utils/fetch-client";
import { toast } from "sonner";

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

const getBackupTypeLabel = (type: string | undefined): string => {
	if (!type) return "-";
	switch (type.toUpperCase()) {
		case "UPLOADS":
			return "Yüklemeler";
		case "DATABASE":
			return "Veritabanı";
		case "FULL":
			return "Tam Yedekleme";
		default:
			return type;
	}
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

const getStatusBadge = (status: backupResponse["status"]) => {
	switch (status) {
		case "COMPLETED":
		case "SUCCESS":
			return (
				<Badge variant="default" className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-sm py-1.5 px-3">
					<CheckCircle2 className="h-4 w-4" />
					Tamamlandı
				</Badge>
			);
		case "IN_PROGRESS":
			return (
				<Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
					<Clock className="h-4 w-4 animate-spin" />
					Devam Ediyor
				</Badge>
			);
		case "FAILED":
			return (
				<Badge variant="destructive" className="gap-1.5 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 text-sm py-1.5 px-3">
					<XCircle className="h-4 w-4" />
					Başarısız
				</Badge>
			);
		default:
			return null;
	}
};

export default function BackupDetailPage() {
	const { id } = useParams<{ id: string }>();
	const backupId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: backup, isLoading } = useGetBackupById(backupId);

	const handleDownload = async () => {
		if (!backup || (backup.status !== "COMPLETED" && backup.status !== "SUCCESS")) {
			return;
		}

		try {
			let accessToken = getAccessToken();
			if (!accessToken) {
				const refreshed = await refreshTokens();
				if (!refreshed) {
					toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
					return;
				}
				accessToken = getAccessToken();
			}

			const response = await fetch(`/api/v1/admin/backups/${backup.id}/download`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "application/octet-stream",
				},
			});

			if (response.status === 401) {
				const refreshed = await refreshTokens();
				if (refreshed) {
					accessToken = getAccessToken();
					const retryResponse = await fetch(`/api/v1/admin/backups/${backup.id}/download`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${accessToken}`,
							"Accept": "application/octet-stream",
						},
					});
					if (retryResponse.ok) {
						const blob = await retryResponse.blob();
						downloadBlob(blob, backup.filename);
					} else {
						throw new Error("İndirme başarısız");
					}
				} else {
					throw new Error("Oturum süreniz dolmuş");
				}
			} else if (response.ok) {
				const blob = await response.blob();
				downloadBlob(blob, backup.filename);
			} else {
				const errorData = await response.json().catch(() => ({ message: "İndirme başarısız" }));
				toast.error(errorData.message || "İndirme başarısız");
			}
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Dosya indirilemedi. Lütfen tekrar deneyin.");
		}
	};

	const downloadBlob = (blob: Blob, filename: string) => {
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!backup) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Yedekleme bulunamadı</p>
					<Button
						onClick={() => navigate("/backups")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Yedeklemeler Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/backups")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Yedekleme Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Yedekleme bilgilerini görüntüleyin</p>
					</div>
				</div>
				{(backup.status === "COMPLETED" || backup.status === "SUCCESS") && (
					<Button
						onClick={handleDownload}
						className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
					>
						<Download className="h-4 w-4 mr-2" />
						İndir
					</Button>
				)}
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Database className="h-5 w-5 text-muted-foreground" />
						Yedekleme Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Yedekleme detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Database className="h-4 w-4" />
								Yedekleme ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{backup.id}
							</div>
						</div>

						{/* Status */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Clock className="h-4 w-4" />
								Durum
							</div>
							<div className="mt-2">
								{getStatusBadge(backup.status)}
							</div>
						</div>

						{/* File Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Dosya Adı
							</div>
							<div className="text-p1 font-semibold text-foreground break-all">
								{backup.filename}
							</div>
						</div>

						{/* Backup Type */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Database className="h-4 w-4" />
								Yedekleme Tipi
							</div>
							<div>
								<Badge variant="outline" className="bg-muted/50 text-p1 font-semibold">
									{getBackupTypeLabel((backup as any).backup_type || (backup as any).backupType)}
								</Badge>
							</div>
						</div>

						{/* File Size */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Dosya Boyutu
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{(() => {
									const fileSize = backup.file_size || backup.fileSize;
									return fileSize ? formatFileSize(fileSize) : "-";
								})()}
							</div>
						</div>

						{/* File Path */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Dosya Yolu
							</div>
							<div className="text-p3 font-medium text-foreground break-all bg-muted px-3 py-2 rounded-md border border-border">
								{backup.file_path || backup.filePath || "-"}
							</div>
						</div>

						{/* Created At */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Calendar className="h-4 w-4" />
								Oluşturulma Tarihi
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{backup.createdAt ? formatDate(backup.createdAt) : "-"}
							</div>
						</div>

						{/* Expires At */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Calendar className="h-4 w-4" />
								Son Geçerlilik Tarihi
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{backup.expiresAt ? formatDate(backup.expiresAt) : "-"}
							</div>
						</div>
					</div>

					{/* Error Message */}
					{backup.status === "FAILED" && backup.errorMessage && (
						<div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
							<div className="flex items-start gap-2">
								<AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
								<div className="flex-1">
									<div className="text-p3 font-semibold text-destructive mb-1">
										Hata Mesajı
									</div>
									<div className="text-p3 text-destructive/90">
										{backup.errorMessage}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/backups")}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							Geri Dön
						</Button>
						{(backup.status === "COMPLETED" || backup.status === "SUCCESS") && (
							<Button
								onClick={handleDownload}
								className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
							>
								<Download className="h-4 w-4 mr-2" />
								İndir
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

