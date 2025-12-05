import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEcoPartner, useEcoPartners } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2, Image as ImageIcon, Upload, XCircle, Hash } from "lucide-react";

export default function EcoPartnerCreatePage() {
	const navigate = useNavigate();
	const createEcoPartnerMutation = useCreateEcoPartner();
	const { data: existingPartners } = useEcoPartners();
	
	// Mevcut partner'ların orderIndex'lerini al
	// API Page formatında dönebilir veya direkt array olabilir
	const partners = Array.isArray(existingPartners) ? existingPartners : (existingPartners?.content || []);
	const existingOrderIndexes = partners.map(p => p.orderIndex);
	const maxOrderIndex = existingOrderIndexes.length > 0 ? Math.max(...existingOrderIndexes) : 0;
	const nextOrderIndex = maxOrderIndex + 1;

	const [formData, setFormData] = useState({
		logo: undefined as File | undefined,
		orderIndex: nextOrderIndex,
	});

	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.logo) {
			newErrors.logo = "Logo gereklidir";
		}
		if (formData.orderIndex < 0) {
			newErrors.orderIndex = "Sıra numarası 0 veya daha büyük olmalıdır";
		}
		if (existingOrderIndexes.includes(formData.orderIndex)) {
			newErrors.orderIndex = "Bu sıra numarası zaten kullanılıyor";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, logo: file });
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createEcoPartnerMutation.mutateAsync(formData);
				navigate("/eco-partners");
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
					onClick={() => navigate("/eco-partners")}
					className="hover:bg-green-50 dark:hover:bg-gray-700/50"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-400 bg-clip-text text-transparent">
						Yeni Eco Partner Oluştur
					</h1>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Yeni bir eco partner ekleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-green-200/50 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/95 shadow-sm dark:shadow-xl dark:shadow-black/20">
				{/* Form Header */}
				<div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border-b border-green-200/50 dark:border-gray-600/50 px-6 py-4">
					<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Building2 className="h-5 w-5 text-brand-green dark:text-brand-green" />
						Eco Partner Bilgileri
					</h2>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Yeni eco partner için gerekli bilgileri giriniz</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Logo Field */}
					<div className="space-y-2">
						<Label htmlFor="logo" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
							Logo
						</Label>
						{logoPreview ? (
							<div className="relative inline-block">
								<div className="relative group">
									<img
										src={logoPreview}
										alt="Preview"
										className="h-32 w-32 rounded-xl object-contain border-2 border-green-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700/50 p-2"
									/>
									<button
										type="button"
										onClick={() => {
											setLogoPreview(null);
											setFormData({ ...formData, logo: undefined });
										}}
										className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors group-hover:scale-110"
										aria-label="Logoyu kaldır"
									>
										<XCircle className="h-4 w-4" />
									</button>
								</div>
								<label
									htmlFor="logo"
									className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-600/50 cursor-pointer transition-colors text-p3 font-semibold text-gray-700 dark:text-gray-200"
								>
									<Upload className="h-4 w-4 text-brand-green dark:text-brand-green" />
									Logoyu Değiştir
								</label>
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoChange}
									className="hidden"
								/>
							</div>
						) : (
							<label
								htmlFor="logo"
								className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-green-300 dark:border-gray-600 rounded-xl bg-green-50/50 dark:bg-gray-700/30 hover:bg-green-100/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all hover:border-brand-green dark:hover:border-brand-green group"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-12 w-12 text-brand-green dark:text-brand-green mb-4 group-hover:scale-110 transition-transform" />
									<p className="text-p3 font-semibold text-gray-700 dark:text-gray-200 mb-2">
										Logo Yükle
									</p>
									<p className="text-p3 text-gray-500 dark:text-gray-400 text-center px-4">
										PNG, JPG veya SVG (Max. 5MB)
									</p>
								</div>
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoChange}
									className="hidden"
								/>
							</label>
						)}
						{errors.logo && (
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.logo}
							</p>
						)}
					</div>

					{/* Order Index Field */}
					<div className="space-y-2">
						<Label htmlFor="orderIndex" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<Hash className="h-4 w-4 text-brand-green dark:text-brand-green" />
							Sıra Numarası
						</Label>
						<Input
							id="orderIndex"
							type="number"
							min="0"
							value={formData.orderIndex}
							onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
							className={`h-11 border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-brand-green/30 focus-visible:border-green-500 dark:focus-visible:border-brand-green transition-all ${
								errors.orderIndex ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20" : ""
							}`}
							placeholder="0"
						/>
						{errors.orderIndex && (
							<p className="text-p3 text-red-600 dark:text-red-400 flex items-center gap-1">
								<span>•</span>
								{errors.orderIndex}
							</p>
						)}
						<p className="text-p3 text-gray-500 dark:text-gray-400">
							Eco partner'ların görüntülenme sırasını belirler. Düşük numara önce gösterilir.
						</p>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-green-200/50 dark:border-gray-600/50">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/eco-partners")}
							className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createEcoPartnerMutation.isPending}
							className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
						>
							{createEcoPartnerMutation.isPending ? (
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

