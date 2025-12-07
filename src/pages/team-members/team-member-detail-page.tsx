import { useParams, useNavigate } from "react-router-dom";
import { useGetTeamMemberById } from "@/hooks/use-team-members";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, User, Mail, Linkedin, Image as ImageIcon, Loader2, Users, ExternalLink, Globe } from "lucide-react";

export default function TeamMemberDetailPage() {
	const { id } = useParams<{ id: string }>();
	const teamMemberId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: teamMember, isLoading } = useGetTeamMemberById(teamMemberId);

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

	if (!teamMember) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Takım Üyesi Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız takım üyesi mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/team-members")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Takım Üyeleri Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Helper function to get Turkish localization first
	const getPreferredLocalization = (localizations: any[]) => {
		if (!localizations || localizations.length === 0) return null;
		const turkish = localizations.find((loc) => loc.languageCode.toLowerCase() === "tr");
		return turkish || localizations[0];
	};

	const preferredLoc = getPreferredLocalization(teamMember.localizations || []);

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/team-members")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							{teamMember.name}
						</h1>
						<p className="text-muted-foreground text-sm">Takım üyesi detay bilgileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/team-members/edit/${teamMember.id}`)}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
					size="lg"
				>
					<Edit className="h-5 w-5 mr-2" />
					Düzenle
				</Button>
			</div>

			{/* Main Info Card */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Users className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Takım Üyesi Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel takım üyesi bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Photo and Basic Info */}
					<div className="flex items-start gap-6 pb-6 border-b">
						{teamMember.photo ? (
							<div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:scale-105">
								<img
									src={teamMember.photo}
									alt={teamMember.name}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						) : (
							<div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-muted/50 border-4 border-primary/20 flex items-center justify-center shadow-xl">
								<Users className="h-16 w-16 text-muted-foreground/50" />
							</div>
						)}
						<div className="flex-1 space-y-2">
							<h3 className="text-2xl font-bold text-foreground">
								{teamMember.name}
							</h3>
							{preferredLoc && (
								<div className="space-y-1">
									{preferredLoc.title && (
										<p className="text-sm font-medium text-foreground">{preferredLoc.title}</p>
									)}
									{preferredLoc.description && (
										<div
											className="text-sm text-muted-foreground prose prose-sm max-w-none"
											dangerouslySetInnerHTML={{ __html: preferredLoc.description }}
										/>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<User className="h-4 w-4 text-primary" />
								Takım Üyesi ID
							</div>
							<div className="text-3xl font-bold text-primary">{teamMember.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Mail className="h-4 w-4" />
								E-posta
							</div>
							<a
								href={`mailto:${teamMember.email}`}
								className="text-sm font-bold text-primary hover:underline break-all flex items-center gap-2"
							>
								<Mail className="h-4 w-4" />
								{teamMember.email}
							</a>
						</div>

						{teamMember.linkedinUrl && (
							<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
								<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
									<Linkedin className="h-4 w-4" />
									LinkedIn
								</div>
								<a
									href={teamMember.linkedinUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-bold text-primary hover:underline break-all flex items-center gap-2"
								>
									<ExternalLink className="h-4 w-4" />
									LinkedIn Profili
								</a>
							</div>
						)}
					</div>

					<Separator />

					{/* Localizations */}
					{teamMember.localizations && teamMember.localizations.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-primary/10">
									<Globe className="h-4 w-4 text-primary" />
								</div>
								<h3 className="text-lg font-bold">Çeviriler</h3>
								<Badge variant="secondary" className="bg-background/80 border border-border/50 font-bold">
									{teamMember.localizations.length}
								</Badge>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								{[...teamMember.localizations].sort((a, b) => {
									const aIsTurkish = a.languageCode.toLowerCase() === "tr";
									const bIsTurkish = b.languageCode.toLowerCase() === "tr";
									if (aIsTurkish && !bIsTurkish) return -1;
									if (!aIsTurkish && bIsTurkish) return 1;
									return 0;
								}).map((localization, index) => (
									<Card key={index} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
										<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
											<div className="flex items-center gap-2">
												<div className="p-1.5 rounded-lg bg-primary/20">
													<Globe className="h-4 w-4 text-primary" />
												</div>
												<CardTitle className="text-base uppercase font-bold">
													{localization.languageCode}
												</CardTitle>
											</div>
										</CardHeader>
										<CardContent className="space-y-3">
											{localization.title && (
												<div>
													<div className="text-xs font-semibold text-muted-foreground mb-1">
														Başlık
													</div>
													<div className="text-sm font-medium text-foreground">{localization.title}</div>
												</div>
											)}
											{localization.description && (
												<div>
													<div className="text-xs font-semibold text-muted-foreground mb-1">
														Açıklama
													</div>
													<div
														className="text-sm text-foreground prose prose-sm max-w-none"
														dangerouslySetInnerHTML={{ __html: localization.description }}
													/>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
