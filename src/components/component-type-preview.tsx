import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import type { componentTypeRequest, componentTypeResponse } from "@/types/component-type.types";

interface ComponentTypePreviewProps {
	componentType: componentTypeRequest | componentTypeResponse;
	previewData?: {
		title?: string;
		excerpt?: string;
		description?: string;
		image?: string;
		value?: string;
		link?: string;
	};
	compact?: boolean;
}

export function ComponentTypePreview({ 
	componentType, 
	previewData = {},
	compact = false 
}: ComponentTypePreviewProps) {
	const {
		title = "Örnek Başlık",
		excerpt = "Bu bir örnek özet metnidir. Bileşen tipi özet özelliği aktif olduğunda bu alan görünecektir.",
		description = "Bu bir örnek açıklama metnidir. Bileşen tipi açıklama özelliği aktif olduğunda bu alan görünecektir.",
		image,
		value = "123",
		link = "https://example.com"
	} = previewData;

	const photoUrl = typeof componentType.photo === 'string' 
		? componentType.photo 
		: componentType.photo instanceof File
		? URL.createObjectURL(componentType.photo)
		: componentType.photo;

	if (compact) {
		return (
			<div className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
				{componentType.hasTitle && (
					<div className="text-sm font-semibold text-foreground truncate">
						{title}
					</div>
				)}
				{componentType.hasExcerpt && (
					<div className="text-xs text-muted-foreground line-clamp-2">
						{excerpt}
					</div>
				)}
				{componentType.hasImage && (photoUrl || image) && (
					<div className="w-full h-20 rounded overflow-hidden border border-border">
						<img
							src={photoUrl || image}
							alt="Preview"
							className="w-full h-full object-cover"
						/>
					</div>
				)}
			</div>
		);
	}

	return (
		<Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50">
			<CardContent className="p-6 space-y-4">
				{/* Image */}
				{componentType.hasImage && (photoUrl || image) && (
					<div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-border shadow-md">
						<img
							src={photoUrl || image}
							alt={componentType.hasTitle ? title : "Preview"}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</div>
				)}

				{/* Title */}
				{componentType.hasTitle && (
					<div>
						<h3 className="text-2xl font-bold text-foreground">
							{title}
						</h3>
					</div>
				)}

				{/* Excerpt */}
				{componentType.hasExcerpt && (
					<div>
						<p className="text-base text-muted-foreground leading-relaxed">
							{excerpt}
						</p>
					</div>
				)}

				{/* Description */}
				{componentType.hasDescription && (
					<div>
						<p className="text-sm text-foreground leading-relaxed">
							{description}
						</p>
					</div>
				)}

				{/* Value */}
				{componentType.hasValue && (
					<div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
						<div className="text-xs font-semibold text-muted-foreground mb-1">
							Değer
						</div>
						<div className="text-lg font-bold text-primary">
							{value}
						</div>
					</div>
				)}

				{/* Link */}
				{componentType.hasLink && (
					<div className="p-3 rounded-lg bg-muted/50 border border-border">
						<div className="text-xs font-semibold text-muted-foreground mb-1">
							Link
						</div>
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary hover:underline break-all"
						>
							{link}
						</a>
					</div>
				)}

				{/* Assets placeholder */}
				{componentType.hasAssets && (
					<div className="p-3 rounded-lg bg-muted/50 border border-border">
						<div className="text-xs font-semibold text-muted-foreground mb-2">
							Varlıklar
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ImageIcon className="h-4 w-4" />
							<span>Varlık önizlemesi</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

