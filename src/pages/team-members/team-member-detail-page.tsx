import { useParams, useNavigate } from "react-router-dom";
import { useGetTeamMemberById } from "@/hooks/use-team-members";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, User, Mail, Linkedin, Image as ImageIcon, Loader2, Users } from "lucide-react";

export default function TeamMemberDetailPage() {
	const { id } = useParams<{ id: string }>();
	const teamMemberId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: teamMember, isLoading } = useGetTeamMemberById(teamMemberId);

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!teamMember) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Takım üyesi bulunamadı</p>
					<Button
						onClick={() => navigate("/team-members")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Takım Üyeleri Listesine Dön
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
						onClick={() => navigate("/team-members")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Takım Üyesi Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Takım üyesi bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/team-members/edit/${teamMember.id}`)}
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
						<User className="h-5 w-5 text-muted-foreground" />
						Takım Üyesi Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Takım üyesi detay bilgileri</p>
				</div>

				{/* Info Content */}
				<div className="p-6 space-y-6">
					{/* Photo and Basic Info */}
					<div className="flex items-start gap-6">
						{teamMember.photo ? (
							<img
								src={teamMember.photo}
								alt={teamMember.name}
								className="h-32 w-32 rounded-full object-cover border-4 border-border shadow-lg"
							/>
						) : (
							<div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
								<Users className="h-16 w-16 text-gray-400" />
							</div>
						)}
						<div className="flex-1 space-y-4">
							<div>
								<h3 className="text-h4 font-bold text-gray-900 dark:text-gray-100 mb-2">
									{teamMember.name}
								</h3>
							</div>
						</div>
					</div>

					{/* Info Grid */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* ID */}
						<div className="space-y-2 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
							<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
								<User className="h-4 w-4 text-muted-foreground" />
								Takım Üyesi ID
							</div>
							<div className="text-h5 font-bold text-gray-900 dark:text-gray-100">
								{teamMember.id}
							</div>
						</div>

						{/* Email */}
						<div className="space-y-2 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
							<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
								<Mail className="h-4 w-4 text-muted-foreground" />
								E-posta
							</div>
							<div className="text-p1 font-semibold text-gray-900 dark:text-gray-100 break-all">
								{teamMember.email}
							</div>
						</div>

						{/* LinkedIn */}
						<div className="space-y-2 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
							<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
								<Linkedin className="h-4 w-4 text-muted-foreground" />
								LinkedIn
							</div>
							<div className="text-p1 font-semibold text-gray-900 dark:text-gray-100">
								{teamMember.linkedinUrl ? (
									<a
										href={teamMember.linkedinUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										{teamMember.linkedinUrl}
									</a>
								) : (
									<span className="text-gray-400">-</span>
								)}
							</div>
						</div>
					</div>

					{/* Localizations */}
					{teamMember.localizations && teamMember.localizations.length > 0 && (
						<div className="space-y-4">
							<h3 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
								<ImageIcon className="h-5 w-5 text-muted-foreground" />
								Diller
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{teamMember.localizations.map((localization, index) => (
									<div
										key={index}
										className="p-4 rounded-lg border border-border bg-muted/50 space-y-3"
									>
										<div className="flex items-center gap-2">
											<span className="text-p3 font-semibold text-brand-green dark:text-brand-green">
												{localization.languageCode.toUpperCase()}
											</span>
										</div>
										<div>
											<p className="text-p3 text-gray-600 dark:text-gray-400 mb-1">Başlık</p>
											<p className="text-p2 font-semibold text-gray-900 dark:text-gray-100">
												{localization.title}
											</p>
										</div>
										<div>
											<p className="text-p3 text-gray-600 dark:text-gray-400 mb-1">Açıklama</p>
											<p className="text-p3 text-gray-900 dark:text-gray-100">
												{localization.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-green-200/50 dark:border-gray-600/50">
						<Button
							variant="outline"
							onClick={() => navigate("/team-members")}
							className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
						>
							Geri Dön
						</Button>
						<Button
							onClick={() => navigate(`/team-members/edit/${teamMember.id}`)}
							className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/20 min-w-[120px] text-p3 font-semibold"
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

