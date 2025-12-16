import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { assetResponse } from "@/types/assets.types";

interface AssetSelectorProps {
	availableAssets: assetResponse[];
	selectedMediaId: string;
	addedAssetIds: (number | undefined)[];
	componentTypeId?: number;
	onSelect: (value: string) => void;
}

export function AssetSelector({
	availableAssets,
	selectedMediaId,
	addedAssetIds,
	componentTypeId,
	onSelect,
}: AssetSelectorProps) {
	// componentTypeId şu an filtrelemede kullanılmıyor, sadece gelecekteki geliştirmeler için tutuluyor
	void componentTypeId;
	// Tüm asset'leri göster, component type'a göre filtreleme yapma
	// Component type seçilmiş olsa bile tüm mevcut asset'ler gösterilsin
	return (
		<div className="flex items-center gap-2">
			<Label className="text-p3 font-medium text-muted-foreground">Mevcut Medya Seç</Label>
			<Select value={selectedMediaId} onValueChange={onSelect}>
				<SelectTrigger className="w-[220px] h-10">
					<SelectValue placeholder="Medya seçiniz" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="new">
						<div className="flex items-center gap-2">
							<Plus className="h-4 w-4 text-primary" />
							<span className="font-medium">Yeni Medya Ekle</span>
						</div>
					</SelectItem>
					{availableAssets.length > 0 && (
						<>
							{availableAssets.map((asset) => {
								const defaultTitle = asset.localizations[0]?.title || asset.type || `Medya ${asset.id}`;
								const isAlreadyAdded = addedAssetIds.includes(asset.id);
								return (
									<SelectItem 
										key={asset.id} 
										value={asset.id.toString()}
										disabled={isAlreadyAdded}
									>
										<div className="flex items-center gap-2">
											{asset.url && asset.mime?.startsWith('image/') && (
												<img 
													src={asset.url} 
													alt={defaultTitle}
													className="w-8 h-8 object-cover rounded border border-border"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.style.display = 'none';
													}}
												/>
											)}
											<span className={isAlreadyAdded ? "text-muted-foreground line-through" : ""}>
												{defaultTitle}
											</span>
											{isAlreadyAdded && (
												<span className="text-xs text-muted-foreground">(Ekli)</span>
											)}
										</div>
									</SelectItem>
								);
							})}
						</>
					)}
				</SelectContent>
			</Select>
		</div>
	);
}

