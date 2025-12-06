import { useParams, useNavigate } from "react-router-dom";
import { useGetNotification, useSendNotification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Loader2, Send, Edit } from "lucide-react";
import type { notificationRequest } from "@/types/notifications.types";

export default function NotificationDetailPage() {
	const { id } = useParams<{ id: string }>();
	const notificationId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: notification, isLoading } = useGetNotification(notificationId);
	const sendNotificationMutation = useSendNotification();

	const handleSend = async () => {
		if (!notification) return;

		const notificationRequest: notificationRequest = {
			title: notification.title,
			content: notification.content,
		};

		try {
			await sendNotificationMutation.mutateAsync({
				notification: notificationRequest,
				id: notificationId,
			});
		} catch (error) {
			// Error handled by mutation
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
			<div className="flex h-16 items-center justify-between border-b border-border px-6 -mx-6 mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/notifications")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Bildirim Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Bildirim bilgilerini görüntüleyin</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => navigate(`/notifications/edit/${notification.id}`)}
						className="border-border hover:bg-accent"
					>
						<Edit className="h-4 w-4 mr-2" />
						Düzenle
					</Button>
					<Button
						onClick={handleSend}
						disabled={sendNotificationMutation.isPending}
						className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
					>
						{sendNotificationMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Gönderiliyor...
							</>
						) : (
							<>
								<Send className="h-4 w-4 mr-2" />
								Gönder
							</>
						)}
					</Button>
				</div>
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Bell className="h-5 w-5 text-muted-foreground" />
						Bildirim Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Bildirim detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6 space-y-6">
					{/* ID */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<Bell className="h-4 w-4" />
							Bildirim ID
						</div>
						<div className="text-h5 font-bold text-foreground">
							{notification.id}
						</div>
					</div>

					{/* Title */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<Bell className="h-4 w-4" />
							Başlık
						</div>
						<div className="text-h5 font-bold text-foreground">
							{notification.title}
						</div>
					</div>

					{/* Content */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground mb-3">
							<Bell className="h-4 w-4" />
							İçerik
						</div>
						<div 
							className="text-p1 text-foreground prose prose-sm dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{ __html: notification.content }}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/notifications")}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate(`/notifications/edit/${notification.id}`)}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							<Edit className="h-4 w-4 mr-2" />
							Düzenle
						</Button>
						<Button
							onClick={handleSend}
							disabled={sendNotificationMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{sendNotificationMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Gönderiliyor...
								</>
							) : (
								<>
									<Send className="h-4 w-4 mr-2" />
									Gönder
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

