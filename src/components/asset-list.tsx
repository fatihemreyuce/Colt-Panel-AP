import { FileImage } from "lucide-react";
import { AssetSelector } from "./asset-selector";
import { AssetForm } from "./asset-form";
import type { assetRequest, assetResponse } from "@/types/assets.types";
import type { language } from "@/types/languages.types";

interface AssetListProps {
	assets: (assetRequest & { assetId?: number; mime?: string })[];
	availableAssets: assetResponse[];
	languages: language[];
	selectedMediaId: string;
	assetActiveTabs: Record<number, string>;
	isTranslatingAsset: Record<number, boolean>;
	componentTypeId?: number;
	onSelectMedia: (value: string) => void;
	onAddAsset: (assetId?: string) => void;
	onRemoveAsset: (index: number) => void;
	onAssetTypeChange: (assetIndex: number, value: string) => void;
	onAssetFileChange: (assetIndex: number, file: File | null) => void;
	onAssetLocalizationChange: (assetIndex: number, locIndex: number, field: keyof assetRequest['localizations'][0], value: string) => void;
	onAssetTabChange: (assetIndex: number, value: string) => void;
	onAssetTranslate: (assetIndex: number, languageCode: string) => void;
}

export function AssetList({
	assets,
	availableAssets,
	languages,
	selectedMediaId,
	assetActiveTabs,
	isTranslatingAsset,
	componentTypeId,
	onSelectMedia,
	onAddAsset,
	onRemoveAsset,
	onAssetTypeChange,
	onAssetFileChange,
	onAssetLocalizationChange,
	onAssetTabChange,
	onAssetTranslate,
}: AssetListProps) {
	return (
		<div className="space-y-6 pt-6 border-t border-border">
			<div className="flex items-center justify-between">
				<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
					<FileImage className="h-5 w-5 text-primary" />
					Medya
				</h3>
				<AssetSelector
					availableAssets={availableAssets}
					selectedMediaId={selectedMediaId}
					addedAssetIds={assets.map(a => a.assetId)}
					componentTypeId={componentTypeId}
					onSelect={(value) => {
						if (value === "new") {
							onAddAsset();
							onSelectMedia("");
						} else if (value) {
							onAddAsset(value);
							onSelectMedia("");
						}
					}}
				/>
			</div>

			{assets.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
					<FileImage className="h-12 w-12 text-muted-foreground mb-3" />
					<p className="text-sm font-medium text-muted-foreground text-center">
						Henüz medya eklenmedi
					</p>
					<p className="text-xs text-muted-foreground text-center mt-1">
						Yukarıdaki dropdown'dan mevcut medya seçebilir veya yeni medya ekleyebilirsiniz
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{assets.map((asset, assetIndex) => (
						<AssetForm
							key={assetIndex}
							asset={asset}
							assetIndex={assetIndex}
							languages={languages}
							activeTab={assetActiveTabs[assetIndex] || asset.localizations[0]?.languageCode || ""}
							isTranslating={isTranslatingAsset[assetIndex] || false}
							onTypeChange={(value) => onAssetTypeChange(assetIndex, value)}
							onFileChange={(file) => onAssetFileChange(assetIndex, file)}
							onLocalizationChange={(locIndex, field, value) => onAssetLocalizationChange(assetIndex, locIndex, field, value)}
							onTabChange={(value) => onAssetTabChange(assetIndex, value)}
							onTranslate={() => onAssetTranslate(assetIndex, assetActiveTabs[assetIndex])}
							onRemove={() => onRemoveAsset(assetIndex)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

