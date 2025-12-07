import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateBackup } from "@/hooks/use-backups";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Database, RefreshCw, Loader2 } from "lucide-react";
import type { backupRequest } from "@/types/backups.types";

const BACKUP_TYPES = [
	{ value: "DATABASE", label: "Veritabanı" },
	{ value: "UPLOADS", label: "Yüklemeler" },
	{ value: "FULL", label: "Tam Yedekleme" },
] as const;

export default function BackupCreatePage() {
	const navigate = useNavigate();
	const createBackupMutation = useCreateBackup();
	const [formData, setFormData] = useState<backupRequest>({
		type: "DATABASE",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.type) {
			newErrors.type = "Yedekleme tipi gereklidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createBackupMutation.mutateAsync(formData);
				navigate("/backups");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

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
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Yeni Yedekleme Oluştur
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Yeni bir yedekleme oluşturun
						</p>
					</div>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-xl border-2 border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
				{/* Form Header */}
				<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-border px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Database className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Yedekleme Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Yedekleme tipini seçiniz</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Type Field */}
					<div className="space-y-2">
						<Label htmlFor="type" className="text-p3 font-semibold flex items-center gap-2">
							<Database className="h-4 w-4 text-muted-foreground" />
							Yedekleme Tipi <span className="text-destructive">*</span>
						</Label>
						<Select
							value={formData.type}
							onValueChange={(value) => setFormData({ type: value as "UPLOADS" | "DATABASE" | "FULL" })}
						>
							<SelectTrigger className={`h-11 ${
								errors.type ? "border-destructive focus-visible:ring-destructive" : ""
							}`}>
								<SelectValue placeholder="Yedekleme tipi seçiniz" />
							</SelectTrigger>
							<SelectContent>
								{BACKUP_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.type && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.type}
							</p>
						)}
						<p className="text-p3 text-muted-foreground">
							{BACKUP_TYPES.find((type) => type.value === formData.type)?.label || "Yedekleme"} yedeklemesi oluşturulacaktır. Bu işlem biraz zaman alabilir.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/backups")}
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createBackupMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{createBackupMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Oluşturuluyor...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Oluştur
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

