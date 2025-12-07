import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPageTypeById, useUpdatePageType } from "@/hooks/use-page-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, FileType, Loader2 } from "lucide-react";

export default function PageTypeEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const pageTypeId = id ? parseInt(id) : 0;
	const { data: pageType, isLoading } = useGetPageTypeById(pageTypeId);
	const updatePageTypeMutation = useUpdatePageType();

	const [formData, setFormData] = useState({
		type: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Load data when pageType is available
	useEffect(() => {
		if (pageType) {
			setFormData({
				type: pageType.type || "",
			});
		}
	}, [pageType]);

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
				await updatePageTypeMutation.mutateAsync({ id: pageTypeId, pageType: formData });
				navigate("/page-types");
			} catch (error) {
				// Error handled by mutation
			}
		}
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

	if (!pageType) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Sayfa tipi bulunamadı</p>
					<Button
						onClick={() => navigate("/page-types")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Sayfa Tipleri Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

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
						Sayfa Tipini Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Sayfa tipi bilgilerini güncelleyin</p>
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
					<p className="text-p3 text-muted-foreground mt-1">Sayfa tipi bilgilerini güncelleyin</p>
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
							disabled={updatePageTypeMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{updatePageTypeMutation.isPending ? (
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

