import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateNotificationSubscriber } from "@/hooks/use-notification-subscribers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Mail, RefreshCw, Loader2 } from "lucide-react";
import type { notificationSubscriberRequest } from "@/types/notification-subscribers.types";

export default function NotificationSubscriberCreatePage() {
	const navigate = useNavigate();
	const createSubscriberMutation = useCreateNotificationSubscriber();
	const [formData, setFormData] = useState<notificationSubscriberRequest>({
		email: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.email.trim()) {
			newErrors.email = "E-posta gereklidir";
		} else if (!validateEmail(formData.email)) {
			newErrors.email = "Geçerli bir e-posta adresi giriniz";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await createSubscriberMutation.mutateAsync(formData);
				navigate("/notification-subscribers");
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
						onClick={() => navigate("/notification-subscribers")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Yeni Abone Oluştur
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Yeni bir bildirim abonesi ekleyin
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
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Abone Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Abone e-posta adresini giriniz</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor="email" className="text-p3 font-semibold flex items-center gap-2">
							<Mail className="h-4 w-4 text-muted-foreground" />
							E-posta <span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							placeholder="ornek@email.com"
							className={`h-11 ${
								errors.email ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
						/>
						{errors.email && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.email}
							</p>
						)}
						<p className="text-p3 text-muted-foreground">
							Bu e-posta adresine bildirimler gönderilecektir.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/notification-subscribers")}
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createSubscriberMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{createSubscriberMutation.isPending ? (
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

