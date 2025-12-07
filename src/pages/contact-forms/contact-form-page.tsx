import { useState } from "react";
import { useCreateContactForm } from "@/hooks/use-contact-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, User, Building2, Phone, MapPin, Briefcase, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import type { ContactFormRequest } from "@/types/contact-form.types";

export default function ContactFormPage() {
	const createContactFormMutation = useCreateContactForm();
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [formData, setFormData] = useState<ContactFormRequest>({
		companyMail: "",
		firstName: "",
		lastName: "",
		country: "",
		phoneNumber: "",
		city: "",
		companyName: "",
		sector: "",
		unit: "",
		message: "",
		legal: false,
		keepInTouch: false,
	});

	const [errors, setErrors] = useState<Partial<Record<keyof ContactFormRequest, string>>>({});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof ContactFormRequest, string>> = {};

		if (!formData.companyMail.trim()) {
			newErrors.companyMail = "Şirket e-postası gereklidir";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyMail)) {
			newErrors.companyMail = "Geçerli bir e-posta adresi giriniz";
		}

		if (!formData.firstName.trim()) {
			newErrors.firstName = "Ad gereklidir";
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = "Soyad gereklidir";
		}

		if (!formData.country.trim()) {
			newErrors.country = "Ülke gereklidir";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Telefon numarası gereklidir";
		}

		if (!formData.city.trim()) {
			newErrors.city = "Şehir gereklidir";
		}

		if (!formData.companyName.trim()) {
			newErrors.companyName = "Şirket adı gereklidir";
		}

		if (!formData.sector.trim()) {
			newErrors.sector = "Sektör gereklidir";
		}

		if (!formData.unit.trim()) {
			newErrors.unit = "Birim gereklidir";
		}

		if (!formData.legal) {
			newErrors.legal = "Yasal onay gereklidir";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await createContactFormMutation.mutateAsync(formData);
			setIsSubmitted(true);
			// Reset form
			setFormData({
				companyMail: "",
				firstName: "",
				lastName: "",
				country: "",
				phoneNumber: "",
				city: "",
				companyName: "",
				sector: "",
				unit: "",
				message: "",
				legal: false,
				keepInTouch: false,
			});
			setErrors({});
		} catch (error) {
			// Error handling is done in the mutation hook
		}
	};

	if (isSubmitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
				<div className="w-full max-w-2xl">
					<div className="rounded-2xl border border-border bg-card shadow-xl p-8 text-center space-y-6">
						<div className="flex justify-center">
							<div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
								<CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
							</div>
						</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-bold text-foreground">Form Başarıyla Gönderildi!</h2>
							<p className="text-muted-foreground">
								İletişim formunuz başarıyla alındı. En kısa sürede size dönüş yapacağız.
							</p>
						</div>
						<Button
							onClick={() => setIsSubmitted(false)}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							Yeni Form Gönder
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-6">
			<div className="w-full max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8 space-y-2">
					<h1 className="text-4xl font-bold text-foreground">İletişim Formu</h1>
					<p className="text-lg text-muted-foreground">
						Bizimle iletişime geçmek için lütfen formu doldurun
					</p>
				</div>

				{/* Form Container */}
				<div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xl">
					{/* Form Header */}
					<div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-8 py-6">
						<h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
							<Mail className="h-6 w-6 text-primary" />
							İletişim Bilgileri
						</h2>
						<p className="text-muted-foreground mt-2">Lütfen tüm alanları doldurun</p>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit} className="p-8 space-y-6">
						{/* Row 1: Company Mail & Phone */}
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="companyMail" className="text-p3 font-semibold flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									Şirket E-postası <span className="text-destructive">*</span>
								</Label>
								<Input
									id="companyMail"
									type="email"
									value={formData.companyMail}
									onChange={(e) => setFormData({ ...formData, companyMail: e.target.value })}
									className={`h-11 ${
										errors.companyMail ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="ornek@email.com"
								/>
								{errors.companyMail && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.companyMail}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phoneNumber" className="text-p3 font-semibold flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									Telefon <span className="text-destructive">*</span>
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
						</div>

						{/* Row 2: First Name & Last Name */}
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName" className="text-p3 font-semibold flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									Ad <span className="text-destructive">*</span>
								</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
									className={`h-11 ${
										errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Adınız"
								/>
								{errors.firstName && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.firstName}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="lastName" className="text-p3 font-semibold flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									Soyad <span className="text-destructive">*</span>
								</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
									className={`h-11 ${
										errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Soyadınız"
								/>
								{errors.lastName && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.lastName}
									</p>
								)}
							</div>
						</div>

						{/* Row 3: Company Name & Sector */}
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="companyName" className="text-p3 font-semibold flex items-center gap-2">
									<Building2 className="h-4 w-4 text-muted-foreground" />
									Şirket Adı <span className="text-destructive">*</span>
								</Label>
								<Input
									id="companyName"
									value={formData.companyName}
									onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
									className={`h-11 ${
										errors.companyName ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Şirket adı"
								/>
								{errors.companyName && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.companyName}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="sector" className="text-p3 font-semibold flex items-center gap-2">
									<Briefcase className="h-4 w-4 text-muted-foreground" />
									Sektör <span className="text-destructive">*</span>
								</Label>
								<Input
									id="sector"
									value={formData.sector}
									onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
									className={`h-11 ${
										errors.sector ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Sektör"
								/>
								{errors.sector && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.sector}
									</p>
								)}
							</div>
						</div>

						{/* Row 4: Unit & Country */}
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="unit" className="text-p3 font-semibold flex items-center gap-2">
									<Building2 className="h-4 w-4 text-muted-foreground" />
									Birim <span className="text-destructive">*</span>
								</Label>
								<Input
									id="unit"
									value={formData.unit}
									onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
									className={`h-11 ${
										errors.unit ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Birim"
								/>
								{errors.unit && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.unit}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="country" className="text-p3 font-semibold flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									Ülke <span className="text-destructive">*</span>
								</Label>
								<Input
									id="country"
									value={formData.country}
									onChange={(e) => setFormData({ ...formData, country: e.target.value })}
									className={`h-11 ${
										errors.country ? "border-destructive focus-visible:ring-destructive" : ""
									}`}
									placeholder="Ülke"
								/>
								{errors.country && (
									<p className="text-p3 text-destructive flex items-center gap-1">
										<span>•</span>
										{errors.country}
									</p>
								)}
							</div>
						</div>

						{/* Row 5: City */}
						<div className="space-y-2">
							<Label htmlFor="city" className="text-p3 font-semibold flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								Şehir <span className="text-destructive">*</span>
							</Label>
							<Input
								id="city"
								value={formData.city}
								onChange={(e) => setFormData({ ...formData, city: e.target.value })}
								className={`h-11 ${
									errors.city ? "border-destructive focus-visible:ring-destructive" : ""
								}`}
								placeholder="Şehir"
							/>
							{errors.city && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.city}
								</p>
							)}
						</div>

						{/* Message */}
						<div className="space-y-2">
							<Label htmlFor="message" className="text-p3 font-semibold flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
								Mesaj
							</Label>
							<Textarea
								id="message"
								value={formData.message}
								onChange={(e) => setFormData({ ...formData, message: e.target.value })}
								className="min-h-[120px]"
								placeholder="Mesajınızı buraya yazın..."
							/>
						</div>

						{/* Checkboxes */}
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<input
									type="checkbox"
									id="legal"
									checked={formData.legal}
									onChange={(e) => setFormData({ ...formData, legal: e.target.checked })}
									className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<Label htmlFor="legal" className="text-p3 cursor-pointer">
									<span className="text-destructive">*</span> Yasal onayı kabul ediyorum
								</Label>
							</div>
							{errors.legal && (
								<p className="text-p3 text-destructive flex items-center gap-1">
									<span>•</span>
									{errors.legal}
								</p>
							)}

							<div className="flex items-start gap-3">
								<input
									type="checkbox"
									id="keepInTouch"
									checked={formData.keepInTouch}
									onChange={(e) => setFormData({ ...formData, keepInTouch: e.target.checked })}
									className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<Label htmlFor="keepInTouch" className="text-p3 cursor-pointer">
									İletişimde kalmak istiyorum
								</Label>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex items-center justify-end pt-4 border-t border-border">
							<Button
								type="submit"
								disabled={createContactFormMutation.isPending}
								className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px] h-11"
							>
								{createContactFormMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Gönderiliyor...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Formu Gönder
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

