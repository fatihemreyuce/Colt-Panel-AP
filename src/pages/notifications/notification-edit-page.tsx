import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetNotification, useUpdateNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save, Bell, RefreshCw, Loader2 } from "lucide-react";
import type { notificationRequest } from "@/types/notifications.types";

export default function NotificationEditPage() {
	const { id } = useParams<{ id: string }>();
	const notificationId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: notification, isLoading } = useGetNotification(notificationId);
	const updateNotificationMutation = useUpdateNotification();

	const [formData, setFormData] = useState<notificationRequest>({
		title: "",
		content: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Form verilerini notification'dan doldur
	useEffect(() => {
		if (notification) {
			setFormData({
				title: notification.title || "",
				content: notification.content || "",
			});
		}
	}, [notification]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.title.trim()) {
			newErrors.title = "Başlık gereklidir";
		}
		if (!formData.content.trim()) {
			newErrors.content = "İçerik gereklidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await updateNotificationMutation.mutateAsync({
					id: notificationId,
					notification: formData,
				});
				navigate("/notifications");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
				<div className="flex flex-col items-center justify-center h-[400px] gap-4">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground font-medium">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!notification) {
		return (
			<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
				<div className="text-center py-12">
					<p className="text-sm text-muted-foreground mb-4">Bildirim bulunamadı</p>
					<Button
						onClick={() => navigate("/notifications")}
						className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					>
						Bildirimler Listesine Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/notifications")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Bildirimi Düzenle
						</h1>
						<p className="text-muted-foreground text-sm ml-1">
							Bildirim bilgilerini güncelleyin
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
							<Bell className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Bildirim Bilgileri</h2>
							<p className="text-sm text-muted-foreground mt-0.5">Bildirim başlığı ve içeriğini güncelleyiniz</p>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Title Field */}
					<div className="space-y-2">
						<Label htmlFor="title" className="text-p3 font-semibold">
							Başlık <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							placeholder="Bildirim başlığı"
							className={`h-11 ${
								errors.title ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
						/>
						{errors.title && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.title}
							</p>
						)}
					</div>

					{/* Content Field */}
					<div className="space-y-2">
						<Label htmlFor="content" className="text-p3 font-semibold">
							İçerik <span className="text-destructive">*</span>
						</Label>
						<RichTextEditor
							value={formData.content}
							onChange={(value) => setFormData({ ...formData, content: value })}
							placeholder="Bildirim içeriği"
						/>
						{errors.content && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.content}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/notifications")}
							size="lg"
							className="min-w-[120px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateNotificationMutation.isPending}
							size="lg"
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[140px]"
						>
							{updateNotificationMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

