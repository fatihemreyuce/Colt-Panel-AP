import { useParams, useNavigate } from "react-router-dom";
import { useGetContactFormById } from "@/hooks/use-contact-forms";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, Building2, Phone, MapPin, Briefcase, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ContactFormDetailPage() {
	const { id } = useParams<{ id: string }>();
	const contactFormId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: contactForm, isLoading } = useGetContactFormById(contactFormId);

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

	if (!contactForm) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">İletişim formu bulunamadı</p>
					<Button
						onClick={() => navigate("/contact-forms")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						İletişim Formları Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/contact-forms")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							İletişim Formu Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">İletişim formu bilgilerini görüntüleyin</p>
					</div>
				</div>
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Mail className="h-5 w-5 text-muted-foreground" />
						İletişim Formu Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Gönderilen form detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Mail className="h-4 w-4" />
								Form ID
							</div>
							<div className="text-h5 font-bold text-foreground">
								{contactForm.id}
							</div>
						</div>

						{/* Company Mail */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Mail className="h-4 w-4" />
								Şirket E-postası
							</div>
							<div className="text-p1 font-semibold text-foreground break-all">
								{contactForm.companyMail}
							</div>
						</div>

						{/* First Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<User className="h-4 w-4" />
								Ad
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.firstname}
							</div>
						</div>

						{/* Last Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<User className="h-4 w-4" />
								Soyad
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.lastname}
							</div>
						</div>

						{/* Company Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Building2 className="h-4 w-4" />
								Şirket Adı
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.companyName}
							</div>
						</div>

						{/* Phone Number */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Phone className="h-4 w-4" />
								Telefon
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.phoneNumber}
							</div>
						</div>

						{/* Country */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<MapPin className="h-4 w-4" />
								Ülke
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.country}
							</div>
						</div>

						{/* City */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<MapPin className="h-4 w-4" />
								Şehir
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.city}
							</div>
						</div>

						{/* Sector */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Briefcase className="h-4 w-4" />
								Sektör
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.sector}
							</div>
						</div>

						{/* Unit */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Building2 className="h-4 w-4" />
								Birim
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.unit}
							</div>
						</div>

						{/* Legal */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								{contactForm.legal ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								Yasal Onay
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.legal ? "Evet" : "Hayır"}
							</div>
						</div>

						{/* Keep In Touch */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								{contactForm.keepInTouch ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								İletişimde Kal
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{contactForm.keepInTouch ? "Evet" : "Hayır"}
							</div>
						</div>
					</div>

					{/* Message */}
					<div className="mt-6 space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<MessageSquare className="h-4 w-4" />
							Mesaj
						</div>
						<div className="text-p1 text-foreground whitespace-pre-wrap">
							{contactForm.message || "-"}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/contact-forms")}
							className="min-w-[100px]"
						>
							Geri Dön
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

