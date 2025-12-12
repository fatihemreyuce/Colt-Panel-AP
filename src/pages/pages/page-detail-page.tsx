import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPage } from "@/hooks/use-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	ArrowLeft,
	FileText,
	Calendar,
	Clock,
	Loader2,
	Image as ImageIcon,
	File,
	Box,
	Users,
	ExternalLink,
	Edit,
} from "lucide-react";

export default function PageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const pageId = id ? parseInt(id, 10) : 0;
	const navigate = useNavigate();
	const { data: page, isLoading } = useGetPage(pageId);

	// Language selection state - MUST be before conditional returns (Rules of Hooks)
	const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");

	// Set initial selected language - MUST be before conditional returns (Rules of Hooks)
	useEffect(() => {
		if (page && page.localizations && page.localizations.length > 0 && selectedLanguageCode === "") {
			const turkish = page.localizations.find((loc: any) => loc.languageCode.toLowerCase() === "tr");
			setSelectedLanguageCode(turkish ? turkish.languageCode : page.localizations[0].languageCode);
		}
	}, [page]);

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

	// Helper function to get Turkish localization first
	const getPreferredLocalization = (localizations: any[]) => {
		if (!localizations || localizations.length === 0) return null;
		const turkish = localizations.find((loc) => loc.languageCode.toLowerCase() === "tr");
		return turkish || localizations[0];
	};

	const preferredLoc = getPreferredLocalization(page.localizations || []);
	const displayLoc = selectedLanguageCode
		? page.localizations?.find((loc: any) => loc.languageCode === selectedLanguageCode)
		: null;
	const currentLoc = displayLoc || preferredLoc || (page.localizations && page.localizations.length > 0 ? page.localizations[0] : null);

	// Sort localizations: Turkish first, then others
	const sortedLocalizations = page.localizations
		? [...page.localizations].sort((a: any, b: any) => {
				const aIsTurkish = a.languageCode.toLowerCase() === "tr";
				const bIsTurkish = b.languageCode.toLowerCase() === "tr";
				if (aIsTurkish && !bIsTurkish) return -1;
				if (!aIsTurkish && bIsTurkish) return 1;
				return 0;
			})
		: [];

	// Helper function to strip HTML tags from text
	const stripHtml = (html: string): string => {
		if (!html) return "";
		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	return (
		<div className="flex-1 p-6 bg-muted/30">
			{/* Header */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/pages")}
					className="mb-4 h-10 w-10"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold mb-1">{page.name}</h1>
					<p className="text-muted-foreground text-sm">Sayfa detay bilgileri</p>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Image Preview Card */}
					{page.image && page.image.url && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<ImageIcon className="h-5 w-5" />
									<CardTitle>Görsel</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<div className="w-full rounded-lg overflow-hidden border">
									<img
										src={page.image.url}
										alt={page.name}
										className="w-full h-auto object-contain"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
										}}
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Translations Card */}
					{page.localizations && page.localizations.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Çeviriler</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Language Selection Badges */}
								<div className="flex flex-wrap gap-2 mb-4">
									{sortedLocalizations.map((loc: any) => (
										<Badge
											key={loc.languageCode}
											className={`cursor-pointer transition-all ${
												selectedLanguageCode === loc.languageCode
													? "bg-green-500 text-white"
													: "bg-gray-200 text-gray-700 hover:bg-gray-300"
											}`}
											onClick={() => setSelectedLanguageCode(loc.languageCode)}
										>
											{loc.languageCode.toUpperCase()}
										</Badge>
									))}
								</div>

								{/* Selected Language Content */}
								{currentLoc && (
									<div className="space-y-4">
										{currentLoc.title && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Başlık</label>
												<Input
													value={currentLoc.title}
													readOnly
													className="bg-background"
												/>
											</div>
										)}
										{currentLoc.excerpt && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Özet</label>
												<Input
													value={currentLoc.excerpt}
													readOnly
													className="bg-background"
												/>
											</div>
										)}
										{currentLoc.content && (
											<div className="space-y-2">
												<label className="text-sm font-medium">İçerik</label>
												<Textarea
													value={stripHtml(currentLoc.content)}
													readOnly
													className="bg-background min-h-[150px]"
												/>
											</div>
										)}
										{(currentLoc.metaTitle || currentLoc.metaDescription || currentLoc.metaKeywords) && (
											<div className="pt-4 border-t space-y-4">
												<h4 className="text-sm font-semibold">SEO Bilgileri</h4>
												{currentLoc.metaTitle && (
													<div className="space-y-2">
														<label className="text-sm font-medium">Meta Başlık</label>
														<Input
															value={currentLoc.metaTitle}
															readOnly
															className="bg-background"
														/>
													</div>
												)}
												{currentLoc.metaDescription && (
													<div className="space-y-2">
														<label className="text-sm font-medium">Meta Açıklama</label>
														<Textarea
															value={currentLoc.metaDescription}
															readOnly
															className="bg-background min-h-[80px]"
														/>
													</div>
												)}
												{currentLoc.metaKeywords && (
													<div className="space-y-2">
														<label className="text-sm font-medium">Meta Anahtar Kelimeler</label>
														<Input
															value={currentLoc.metaKeywords}
															readOnly
															className="bg-background"
														/>
													</div>
												)}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Components Card */}
					{page.components && Array.isArray(page.components) && page.components.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Bileşenler</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
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
												<div key={component.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
													<div className="flex items-center gap-3">
														<Box className="h-4 w-4 text-primary" />
														<span className="font-medium">{component.name}</span>
														<Badge variant="secondary" className="bg-blue-100 text-blue-800">
															{component.type}
														</Badge>
													</div>
													{item.sortOrder !== null && (
														<Badge className="bg-green-500 text-white">
															#{item.sortOrder}
														</Badge>
													)}
												</div>
											);
										})}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Team Members Card */}
					{page.teamMembers && Array.isArray(page.teamMembers) && page.teamMembers.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Takım Üyeleri</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
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
												<div key={member.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
													<div className="flex items-center gap-3">
														<Users className="h-4 w-4 text-primary" />
														<span className="font-medium">{member.name}</span>
														{member.email && (
															<span className="text-sm text-muted-foreground">{member.email}</span>
														)}
													</div>
													{item.sortOrder !== null && (
														<Badge className="bg-green-500 text-white">
															#{item.sortOrder}
														</Badge>
													)}
												</div>
											);
										})}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column */}
				<div className="space-y-6">
					{/* Quick Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Hızlı Bilgiler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm text-muted-foreground">ID:</label>
								<div className="mt-1">
									<Badge className="bg-green-500 text-white">#{page.id}</Badge>
								</div>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Ad:</label>
								<p className="mt-1 text-sm font-medium">{page.name}</p>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Slug:</label>
								<p className="mt-1 text-sm font-medium font-mono">{page.slug}</p>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Tip:</label>
								<div className="mt-1">
									<Badge variant="secondary" className="bg-blue-100 text-blue-800">
										{page.type}
									</Badge>
								</div>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Oluşturulma:</label>
								<p className="mt-1 text-sm font-medium">{formatDate(page.createdAt)}</p>
							</div>
							<div>
								<label className="text-sm text-muted-foreground">Güncellenme:</label>
								<p className="mt-1 text-sm font-medium">{formatDate(page.updatedAt)}</p>
							</div>
							{page.localizations && page.localizations.length > 0 && (
								<div>
									<label className="text-sm text-muted-foreground">Diller:</label>
									<div className="mt-1 flex flex-wrap gap-2">
										{sortedLocalizations.map((loc: any) => (
											<Badge key={loc.languageCode} className="bg-green-500 text-white">
												{loc.languageCode.toUpperCase()}
											</Badge>
										))}
									</div>
								</div>
							)}
							{page.file && page.file.url && (
								<div>
									<label className="text-sm text-muted-foreground">Dosya:</label>
									<div className="mt-1">
										<a
											href={page.file.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-primary hover:underline flex items-center gap-1"
										>
											<ExternalLink className="h-3 w-3" />
											<span className="truncate">Dosyayı Görüntüle</span>
										</a>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Actions Card */}
					<Card>
						<CardHeader>
							<CardTitle>İşlemler</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								onClick={() => navigate(`/pages/edit/${page.id}`)}
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							>
								<FileText className="h-4 w-4 mr-2" />
								Düzenle
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
