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
			<div className="flex h-20 items-center gap-4 border-b border-green-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-gray-800/50 dark:to-gray-800/30 px-6 -mx-6 rounded-b-lg">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/languages")}
					className="hover:bg-green-50 dark:hover:bg-gray-700/50"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-400 bg-clip-text text-transparent">
						Yeni Dil Oluştur
					</h1>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Yeni bir dil kodu ekleyin</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-green-200/50 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/95 shadow-sm dark:shadow-xl dark:shadow-black/20">
					{/* Form Header */}
					<div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border-b border-green-200/50 dark:border-gray-600/50 px-6 py-4">
						<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
							<LanguagesIcon className="h-5 w-5 text-brand-green dark:text-brand-green" />
							Dil Bilgileri
						</h2>
						<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Yeni dil için gerekli bilgileri giriniz</p>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Code Field */}
						<div className="space-y-2">
							<Label htmlFor="code" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
								<LanguagesIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
								Dil Kodu
							</Label>
							<Input
								id="code"
								value={formData.code}
								onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
								maxLength={2}
								className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all uppercase ${
									errors.code ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
								}`}
								placeholder="TR, EN, DE..."
							/>
							{errors.code && (
								<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
									<span>•</span>
									{errors.code}
								</p>
							)}
							<p className="text-p3 text-gray-500 dark:text-gray-400">
								ISO 639-1 standart dil kodu (2 karakter, örn: tr, en, de)
							</p>
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-end gap-4 pt-6 border-t border-green-200/50 dark:border-gray-600/50">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/languages")}
								className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
							>
								İptal
							</Button>
							<Button
								type="submit"
								disabled={createLanguageMutation.isPending}
								className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
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

