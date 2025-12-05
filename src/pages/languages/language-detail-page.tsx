import { useParams, useNavigate } from "react-router-dom";
import { useGetLanguageById } from "@/hooks/use-languages";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Languages as LanguagesIcon, Loader2 } from "lucide-react";

export default function LanguageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const languageId = id ? parseInt(id) : 0;
	const navigate = useNavigate();
	const { data: language, isLoading } = useGetLanguageById(languageId);

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-brand-green dark:text-brand-green" />
					<p className="text-p3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!language) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-gray-500 dark:text-gray-400 mb-4">Dil bulunamadı</p>
					<Button
						onClick={() => navigate("/languages")}
						className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 text-white text-p3 font-semibold"
					>
						Diller Listesine Dön
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
						onClick={() => navigate("/languages")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-semibold text-foreground">
							Dil Detayları
						</h1>
						<p className="text-p3 text-muted-foreground mt-1">Dil bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/languages/edit/${language.id}`)}
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
							<LanguagesIcon className="h-5 w-5 text-muted-foreground" />
							Dil Bilgileri
						</h2>
						<p className="text-p3 text-muted-foreground mt-1">Dil detay bilgileri</p>
					</div>

					{/* Info Content */}
					<div className="p-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* ID */}
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
									<LanguagesIcon className="h-4 w-4" />
									Dil ID
								</div>
								<div className="text-h5 font-bold text-foreground">
									{language.id}
								</div>
							</div>

							{/* Code */}
							<div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
								<div className="flex items-center gap-2 text-p3 font-semibold text-muted-foreground">
									<LanguagesIcon className="h-4 w-4" />
									Dil Kodu
								</div>
								<div className="text-h5 font-bold text-foreground uppercase">
									{language.code}
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
							<Button
								variant="outline"
								onClick={() => navigate("/languages")}
								className="min-w-[100px]"
							>
								Geri Dön
							</Button>
							<Button
								onClick={() => navigate(`/languages/edit/${language.id}`)}
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

