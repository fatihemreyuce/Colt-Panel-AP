import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOffice } from "@/hooks/use-offices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2, MapPin, Phone } from "lucide-react";
import type { officeRequest } from "@/types/offices.types";

export default function OfficeCreatePage() {
	const navigate = useNavigate();
	const createOfficeMutation = useCreateOffice();
	const [formData, setFormData] = useState<officeRequest>({
		name: "",
		address: "",
		phoneNumber: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim()) {
			newErrors.name = "Ofis adı gereklidir";
		}
		if (!formData.address.trim()) {
			newErrors.address = "Adres gereklidir";
		}
		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Telefon numarası gereklidir";
		} else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
			newErrors.phoneNumber = "Geçerli bir telefon numarası giriniz";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createOfficeMutation.mutateAsync(formData);
				navigate("/offices");
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
					onClick={() => navigate("/offices")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Ofis Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir ofis ekleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Building2 className="h-5 w-5 text-muted-foreground" />
						Ofis Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Yeni ofis için gerekli bilgileri giriniz</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Name Field */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-p3 font-semibold flex items-center gap-2">
							<Building2 className="h-4 w-4 text-muted-foreground" />
							Ofis Adı <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`h-11 ${
								errors.name ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="Ofis adı giriniz"
						/>
						{errors.name && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.name}
							</p>
						)}
					</div>

					{/* Address Field */}
					<div className="space-y-2">
						<Label htmlFor="address" className="text-p3 font-semibold flex items-center gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							Adres <span className="text-destructive">*</span>
						</Label>
						<Input
							id="address"
							value={formData.address}
							onChange={(e) => setFormData({ ...formData, address: e.target.value })}
							className={`h-11 ${
								errors.address ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="Adres giriniz"
						/>
						{errors.address && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.address}
							</p>
						)}
					</div>

					{/* Phone Number Field */}
					<div className="space-y-2">
						<Label htmlFor="phoneNumber" className="text-p3 font-semibold flex items-center gap-2">
							<Phone className="h-4 w-4 text-muted-foreground" />
							Telefon Numarası <span className="text-destructive">*</span>
						</Label>
						<Input
							id="phoneNumber"
							type="tel"
							value={formData.phoneNumber}
							onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
							className={`h-11 ${
								errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="+90 555 123 45 67"
						/>
						{errors.phoneNumber && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.phoneNumber}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/offices")}
							className="border-border hover:bg-accent"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createOfficeMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{createOfficeMutation.isPending ? (
								<>
									<Save className="h-4 w-4 mr-2 animate-spin" />
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

