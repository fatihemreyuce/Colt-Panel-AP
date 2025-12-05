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
			<div className="flex h-20 items-center justify-between border-b border-green-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-gray-800/50 dark:to-gray-800/30 px-6 -mx-6 rounded-b-lg">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/languages")}
						className="hover:bg-green-50 dark:hover:bg-gray-700/50"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-h2 font-display bg-gradient-to-r from-brand-green to-green-600 dark:from-brand-green dark:to-green-400 bg-clip-text text-transparent">
							Dil Detayları
						</h1>
						<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Dil bilgilerini görüntüleyin</p>
					</div>
				</div>
				<Button
					onClick={() => navigate(`/languages/edit/${language.id}`)}
					className="bg-gradient-to-r from-brand-green to-green-600 hover:from-green-600 hover:to-green-700 dark:from-brand-green dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-brand-green/30 dark:shadow-brand-green/30 text-p3 font-semibold"
				>
					<Edit className="h-4 w-4 mr-2" />
					Düzenle
				</Button>
			</div>
			
			{/* Info Container */}
			<div className="rounded-lg border border-green-200/50 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/95 shadow-sm dark:shadow-xl dark:shadow-black/20">
					{/* Info Header */}
					<div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border-b border-green-200/50 dark:border-gray-600/50 px-6 py-4">
						<h2 className="text-h5 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
							<LanguagesIcon className="h-5 w-5 text-brand-green dark:text-brand-green" />
							Dil Bilgileri
						</h2>
						<p className="text-p3 text-gray-600 dark:text-gray-300 mt-1">Dil detay bilgileri</p>
					</div>

					{/* Info Content */}
					<div className="p-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* ID */}
							<div className="space-y-2 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
								<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
									<LanguagesIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
									Dil ID
								</div>
								<div className="text-h5 font-bold text-gray-900 dark:text-gray-100">
									{language.id}
								</div>
							</div>

							{/* Code */}
							<div className="space-y-2 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50">
								<div className="flex items-center gap-2 text-p3 font-semibold text-gray-500 dark:text-gray-400">
									<LanguagesIcon className="h-4 w-4 text-brand-green dark:text-brand-green" />
									Dil Kodu
								</div>
								<div className="text-h5 font-bold text-gray-900 dark:text-gray-100 uppercase">
									{language.code}
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-green-200/50 dark:border-gray-600/50">
							<Button
								variant="outline"
								onClick={() => navigate("/languages")}
								className="border-green-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600/50 min-w-[100px]"
							>
								Geri Dön
							</Button>
							<Button
								onClick={() => navigate(`/languages/edit/${language.id}`)}
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

