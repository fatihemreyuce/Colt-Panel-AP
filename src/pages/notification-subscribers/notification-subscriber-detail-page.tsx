import { useParams, useNavigate } from "react-router-dom";
import { useNotificationSubscribers } from "@/hooks/use-notification-subscribers";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function NotificationSubscriberDetailPage() {
	const { id } = useParams<{ id: string }>();
	const subscriberId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	
	// Get all subscribers and find the one we need
	const { data, isLoading } = useNotificationSubscribers(0, 1000, "id,desc");
	
	const subscriber = data?.content?.find((s) => s.id === subscriberId);

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

	if (!subscriber) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Abone bulunamadı</p>
					<Button
						onClick={() => navigate("/notification-subscribers")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Aboneler Listesine Dön
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
					onClick={() => navigate("/notification-subscribers")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Abone Detayları
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Abone bilgilerini görüntüleyin</p>
				</div>
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Mail className="h-5 w-5 text-muted-foreground" />
						Abone Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Abone detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6 space-y-6">
					{/* ID */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<Mail className="h-4 w-4" />
							Abone ID
						</div>
						<div className="text-h5 font-bold text-foreground">
							{subscriber.id}
						</div>
					</div>

					{/* Email */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
						<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
							<Mail className="h-4 w-4" />
							E-posta
						</div>
						<div className="text-h5 font-bold text-foreground flex items-center gap-2">
							<Mail className="h-5 w-5 text-muted-foreground" />
							{subscriber.email}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/notification-subscribers")}
							className="border-border hover:bg-accent min-w-[100px]"
						>
							Geri Dön
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

