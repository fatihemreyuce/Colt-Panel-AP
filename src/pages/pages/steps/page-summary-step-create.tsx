import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Box, Users, Image as ImageIcon, File, CheckCircle2 } from "lucide-react";
import type { PageRequest } from "@/types/page.types";
import type { componentResponse } from "@/types/components.types";
import type { TeamMemberResponse } from "@/types/team-members.types";

interface SelectedComponent {
	componentId: number;
	componentTypeId: number;
	component: componentResponse;
}

interface PageSummaryStepCreateProps {
	formData: PageRequest;
	selectedComponents: SelectedComponent[];
	selectedTeamMembers: TeamMemberResponse[];
	filePreview: string | null;
	imagePreview: string | null;
	pageTypeName: string;
}

export function PageSummaryStepCreate({
	formData,
	selectedComponents,
	selectedTeamMembers,
	filePreview,
	imagePreview,
	pageTypeName,
}: PageSummaryStepCreateProps) {
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
							<span className="text-p1 text-foreground">{formData.name}</span>
						</div>
						<div>
							<span className="text-p3 font-semibold text-muted-foreground">Slug: </span>
							<span className="text-p1 text-foreground font-mono">{formData.slug}</span>
						</div>
						<div>
							<span className="text-p3 font-semibold text-muted-foreground">Tip: </span>
							<span className="text-p1 text-foreground">{pageTypeName}</span>
						</div>
						{filePreview && (
							<div className="flex items-center gap-2">
								<File className="h-4 w-4 text-muted-foreground" />
								<span className="text-p3 text-muted-foreground">Dosya: </span>
								<span className="text-p3 text-foreground">Seçildi</span>
							</div>
						)}
						{imagePreview && (
							<div className="flex items-center gap-2">
								<ImageIcon className="h-4 w-4 text-muted-foreground" />
								<span className="text-p3 text-muted-foreground">Görsel: </span>
								<span className="text-p3 text-foreground">Seçildi</span>
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
							{formData.localizations.map((loc, index) => (
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
							Bileşenler ({selectedComponents.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedComponents.length > 0 ? (
							<div className="space-y-2">
								{selectedComponents.map((selectedComponent) => (
									<div key={selectedComponent.componentId} className="flex items-center justify-between">
										<span className="text-p3 text-foreground">
											{selectedComponent.component.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{selectedComponent.component.type}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-p3 text-muted-foreground">Bileşen seçilmemiş</p>
						)}
					</CardContent>
				</Card>

				{/* Team Members */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Takım Üyeleri ({selectedTeamMembers.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedTeamMembers.length > 0 ? (
							<div className="space-y-2">
								{selectedTeamMembers.map((member) => (
									<div key={member.id} className="flex items-center justify-between">
										<span className="text-p3 text-foreground">{member.name}</span>
										<span className="text-xs text-muted-foreground">{member.email}</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-p3 text-muted-foreground">Takım üyesi seçilmemiş</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

