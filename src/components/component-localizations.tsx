import { Languages as LanguagesIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { localization } from "@/types/components.types";
import type { language } from "@/types/languages.types";

interface ComponentLocalizationsProps {
	localizations: localization[];
	languages: language[];
	activeLanguageTab: string;
	isTranslating: boolean;
	onTabChange: (value: string) => void;
	onLocalizationChange: (index: number, field: keyof localization, value: string) => void;
	onTranslate: (languageCode: string) => void;
}

export function ComponentLocalizations({
	localizations,
	languages,
	activeLanguageTab,
	isTranslating,
	onTabChange,
	onLocalizationChange,
	onTranslate,
}: ComponentLocalizationsProps) {
	return (
		<div className="space-y-4 pt-4 border-t border-border">
			<div className="flex items-center justify-between">
				<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
					<LanguagesIcon className="h-5 w-5" />
					Çeviriler
				</h3>
				{activeLanguageTab && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onTranslate(activeLanguageTab)}
						disabled={isTranslating}
						className="gap-2"
					>
						<RefreshCw className={`h-4 w-4 ${isTranslating ? "animate-spin" : ""}`} />
						Diğer Dilleri Çevir
					</Button>
				)}
			</div>
			{localizations.length > 0 && (
				<Tabs value={activeLanguageTab} onValueChange={onTabChange} className="w-full">
					<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${localizations.length}, minmax(0, 1fr))` }}>
						{localizations.map((localization, index) => {
							const language = languages.find(l => l.code === localization.languageCode);
							return (
								<TabsTrigger key={index} value={localization.languageCode}>
									{language?.code.toUpperCase() || localization.languageCode}
								</TabsTrigger>
							);
						})}
					</TabsList>
					{localizations.map((localization, index) => {
						const language = languages.find(l => l.code === localization.languageCode);
						return (
							<TabsContent key={index} value={localization.languageCode} className="mt-4">
								<div className="space-y-3">
									<div className="space-y-2">
										<Label className="text-p3 font-semibold">Başlık *</Label>
										<Input
											value={localization.title}
											onChange={(e) => onLocalizationChange(index, "title", e.target.value)}
											className="h-11"
											placeholder={`${language?.code.toUpperCase() || localization.languageCode} başlığını girin`}
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-p3 font-semibold">Özet</Label>
										<Input
											value={localization.excerpt}
											onChange={(e) => onLocalizationChange(index, "excerpt", e.target.value)}
											className="h-11"
											placeholder={`${language?.code.toUpperCase() || localization.languageCode} özetini girin`}
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-p3 font-semibold">Açıklama *</Label>
										<RichTextEditor
											value={localization.description}
											onChange={(content) => onLocalizationChange(index, "description", content)}
											placeholder={`${language?.code.toUpperCase() || localization.languageCode} açıklamasını girin`}
											height={400}
										/>
									</div>
								</div>
							</TabsContent>
						);
					})}
				</Tabs>
			)}
		</div>
	);
}

