import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateLanguage } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Languages as LanguagesIcon } from "lucide-react";

export default function LanguageCreatePage() {
	const navigate = useNavigate();
	const createLanguageMutation = useCreateLanguage();
	const [formData, setFormData] = useState({
		code: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.code.trim()) {
			newErrors.code = "Dil kodu gereklidir";
		} else if (formData.code.trim().length !== 2) {
			newErrors.code = "Dil kodu 2 karakter olmalıdır (örn: tr, en)";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createLanguageMutation.mutateAsync({ code: formData.code.trim().toUpperCase() });
				navigate("/languages");
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
					onClick={() => navigate("/languages")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Dil Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir dil kodu ekleyin</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
					{/* Form Header */}
					<div className="bg-muted/50 border-b border-border px-6 py-4">
						<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
							<LanguagesIcon className="h-5 w-5 text-muted-foreground" />
							Dil Bilgileri
						</h2>
						<p className="text-p3 text-muted-foreground mt-1">Yeni dil için gerekli bilgileri giriniz</p>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Code Field */}
						<div className="space-y-2">
							<Label htmlFor="code" className="text-p3 font-semibold flex items-center gap-2">
								<LanguagesIcon className="h-4 w-4 text-muted-foreground" />
								Dil Kodu
							</Label>
							<Input
								id="code"
								value={formData.code}
								onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
								maxLength={2}
								className={`h-11 uppercase ${
									errors.code ? "border-destructive focus-visible:ring-destructive" : ""
								}`}
								placeholder="TR, EN, DE..."
							/>
							{errors.code && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.code}
								</p>
							)}
							<p className="text-p3 text-muted-foreground">
								ISO 639-1 standart dil kodu (2 karakter, örn: tr, en, de)
							</p>
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/languages")}
								className="min-w-[100px]"
							>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={createLanguageMutation.isPending}
								className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
							>
								{createLanguageMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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

