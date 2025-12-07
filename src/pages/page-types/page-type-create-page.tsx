import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePageType } from "@/hooks/use-page-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, FileType, Loader2 } from "lucide-react";

export default function PageTypeCreatePage() {
	const navigate = useNavigate();
	const createPageTypeMutation = useCreatePageType();
	const [formData, setFormData] = useState({
		type: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.type.trim()) {
			newErrors.type = "Sayfa tipi gereklidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createPageTypeMutation.mutateAsync(formData);
				navigate("/page-types");
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
					onClick={() => navigate("/page-types")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Sayfa Tipi Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir sayfa tipi oluşturun</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<FileType className="h-5 w-5 text-muted-foreground" />
						Sayfa Tipi Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Yeni sayfa tipi için gerekli bilgileri giriniz</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Type Field */}
					<div className="space-y-2">
						<Label htmlFor="type" className="text-p3 font-semibold flex items-center gap-2">
							<FileType className="h-4 w-4 text-muted-foreground" />
							Sayfa Tipi
						</Label>
						<Input
							id="type"
							value={formData.type}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
							className={`h-11 ${
								errors.type ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="Sayfa tipi giriniz (örn: Home, About, Contact)"
						/>
						{errors.type && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.type}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/page-types")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createPageTypeMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{createPageTypeMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Kaydediliyor...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Kaydet
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

