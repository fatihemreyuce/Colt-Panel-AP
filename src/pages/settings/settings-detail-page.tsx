import { useParams, useNavigate } from "react-router-dom";
import { useGetSetting } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Settings, Loader2, Globe, Twitter, Instagram, Youtube, Linkedin, ExternalLink, FileText, Shield, Cookie } from "lucide-react";
import type { translation } from "@/types/settings.types";

export default function SettingsDetailPage() {
	const { id } = useParams<{ id: string }>();
	const settingsId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: setting, isLoading } = useGetSetting(settingsId);

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

	if (!setting) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Ayar Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız ayar mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/settings")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Ayarlar Listesine Dön
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Sort translations: Turkish first, then others alphabetically
	const sortedTranslations = [...(setting.translations || [])].sort((a, b) => {
		if (a.languageCode.toLowerCase() === "tr") return -1;
		if (b.languageCode.toLowerCase() === "tr") return 1;
		return a.languageCode.localeCompare(b.languageCode);
	});

	return (
		<div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/settings")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							Ayar Detayları
						</h1>
						<p className="text-muted-foreground text-sm">Ayar bilgileri ve çevirileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/settings/edit/${setting.id}`)}
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
							<Settings className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Ayar Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel ayar bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Settings className="h-4 w-4 text-primary" />
								Ayar ID
							</div>
							<div className="text-3xl font-bold text-primary">{setting.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Globe className="h-4 w-4" />
								Dil Sayısı
							</div>
							<Badge variant="secondary" className="text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
								{setting.translations?.length || 0} Dil
							</Badge>
						</div>
					</div>

					<Separator />

					{/* Social Media URLs */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold flex items-center gap-2">
							<Twitter className="h-5 w-5 text-primary" />
							Sosyal Medya Bağlantıları
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							{setting.twitterUrl && (
								<div className="p-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-md transition-all">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Twitter className="h-5 w-5 text-blue-400" />
											<span className="font-semibold">Twitter</span>
										</div>
										<a
											href={setting.twitterUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</div>
									<p className="text-sm text-muted-foreground mt-2 truncate">{setting.twitterUrl}</p>
								</div>
							)}
							{setting.instagramUrl && (
								<div className="p-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-pink-500/10 to-pink-500/5 hover:shadow-md transition-all">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Instagram className="h-5 w-5 text-pink-500" />
											<span className="font-semibold">Instagram</span>
										</div>
										<a
											href={setting.instagramUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</div>
									<p className="text-sm text-muted-foreground mt-2 truncate">{setting.instagramUrl}</p>
								</div>
							)}
							{setting.youtubeUrl && (
								<div className="p-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-red-500/10 to-red-500/5 hover:shadow-md transition-all">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Youtube className="h-5 w-5 text-red-500" />
											<span className="font-semibold">YouTube</span>
										</div>
										<a
											href={setting.youtubeUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</div>
									<p className="text-sm text-muted-foreground mt-2 truncate">{setting.youtubeUrl}</p>
								</div>
							)}
							{setting.linkedinUrl && (
								<div className="p-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-blue-600/10 to-blue-600/5 hover:shadow-md transition-all">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Linkedin className="h-5 w-5 text-blue-600" />
											<span className="font-semibold">LinkedIn</span>
										</div>
										<a
											href={setting.linkedinUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</div>
									<p className="text-sm text-muted-foreground mt-2 truncate">{setting.linkedinUrl}</p>
								</div>
							)}
							{!setting.twitterUrl && !setting.instagramUrl && !setting.youtubeUrl && !setting.linkedinUrl && (
								<div className="col-span-2 p-4 rounded-lg border-2 border-dashed border-border/50 text-center text-muted-foreground">
									Sosyal medya bağlantısı eklenmemiş
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Translations Card */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<Globe className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Çeviriler</CardTitle>
							<CardDescription className="text-xs">Tüm dil çevirileri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{sortedTranslations.length > 0 ? (
						<div className="space-y-4">
							{sortedTranslations.map((translation, index) => (
								<TranslationCard key={translation.languageCode} translation={translation} index={index} />
							))}
						</div>
					) : (
						<div className="text-center py-12 text-muted-foreground">
							<Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>Henüz çeviri eklenmemiş</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

interface TranslationCardProps {
	translation: translation;
	index: number;
}

function TranslationCard({ translation, index }: TranslationCardProps) {
	return (
		<Card className="border-2 shadow-md hover:shadow-lg transition-all">
			<CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
							{translation.languageCode.toUpperCase()}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-6 space-y-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						<FileText className="h-4 w-4" />
						Kullanım Şartları
					</div>
					<div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
						{translation.termsOfUse || <span className="text-muted-foreground italic">Boş</span>}
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						<Shield className="h-4 w-4" />
						Gizlilik Politikası
					</div>
					<div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
						{translation.privacyPolicy || <span className="text-muted-foreground italic">Boş</span>}
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						<Cookie className="h-4 w-4" />
						Çerez Politikası
					</div>
					<div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
						{translation.cookiePolicy || <span className="text-muted-foreground italic">Boş</span>}
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						<FileText className="h-4 w-4" />
						Footer Açıklaması
					</div>
					<div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
						{translation.footerDescription || <span className="text-muted-foreground italic">Boş</span>}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

