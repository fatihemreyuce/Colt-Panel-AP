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
import { ArrowLeft, Save, Database, RefreshCw } from "lucide-react";
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
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center gap-4 border-b border-border px-6 -mx-6 mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/backups")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Yedekleme Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir yedekleme oluşturun</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Database className="h-5 w-5 text-muted-foreground" />
						Yedekleme Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Yedekleme tipini seçiniz</p>
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
							className="border-border hover:bg-accent"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createBackupMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{createBackupMutation.isPending ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

