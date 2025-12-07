import { useParams, useNavigate } from "react-router-dom";
import { useGetPage } from "@/hooks/use-page";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!page) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Sayfa bulunamadı</p>
					<Button
						onClick={() => navigate("/pages")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Sayfalar Listesine Dön
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
					<Button variant="ghost" size="icon" onClick={() => navigate("/pages")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">Sayfa Detayları</h1>
						<p className="text-p3 text-muted-foreground mt-1">{page.name}</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/pages/edit/${page.id}`)}
					className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
				>
					<Edit className="h-4 w-4 mr-2" />
					Düzenle
				</Button>
			</div>

			{/* Info Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Info Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<FileText className="h-5 w-5 text-muted-foreground" />
						Sayfa Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Sayfa detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6">
					{/* Basic Info */}
					<div className="grid gap-6 md:grid-cols-2 mb-6">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Sayfa ID
							</div>
							<div className="text-h5 font-bold text-foreground">{page.id}</div>
						</div>

						{/* Name */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Ad
							</div>
							<div className="text-h5 font-bold text-foreground">{page.name}</div>
						</div>

						{/* Slug */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Slug
							</div>
							<div className="text-p1 font-mono font-semibold text-foreground">{page.slug}</div>
						</div>

						{/* Type */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<FileText className="h-4 w-4" />
								Tip
							</div>
							<div className="text-p1 font-semibold text-foreground">
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
									{page.type}
								</span>
							</div>
						</div>

						{/* Created At */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Calendar className="h-4 w-4" />
								Oluşturulma Tarihi
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{formatDate(page.createdAt)}
							</div>
						</div>

						{/* Updated At */}
						<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
								<Clock className="h-4 w-4" />
								Güncellenme Tarihi
							</div>
							<div className="text-p1 font-semibold text-foreground">
								{formatDate(page.updatedAt)}
							</div>
						</div>
					</div>

					{/* File and Image */}
					<div className="grid gap-6 md:grid-cols-2 mb-6">
						{/* File */}
						{page.file && (
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground mb-2">
									<File className="h-4 w-4" />
									Dosya
								</div>
								{page.file.url && (
									<a
										href={page.file.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-p3 text-primary hover:underline flex items-center gap-2"
									>
										<File className="h-4 w-4" />
										Dosyayı Görüntüle
									</a>
								)}
							</div>
						)}

						{/* Image */}
						{page.image && (
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground mb-2">
									<ImageIcon className="h-4 w-4" />
									Görsel
								</div>
								{page.image.url && (
									<img
										src={page.image.url}
										alt={page.name}
										className="h-32 w-auto rounded object-cover border border-border"
									/>
								)}
							</div>
						)}
					</div>

					{/* Tabs for Localizations, Components, Team Members */}
					<Tabs defaultValue="localizations" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="localizations" className="flex items-center gap-2">
								<Languages className="h-4 w-4" />
								Çeviriler ({page.localizations?.length || 0})
							</TabsTrigger>
							<TabsTrigger value="components" className="flex items-center gap-2">
								<Box className="h-4 w-4" />
								Bileşenler ({page.components && Array.isArray(page.components) ? page.components.length : 0})
							</TabsTrigger>
							<TabsTrigger value="teamMembers" className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Takım Üyeleri ({page.teamMembers && Array.isArray(page.teamMembers) ? page.teamMembers.length : 0})
							</TabsTrigger>
						</TabsList>

						{/* Localizations */}
						<TabsContent value="localizations" className="mt-4">
							<div className="space-y-4">
								{page.localizations && page.localizations.length > 0 ? (
									page.localizations.map((loc, index) => (
										<div
											key={index}
											className="p-4 rounded-lg bg-muted/50 border border-border space-y-3"
										>
											<div className="flex items-center gap-2 mb-3">
												<Languages className="h-4 w-4 text-muted-foreground" />
												<span className="text-p3 font-semibold text-foreground uppercase">
													{loc.languageCode}
												</span>
											</div>
											<div className="space-y-2">
												<div>
													<span className="text-p3 font-semibold text-muted-foreground">Başlık: </span>
													<span className="text-p1 text-foreground">{loc.title}</span>
												</div>
												{loc.excerpt && (
													<div>
														<span className="text-p3 font-semibold text-muted-foreground">Özet: </span>
														<span className="text-p1 text-foreground">{loc.excerpt}</span>
													</div>
												)}
												{loc.content && (
													<div>
														<span className="text-p3 font-semibold text-muted-foreground">İçerik: </span>
														<div
															className="text-p1 text-foreground mt-2"
															dangerouslySetInnerHTML={{ __html: loc.content }}
														/>
													</div>
												)}
												{loc.metaTitle && (
													<div>
														<span className="text-p3 font-semibold text-muted-foreground">
															Meta Başlık:{" "}
														</span>
														<span className="text-p1 text-foreground">{loc.metaTitle}</span>
													</div>
												)}
												{loc.metaDescription && (
													<div>
														<span className="text-p3 font-semibold text-muted-foreground">
															Meta Açıklama:{" "}
														</span>
														<span className="text-p1 text-foreground">{loc.metaDescription}</span>
													</div>
												)}
												{loc.metaKeywords && (
													<div>
														<span className="text-p3 font-semibold text-muted-foreground">
															Meta Anahtar Kelimeler:{" "}
														</span>
														<span className="text-p1 text-foreground">{loc.metaKeywords}</span>
													</div>
												)}
											</div>
										</div>
									))
								) : (
									<div className="text-center py-8 text-p3 text-muted-foreground">
										Çeviri bulunamadı
									</div>
								)}
							</div>
						</TabsContent>

						{/* Components */}
						<TabsContent value="components" className="mt-4">
							<div className="space-y-4">
								{page.components && Array.isArray(page.components) && page.components.length > 0 ? (
									page.components.map((item) => {
										const component = item.component;
										return (
											<div
												key={component.id}
												className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
											>
												<div className="flex items-center gap-2 mb-2">
													<Box className="h-4 w-4 text-muted-foreground" />
													<span className="text-p1 font-semibold text-foreground">{component.name}</span>
												</div>
												<div className="text-p3 text-muted-foreground">
													<span className="font-semibold">Tip: </span>
													<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
														{component.type}
													</span>
												</div>
												{component.value && (
													<div className="text-p3 text-muted-foreground">
														<span className="font-semibold">Değer: </span>
														<span>{component.value}</span>
													</div>
												)}
											</div>
										);
									})
								) : (
									<div className="text-center py-8 text-p3 text-muted-foreground">
										Bileşen bulunamadı
									</div>
								)}
							</div>
						</TabsContent>

						{/* Team Members */}
						<TabsContent value="teamMembers" className="mt-4">
							<div className="space-y-4">
								{page.teamMembers && Array.isArray(page.teamMembers) && page.teamMembers.length > 0 ? (
									page.teamMembers.map((item) => {
										const member = item.teamMember;
										return (
											<div
												key={member.id}
												className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
											>
												<div className="flex items-center gap-2 mb-2">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span className="text-p1 font-semibold text-foreground">{member.name}</span>
												</div>
												{member.email && (
													<div className="text-p3 text-muted-foreground">
														<span className="font-semibold">E-posta: </span>
														<span>{member.email}</span>
													</div>
												)}
												{member.linkedinUrl && (
													<div className="text-p3 text-muted-foreground">
														<span className="font-semibold">LinkedIn: </span>
														<a
															href={member.linkedinUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-primary hover:underline"
														>
															{member.linkedinUrl}
														</a>
													</div>
												)}
											</div>
										);
									})
								) : (
									<div className="text-center py-8 text-p3 text-muted-foreground">
										Takım üyesi bulunamadı
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
						<Button
							variant="outline"
							onClick={() => navigate("/pages")}
							className="min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/pages/edit/${page.id}`)}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							<Edit className="h-4 w-4 mr-2" />
							Düzenle
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

