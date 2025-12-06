import { X, FileImage, Upload, File, Languages as LanguagesIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { assetRequest } from "@/types/assets.types";
import type { language } from "@/types/languages.types";

interface AssetFormProps {
	asset: assetRequest & { assetId?: number; mime?: string };
	assetIndex: number;
	languages: language[];
	activeTab: string;
	isTranslating: boolean;
	onTypeChange: (value: string) => void;
	onFileChange: (file: File | null) => void;
	onLocalizationChange: (locIndex: number, field: keyof assetRequest['localizations'][0], value: string) => void;
	onTabChange: (value: string) => void;
	onTranslate: () => void;
	onRemove: () => void;
}

export function AssetForm({
	asset,
	assetIndex,
	languages,
	activeTab,
	isTranslating,
	onTypeChange,
	onFileChange,
	onLocalizationChange,
	onTabChange,
	onTranslate,
	onRemove,
}: AssetFormProps) {
	const isExistingAsset = asset.assetId !== undefined;

	return (
		<div className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-primary/10">
						<FileImage className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h4 className="text-p2 font-semibold text-foreground">
							Medya {assetIndex + 1}
						</h4>
						{isExistingAsset && (
							<p className="text-xs text-muted-foreground mt-0.5">Mevcut medya</p>
						)}
					</div>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onRemove}
					className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
			
			<div className="space-y-4">
				{/* Asset Type */}
				<div className="space-y-2">
					<Label htmlFor={`asset-type-${assetIndex}`} className="text-p3 font-semibold flex items-center gap-2">
						Tip
					</Label>
					<Select
						value={asset.type || ""}
						onValueChange={onTypeChange}
					>
						<SelectTrigger id={`asset-type-${assetIndex}`} className="h-11">
							<SelectValue placeholder="Tip seçiniz" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="IMAGE">IMAGE</SelectItem>
							<SelectItem value="VIDEO">VIDEO</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Asset File */}
				<div className="space-y-2">
					<Label className="text-p3 font-semibold flex items-center gap-2">
						Dosya
					</Label>
					{isExistingAsset && typeof asset.file === 'string' ? (
						<div className="p-4 rounded-lg border border-border bg-muted/30">
							<div className="flex items-center gap-3">
								{asset.file && asset.mime?.startsWith('image/') && (
									<img 
										src={asset.file} 
										alt={asset.type}
										className="w-16 h-16 object-cover rounded border border-border"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = 'none';
										}}
									/>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-muted-foreground mb-1">Mevcut dosya</p>
									<a
										href={asset.file}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-primary hover:underline break-all flex items-center gap-2"
									>
										<File className="h-4 w-4 flex-shrink-0" />
										<span className="truncate">{asset.file}</span>
									</a>
								</div>
							</div>
						</div>
					) : (
						<>
							<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group">
								<div className="flex flex-col items-center justify-center pt-4 pb-3">
									<Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
									<p className="text-sm font-medium text-foreground mb-1">
										Dosya yüklemek için tıklayın
									</p>
									<p className="text-xs text-muted-foreground">
										Resim, video veya dosya yükleyebilirsiniz
									</p>
								</div>
								<input
									type="file"
									className="hidden"
									accept="image/*,video/*,application/*"
									onChange={(e) => onFileChange(e.target.files?.[0] || null)}
								/>
							</label>
							{asset.file && typeof asset.file !== 'string' && (
								<div className="p-3 rounded-lg border border-border bg-muted/30">
									<p className="text-xs font-medium text-muted-foreground mb-1">Seçili dosya</p>
									<p className="text-sm text-foreground flex items-center gap-2">
										<File className="h-4 w-4" />
										{asset.file.name}
									</p>
								</div>
							)}
						</>
					)}
				</div>

				{/* Asset Localizations */}
				<div className="space-y-3 pt-4 border-t border-border">
					<div className="flex items-center justify-between">
						<Label className="text-p3 font-semibold flex items-center gap-2">
							<LanguagesIcon className="h-4 w-4" />
							Çeviriler
						</Label>
						{asset.localizations.length > 0 && activeTab && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={onTranslate}
								disabled={isTranslating}
								className="gap-2 h-8 text-xs"
							>
								<RefreshCw className={`h-3 w-3 ${isTranslating ? "animate-spin" : ""}`} />
								Çeviri Yap
							</Button>
						)}
					</div>
					{asset.localizations.length > 0 && (
						<Tabs 
							value={activeTab || asset.localizations[0]?.languageCode || ""} 
							onValueChange={onTabChange}
							className="w-full"
						>
							<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${asset.localizations.length}, minmax(0, 1fr))` }}>
								{asset.localizations.map((loc, locIndex) => {
									const language = languages.find(l => l.code === loc.languageCode);
									return (
										<TabsTrigger key={locIndex} value={loc.languageCode} className="text-xs">
											{language?.code.toUpperCase() || loc.languageCode}
										</TabsTrigger>
									);
								})}
							</TabsList>
							{asset.localizations.map((loc, locIndex) => (
								<TabsContent key={locIndex} value={loc.languageCode} className="mt-4">
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor={`asset-title-${assetIndex}-${locIndex}`} className="text-p3 font-semibold">
												Başlık
											</Label>
											<Input
												id={`asset-title-${assetIndex}-${locIndex}`}
												value={loc.title}
												onChange={(e) => onLocalizationChange(locIndex, "title", e.target.value)}
												className="h-11"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`asset-description-${assetIndex}-${locIndex}`} className="text-p3 font-semibold">
												Açıklama
											</Label>
											<RichTextEditor
												value={loc.description}
												onChange={(content) => onLocalizationChange(locIndex, "description", content)}
												height={250}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`asset-subdescription-${assetIndex}-${locIndex}`} className="text-p3 font-semibold">
												Alt Açıklama
											</Label>
											<RichTextEditor
												value={loc.subdescription}
												onChange={(content) => onLocalizationChange(locIndex, "subdescription", content)}
												height={250}
											/>
										</div>
									</div>
								</TabsContent>
							))}
						</Tabs>
					)}
				</div>
			</div>
		</div>
	);
}

