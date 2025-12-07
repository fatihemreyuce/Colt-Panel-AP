import { useParams, useNavigate } from "react-router-dom";
import { useGetBackupById } from "@/hooks/use-backups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-primary" />
					<p className="text-sm font-medium text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!backup) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Yedekleme Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız yedekleme mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/backups")}
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Yedeklemeler Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/backups")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							Yedekleme Detayları
						</h1>
						<p className="text-muted-foreground text-sm">Yedekleme bilgilerini görüntüleyin</p>
					</div>
				</div>
				{(backup.status === "COMPLETED" || backup.status === "SUCCESS") && (
					<Button
						onClick={handleDownload}
						className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						size="lg"
					>
						<Download className="h-5 w-5 mr-2" />
						İndir
					</Button>
				)}
			</div>
			
			{/* Main Info Card */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Database className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Yedekleme Bilgileri</CardTitle>
							<CardDescription className="text-xs">Yedekleme detay bilgileri</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Database className="h-4 w-4 text-primary" />
								Yedekleme ID
							</div>
							<div className="text-3xl font-bold text-primary">{backup.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Clock className="h-4 w-4" />
								Durum
							</div>
							<div className="mt-2">
								{getStatusBadge(backup.status)}
							</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Database className="h-4 w-4" />
								Yedekleme Tipi
							</div>
							<div>
								<Badge variant="outline" className="text-sm font-semibold">
									{getBackupTypeLabel((backup as any).backup_type || (backup as any).backupType)}
								</Badge>
							</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileText className="h-4 w-4" />
								Dosya Boyutu
							</div>
							<div className="text-lg font-bold text-foreground">
								{(() => {
									const fileSize = backup.file_size || backup.fileSize;
									return fileSize ? formatFileSize(fileSize) : "-";
								})()}
							</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Calendar className="h-4 w-4" />
								Oluşturulma Tarihi
							</div>
							<div className="text-sm font-bold text-foreground">
								{backup.createdAt ? formatDate(backup.createdAt) : "-"}
							</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Calendar className="h-4 w-4" />
								Son Geçerlilik Tarihi
							</div>
							<div className="text-sm font-bold text-foreground">
								{backup.expiresAt ? formatDate(backup.expiresAt) : "-"}
							</div>
						</div>
					</div>

					{/* File Name */}
					<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md">
						<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							<FileText className="h-4 w-4" />
							Dosya Adı
						</div>
						<div className="text-sm font-semibold text-foreground break-all">
							{backup.filename}
						</div>
					</div>

					{/* File Path */}
					<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md">
						<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							<FileText className="h-4 w-4" />
							Dosya Yolu
						</div>
						<code className="text-xs font-mono font-medium text-foreground bg-gradient-to-r from-background to-muted/30 px-3 py-2 rounded-lg border border-border/50 shadow-sm block break-all">
							{backup.file_path || backup.filePath || "-"}
						</code>
					</div>

					{/* Error Message */}
					{backup.status === "FAILED" && backup.errorMessage && (
						<div className="p-5 rounded-xl bg-destructive/10 border-2 border-destructive/20 shadow-md">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
								<div className="flex-1">
									<div className="text-sm font-semibold text-destructive mb-1">
										Hata Mesajı
									</div>
									<div className="text-sm text-destructive/90">
										{backup.errorMessage}
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

