import { useParams, useNavigate } from "react-router-dom";
import { useNotificationSubscribers } from "@/hooks/use-notification-subscribers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-primary" />
					<p className="text-sm font-medium text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!subscriber) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Abone Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız abone mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/notification-subscribers")}
							className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Aboneler Listesine Dön
						</Button>
					</CardContent>
				</Card>
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
						onClick={() => navigate("/notification-subscribers")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							Abone Detayları
						</h1>
						<p className="text-muted-foreground text-sm">Abone bilgilerini görüntüleyin</p>
					</div>
				</div>
			</div>
			
			{/* Main Info Card */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Abone Bilgileri</CardTitle>
							<CardDescription className="text-xs">Abone detay bilgileri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Mail className="h-4 w-4 text-primary" />
								Abone ID
							</div>
							<div className="text-3xl font-bold text-primary">{subscriber.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Mail className="h-4 w-4" />
								E-posta
							</div>
							<div className="text-lg font-bold text-foreground flex items-center gap-2">
								<Mail className="h-5 w-5 text-muted-foreground" />
								{subscriber.email}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

