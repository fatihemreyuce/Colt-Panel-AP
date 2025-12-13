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
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/backups")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-1">Yedekleme Detayları</h1>
						<p className="text-muted-foreground text-sm">Yedekleme bilgilerini görüntüleyin</p>
					</div>
					{(backup.status === "COMPLETED" || backup.status === "SUCCESS") && (
						<Button
							onClick={handleDownload}
							className="flex items-center gap-2"
							size="lg"
						>
							<Download className="h-4 w-4" />
							İndir
						</Button>
					)}
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Yedekleme Bilgileri Card */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									<Database className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle>Yedekleme Bilgileri</CardTitle>
									<CardDescription>Yedekleme detay bilgileri</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Grid Info */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Database className="h-3.5 w-3.5 text-primary" />
										Yedekleme ID
									</div>
									<div className="text-2xl font-bold text-primary">{backup.id}</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Clock className="h-3.5 w-3.5" />
										Durum
									</div>
									<div className="mt-1">
										{getStatusBadge(backup.status)}
									</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Database className="h-3.5 w-3.5" />
										Yedekleme Tipi
									</div>
									<div className="mt-1">
										<Badge variant="outline" className="text-sm">
											{getBackupTypeLabel((backup as any).backup_type || (backup as any).backupType)}
										</Badge>
									</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<FileText className="h-3.5 w-3.5" />
										Dosya Boyutu
									</div>
									<div className="text-base font-semibold text-foreground">
										{(() => {
											const fileSize = backup.file_size || backup.fileSize;
											return fileSize ? formatFileSize(fileSize) : "-";
										})()}
									</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Calendar className="h-3.5 w-3.5" />
										Oluşturulma Tarihi
									</div>
									<div className="text-sm font-medium text-foreground">
										{backup.createdAt ? formatDate(backup.createdAt) : "-"}
									</div>
								</div>

								<div className="space-y-2 p-4 rounded-lg border bg-card">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
										<Calendar className="h-3.5 w-3.5" />
										Son Geçerlilik Tarihi
									</div>
									<div className="text-sm font-medium text-foreground">
										{backup.expiresAt ? formatDate(backup.expiresAt) : "-"}
									</div>
								</div>
							</div>

							{/* File Name */}
							<div className="space-y-2 p-4 rounded-lg border bg-card">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
									<FileText className="h-3.5 w-3.5" />
									Dosya Adı
								</div>
								<div className="text-sm font-medium text-foreground break-all">
									{backup.filename}
								</div>
							</div>

							{/* File Path */}
							<div className="space-y-2 p-4 rounded-lg border bg-card">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase mb-2">
									<FileText className="h-3.5 w-3.5" />
									Dosya Yolu
								</div>
								<code className="text-xs font-mono text-foreground bg-muted px-3 py-2 rounded border block break-all">
									{backup.file_path || backup.filePath || "-"}
								</code>
							</div>

							{/* Error Message */}
							{backup.status === "FAILED" && backup.errorMessage && (
								<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
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

				{/* Right Column - Quick Info */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Hızlı Bilgiler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Yedekleme ID</label>
								<p className="text-sm font-medium">{backup.id}</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Durum</label>
								<div>{getStatusBadge(backup.status)}</div>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Yedekleme Tipi</label>
								<p className="text-sm font-medium">
									{getBackupTypeLabel((backup as any).backup_type || (backup as any).backupType)}
								</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Dosya Boyutu</label>
								<p className="text-sm font-medium">
									{(() => {
										const fileSize = backup.file_size || backup.fileSize;
										return fileSize ? formatFileSize(fileSize) : "-";
									})()}
								</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Oluşturulma Tarihi</label>
								<p className="text-sm font-medium">
									{backup.createdAt ? formatDate(backup.createdAt) : "-"}
								</p>
							</div>
							<div className="space-y-1">
								<label className="text-xs text-muted-foreground">Son Geçerlilik Tarihi</label>
								<p className="text-sm font-medium">
									{backup.expiresAt ? formatDate(backup.expiresAt) : "-"}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Actions Card */}
					<Card>
						<CardHeader>
							<CardTitle>İşlemler</CardTitle>
						</CardHeader>
						<CardContent>
							{(backup.status === "COMPLETED" || backup.status === "SUCCESS") ? (
								<Button
									onClick={handleDownload}
									className="w-full"
									size="lg"
								>
									<Download className="h-4 w-4 mr-2" />
									İndir
								</Button>
							) : (
								<p className="text-sm text-muted-foreground text-center py-2">
									Yedekleme tamamlanmadı
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

