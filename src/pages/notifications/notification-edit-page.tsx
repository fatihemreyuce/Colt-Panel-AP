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
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!notification) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Bildirim bulunamadı</p>
					<Button
						onClick={() => navigate("/notifications")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Bildirimler Listesine Dön
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
					onClick={() => navigate("/notifications")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Bildirimi Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Bildirim bilgilerini güncelleyin</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Bell className="h-5 w-5 text-muted-foreground" />
						Bildirim Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Bildirim başlığı ve içeriğini güncelleyiniz</p>
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
							className="border-border hover:bg-accent"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateNotificationMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{updateNotificationMutation.isPending ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

