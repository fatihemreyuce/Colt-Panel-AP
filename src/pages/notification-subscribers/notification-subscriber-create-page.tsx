import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateNotificationSubscriber } from "@/hooks/use-notification-subscribers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Mail, RefreshCw } from "lucide-react";
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
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center gap-4 border-b border-border px-6 -mx-6 mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/notification-subscribers")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Yeni Abone Oluştur
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Yeni bir bildirim abonesi ekleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Mail className="h-5 w-5 text-muted-foreground" />
						Abone Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Abone e-posta adresini giriniz</p>
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
							className="border-border hover:bg-accent"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={createSubscriberMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{createSubscriberMutation.isPending ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

