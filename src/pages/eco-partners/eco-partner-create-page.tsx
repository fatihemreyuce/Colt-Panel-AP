import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEcoPartner, useEcoPartners } from "@/hooks/use-eco-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2, Image as ImageIcon, Upload, XCircle, Hash, Loader2 } from "lucide-react";

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
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/eco-partners")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Yeni Eco Partner Oluştur
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Yeni bir eco partner ekleyin
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
							<Building2 className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Eco Partner Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Yeni eco partner için gerekli bilgileri giriniz</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Logo Field */}
					<div className="space-y-2">
						<Label htmlFor="logo" className="text-p3 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
							Logo
						</Label>
						{logoPreview ? (
							<div className="relative inline-block">
								<div className="relative group">
									<img
										src={logoPreview}
										alt="Preview"
										className="h-32 w-32 rounded-xl object-contain border-2 border-border shadow-lg bg-card p-2"
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
									className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors text-p3 font-semibold"
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
								className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-all hover:border-primary group"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
									<p className="text-p3 font-semibold mb-2">
										Logo Yükle
									</p>
									<p className="text-p3 text-muted-foreground text-center px-4">
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
						<Label htmlFor="orderIndex" className="text-p3 font-semibold flex items-center gap-2">
							<Hash className="h-4 w-4 text-muted-foreground" />
							Sıra Numarası
						</Label>
						<Input
							id="orderIndex"
							type="number"
							min="0"
							value={formData.orderIndex}
							onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
							className={`h-11 ${
								errors.orderIndex ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="0"
						/>
						{errors.orderIndex && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.orderIndex}
							</p>
						)}
						<p className="text-p3 text-muted-foreground">
							Eco partner'ların görüntülenme sırasını belirler. Düşük numara önce gösterilir.
						</p>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/eco-partners")}
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createEcoPartnerMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{createEcoPartnerMutation.isPending ? (
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

