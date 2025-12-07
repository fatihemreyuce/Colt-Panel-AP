import { useGetPage } from "@/hooks/use-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Box, Users, Image as ImageIcon, File, CheckCircle2 } from "lucide-react";

interface PageSummaryStepProps {
	pageId: number;
}

export function PageSummaryStep({ pageId }: PageSummaryStepProps) {
	const { data: page, isLoading } = useGetPage(pageId);

	if (isLoading || !page) {
		return (
			<div className="text-center py-12">
				<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
				<div className="flex items-center gap-3">
					<CheckCircle2 className="h-6 w-6 text-primary" />
					<div>
						<h3 className="text-h5 font-semibold text-foreground">Sayfa Hazır!</h3>
						<p className="text-p3 text-muted-foreground mt-1">
							Tüm bilgileri kontrol edin ve kaydet butonuna basın.
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Temel Bilgiler
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<span className="text-p3 font-semibold text-muted-foreground">Ad: </span>
							<span className="text-p1 text-foreground">{page.name}</span>
						</div>
						<div>
							<span className="text-p3 font-semibold text-muted-foreground">Slug: </span>
							<span className="text-p1 text-foreground font-mono">{page.slug}</span>
						</div>
						<div>
							<span className="text-p3 font-semibold text-muted-foreground">Tip: </span>
							<span className="text-p1 text-foreground">{page.type}</span>
						</div>
						{page.file && (
							<div className="flex items-center gap-2">
								<File className="h-4 w-4 text-muted-foreground" />
								<span className="text-p3 text-muted-foreground">Dosya: </span>
								<a
									href={page.file.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-p3 text-primary hover:underline"
								>
									Görüntüle
								</a>
							</div>
						)}
						{page.image && (
							<div className="flex items-center gap-2">
								<ImageIcon className="h-4 w-4 text-muted-foreground" />
								<span className="text-p3 text-muted-foreground">Görsel: </span>
								<span className="text-p3 text-foreground">Yüklendi</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Localizations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Çeviriler
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{page.localizations.map((loc, index) => (
								<div key={index} className="flex items-center justify-between">
									<span className="text-p3 font-semibold uppercase">{loc.languageCode}</span>
									<span className="text-p3 text-muted-foreground">
										{loc.title ? "✓" : "✗"}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Components */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Box className="h-5 w-5" />
							Bileşenler ({page.components?.length || 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{page.components && page.components.length > 0 ? (
							<div className="space-y-2">
								{page.components.map((item) => {
									const component = item.component;
									return (
										<div key={component.id} className="flex items-center justify-between">
											<span className="text-p3 text-foreground">{component.name}</span>
											<span className="text-xs text-muted-foreground">{component.type}</span>
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-p3 text-muted-foreground">Bileşen eklenmemiş</p>
						)}
					</CardContent>
				</Card>

				{/* Team Members */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Takım Üyeleri ({page.teamMembers?.length || 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{page.teamMembers && page.teamMembers.length > 0 ? (
							<div className="space-y-2">
								{page.teamMembers.map((item) => {
									const member = item.teamMember;
									return (
										<div key={member.id} className="flex items-center justify-between">
											<span className="text-p3 text-foreground">{member.name}</span>
											<span className="text-xs text-muted-foreground">{member.email}</span>
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-p3 text-muted-foreground">Takım üyesi eklenmemiş</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

