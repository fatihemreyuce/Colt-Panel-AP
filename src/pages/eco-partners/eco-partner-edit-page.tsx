import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateEcoPartner, useGetEcoPartnerById, useEcoPartners } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2, Image as ImageIcon, Upload, XCircle, Hash, Loader2 } from "lucide-react";

export default function EcoPartnerEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const ecoPartnerId = id ? parseInt(id) : 0;
	const { data: ecoPartner, isLoading } = useGetEcoPartnerById(ecoPartnerId);
	const updateEcoPartnerMutation = useUpdateEcoPartner();
	const { data: existingPartners } = useEcoPartners();
	
	// Mevcut partner'ların orderIndex'lerini al (kendisi hariç)
	// API Page formatında dönebilir veya direkt array olabilir
	const partners = Array.isArray(existingPartners) ? existingPartners : (existingPartners?.content || []);
	const existingOrderIndexes = partners
		.filter(p => p.id !== ecoPartnerId)
		.map(p => p.orderIndex);

	const [formData, setFormData] = useState({
		logo: undefined as File | string | undefined,
		orderIndex: 0,
	});

	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (ecoPartner) {
			setFormData({
				logo: ecoPartner.logo,
				orderIndex: ecoPartner.orderIndex,
			});
			if (ecoPartner.logo) {
				setLogoPreview(ecoPartner.logo);
			}
		}
	}, [ecoPartner]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
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
				await updateEcoPartnerMutation.mutateAsync({
					id: ecoPartnerId,
					ecoPartner: formData,
				});
				navigate("/eco-partners");
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
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!ecoPartner) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Eco partner bulunamadı</p>
					<Button onClick={() => navigate("/eco-partners")} className="bg-primary text-primary-foreground hover:bg-primary/90">
						Geri Dön
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
					onClick={() => navigate("/eco-partners")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Eco Partner Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Eco partner bilgilerini güncelleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Building2 className="h-5 w-5 text-muted-foreground" />
						Eco Partner Bilgileri
					</h2>
					<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Eco partner bilgilerini güncelleyin</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Logo Field */}
					<div className="space-y-2">
						<Label htmlFor="logo" className="text-p3 text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
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
									<Upload className="h-4 w-4 text-muted-foreground" />
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
									<Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
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
						<p className="text-p3 text-gray-500 dark:text-gray-400">
							Yeni logo yüklemek için dosya seçin (opsiyonel)
						</p>
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
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/eco-partners")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateEcoPartnerMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{updateEcoPartnerMutation.isPending ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
									Güncelleniyor...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Güncelle
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

