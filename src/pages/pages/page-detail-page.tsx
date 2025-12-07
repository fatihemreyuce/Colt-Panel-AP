import { useParams, useNavigate } from "react-router-dom";
import { useGetPage } from "@/hooks/use-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	ArrowLeft,
	Edit,
	FileText,
	Calendar,
	Clock,
	Loader2,
	Image as ImageIcon,
	File,
	Languages,
	Box,
	Users,
	ExternalLink,
	Link as LinkIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const pageId = id ? parseInt(id, 10) : 0;
	const navigate = useNavigate();
	const { data: page, isLoading } = useGetPage(pageId);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("tr-TR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

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

	if (!page) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-[400px]">
				<Card className="max-w-md w-full border-2">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Sayfa Bulunamadı</CardTitle>
						<CardDescription>
							Aradığınız sayfa mevcut değil veya silinmiş olabilir.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							onClick={() => navigate("/pages")}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Sayfalar Listesine Dön
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
						onClick={() => navigate("/pages")}
						className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
							{page.name}
						</h1>
						<p className="text-muted-foreground text-sm">Sayfa detay bilgileri</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/pages/edit/${page.id}`)}
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
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">Sayfa Bilgileri</CardTitle>
							<CardDescription className="text-xs">Genel sayfa bilgileri ve özellikleri</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 bg-gradient-to-b from-transparent to-muted/10">
					{/* Basic Info Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileText className="h-4 w-4 text-primary" />
								Sayfa ID
							</div>
							<div className="text-3xl font-bold text-primary">{page.id}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileText className="h-4 w-4" />
								Ad
							</div>
							<div className="text-lg font-bold text-foreground">{page.name}</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<LinkIcon className="h-4 w-4" />
								Slug
							</div>
							<code className="text-sm font-mono font-bold text-foreground bg-gradient-to-r from-background to-muted/30 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
								{page.slug}
							</code>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<FileText className="h-4 w-4" />
								Tip
							</div>
							<Badge variant="secondary" className="text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
								{page.type}
							</Badge>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Calendar className="h-4 w-4" />
								Oluşturulma
							</div>
							<div className="text-sm font-bold text-foreground">
								{formatDate(page.createdAt)}
							</div>
						</div>

						<div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<Clock className="h-4 w-4" />
								Güncellenme
							</div>
							<div className="text-sm font-bold text-foreground">
								{formatDate(page.updatedAt)}
							</div>
						</div>
					</div>

					<Separator />

					{/* File and Image */}
					<div className="grid gap-4 md:grid-cols-2">
						{page.file && (
							<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
								<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
									<CardTitle className="text-base flex items-center gap-2 font-bold">
										<div className="p-1.5 rounded-lg bg-primary/20">
											<File className="h-4 w-4 text-primary" />
										</div>
										Dosya
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									{page.file.url && (
										<a
											href={page.file.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all duration-200 hover:scale-105 shadow-sm"
										>
											<ExternalLink className="h-4 w-4" />
											Dosyayı Görüntüle
										</a>
									)}
								</CardContent>
							</Card>
						)}

						{page.image && (
							<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
								<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
									<CardTitle className="text-base flex items-center gap-2 font-bold">
										<div className="p-1.5 rounded-lg bg-primary/20">
											<ImageIcon className="h-4 w-4 text-primary" />
										</div>
										Görsel
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									{page.image.url && (
										<div className="relative w-full h-56 rounded-xl overflow-hidden border-2 border-border shadow-lg group hover:shadow-xl transition-all duration-200">
											<img
												src={page.image.url}
												alt={page.name}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tabs Section */}
			<Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
							<FileText className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl font-bold">İçerik Detayları</CardTitle>
							<CardDescription className="text-xs">
								Çeviriler, bileşenler ve takım üyeleri bilgileri
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-6 bg-gradient-to-b from-transparent to-muted/10">
					<Tabs defaultValue="localizations" className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80 p-1.5 rounded-xl border-2 shadow-inner">
							<TabsTrigger 
								value="localizations" 
								className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-semibold"
							>
								<Languages className="h-4 w-4" />
								Çeviriler
								<Badge variant="secondary" className="ml-2 bg-background/80 border border-border/50 font-bold">
									{page.localizations?.length || 0}
								</Badge>
							</TabsTrigger>
							<TabsTrigger 
								value="components" 
								className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-semibold"
							>
								<Box className="h-4 w-4" />
								Bileşenler
								<Badge variant="secondary" className="ml-2 bg-background/80 border border-border/50 font-bold">
									{page.components && Array.isArray(page.components) ? page.components.length : 0}
								</Badge>
							</TabsTrigger>
							<TabsTrigger 
								value="teamMembers" 
								className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-semibold"
							>
								<Users className="h-4 w-4" />
								Takım Üyeleri
								<Badge variant="secondary" className="ml-2 bg-background/80 border border-border/50 font-bold">
									{page.teamMembers && Array.isArray(page.teamMembers) ? page.teamMembers.length : 0}
								</Badge>
							</TabsTrigger>
						</TabsList>

						{/* Localizations */}
						<TabsContent value="localizations" className="space-y-4 mt-0">
							{page.localizations && page.localizations.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2">
									{page.localizations.map((loc, index) => (
										<Card key={index} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
											<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
												<div className="flex items-center gap-2">
													<div className="p-1.5 rounded-lg bg-primary/20">
														<Languages className="h-4 w-4 text-primary" />
													</div>
													<CardTitle className="text-base uppercase font-bold">
														{loc.languageCode}
													</CardTitle>
												</div>
											</CardHeader>
											<CardContent className="space-y-3">
												{loc.title && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Başlık
														</div>
														<div className="text-sm font-medium text-foreground">{loc.title}</div>
													</div>
												)}
												{loc.excerpt && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Özet
														</div>
														<div className="text-sm text-foreground">{loc.excerpt}</div>
													</div>
												)}
												{loc.content && (
													<div>
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															İçerik
														</div>
														<div
															className="text-sm text-foreground prose prose-sm max-w-none"
															dangerouslySetInnerHTML={{ __html: loc.content }}
														/>
													</div>
												)}
												{(loc.metaTitle || loc.metaDescription || loc.metaKeywords) && (
													<div className="pt-3 border-t space-y-2">
														<div className="text-xs font-semibold text-muted-foreground mb-2">
															SEO Bilgileri
														</div>
														{loc.metaTitle && (
															<div>
																<div className="text-xs text-muted-foreground mb-0.5">
																	Meta Başlık
																</div>
																<div className="text-xs font-medium text-foreground">{loc.metaTitle}</div>
															</div>
														)}
														{loc.metaDescription && (
															<div>
																<div className="text-xs text-muted-foreground mb-0.5">
																	Meta Açıklama
																</div>
																<div className="text-xs text-foreground">{loc.metaDescription}</div>
															</div>
														)}
														{loc.metaKeywords && (
															<div>
																<div className="text-xs text-muted-foreground mb-0.5">
																	Meta Anahtar Kelimeler
																</div>
																<div className="text-xs text-foreground">{loc.metaKeywords}</div>
															</div>
														)}
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<Languages className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
									<p className="text-sm font-medium text-muted-foreground">Çeviri bulunamadı</p>
								</div>
							)}
						</TabsContent>

						{/* Components */}
						<TabsContent value="components" className="space-y-4 mt-0">
							{page.components && Array.isArray(page.components) && page.components.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2">
									{[...page.components]
										.sort((a, b) => {
											if (a.sortOrder === null && b.sortOrder === null) return 0;
											if (a.sortOrder === null) return 1;
											if (b.sortOrder === null) return -1;
											return (a.sortOrder || 0) - (b.sortOrder || 0);
										})
										.map((item) => {
											const component = item.component;
											return (
												<Card key={component.id} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
													<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																<div className="p-1.5 rounded-lg bg-primary/20">
																	<Box className="h-4 w-4 text-primary" />
																</div>
																<CardTitle className="text-base font-bold">{component.name}</CardTitle>
															</div>
															{item.sortOrder !== null && (
																<Badge variant="outline" className="text-xs font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
																	#{item.sortOrder}
																</Badge>
															)}
														</div>
													</CardHeader>
													<CardContent className="space-y-3 pt-4">
														<div>
															<div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
																Tip
															</div>
															<Badge variant="secondary" className="text-xs font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
																{component.type}
															</Badge>
														</div>
														{component.value && (
															<div>
																<div className="text-xs font-semibold text-muted-foreground mb-1">
																	Değer
																</div>
																<div className="text-sm text-foreground">{component.value}</div>
															</div>
														)}
													</CardContent>
												</Card>
											);
										})}
								</div>
							) : (
								<div className="text-center py-12">
									<Box className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
									<p className="text-sm font-medium text-muted-foreground">Bileşen bulunamadı</p>
								</div>
							)}
						</TabsContent>

						{/* Team Members */}
						<TabsContent value="teamMembers" className="space-y-4 mt-0">
							{page.teamMembers && Array.isArray(page.teamMembers) && page.teamMembers.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{[...page.teamMembers]
										.sort((a, b) => {
											if (a.sortOrder === null && b.sortOrder === null) return 0;
											if (a.sortOrder === null) return 1;
											if (b.sortOrder === null) return -1;
											return (a.sortOrder || 0) - (b.sortOrder || 0);
										})
										.map((item) => {
											const member = item.teamMember;
											return (
												<Card key={member.id} className="border-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
													<CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																<div className="p-1.5 rounded-lg bg-primary/20">
																	<Users className="h-4 w-4 text-primary" />
																</div>
																<CardTitle className="text-base font-bold">{member.name}</CardTitle>
															</div>
															{item.sortOrder !== null && (
																<Badge variant="outline" className="text-xs font-bold bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-sm">
																	#{item.sortOrder}
																</Badge>
															)}
														</div>
													</CardHeader>
													<CardContent className="space-y-3 pt-4">
														{member.email && (
															<div>
																<div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
																	E-posta
																</div>
																<div className="text-sm font-semibold text-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
																	{member.email}
																</div>
															</div>
														)}
														{member.linkedinUrl && (
															<div>
																<div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
																	LinkedIn
																</div>
																<a
																	href={member.linkedinUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all duration-200 hover:scale-105 shadow-sm"
																>
																	<ExternalLink className="h-4 w-4" />
																	Profil
																</a>
															</div>
														)}
													</CardContent>
												</Card>
											);
										})}
								</div>
							) : (
								<div className="text-center py-12">
									<Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
									<p className="text-sm font-medium text-muted-foreground">Takım üyesi bulunamadı</p>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex items-center justify-end gap-4">
				<Button
					variant="outline"
					onClick={() => navigate("/pages")}
					size="lg"
					className="min-w-[120px] border-2 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all shadow-sm"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Geri Dön
				</Button>
				<Button
					onClick={() => navigate(`/pages/edit/${page.id}`)}
					className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 min-w-[120px]"
					size="lg"
				>
					<Edit className="h-4 w-4 mr-2" />
					Düzenle
				</Button>
			</div>
		</div>
	);
}
