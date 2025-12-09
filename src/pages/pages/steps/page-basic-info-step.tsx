import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Languages, RefreshCw, Upload, X, Image as ImageIcon, File, Link as LinkIcon, FileText } from "lucide-react";
import type { PageRequest, localizations } from "@/types/page.types";
import { translateText } from "@/services/translate-service";
import { toast } from "sonner";

// Slug oluşturma fonksiyonu (Türkçe karakter desteği ile)
const generateSlug = (text: string): string => {
	if (!text) return "";
	
	// Türkçe karakterleri İngilizce karşılıklarına çevir
	const turkishMap: Record<string, string> = {
		'ç': 'c', 'Ç': 'C',
		'ğ': 'g', 'Ğ': 'G',
		'ı': 'i', 'İ': 'I',
		'ö': 'o', 'Ö': 'O',
		'ş': 's', 'Ş': 'S',
		'ü': 'u', 'Ü': 'U'
	};
	
	let slug = text
		.split('')
		.map(char => turkishMap[char] || char)
		.join('')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
		.replace(/\s+/g, '-') // Boşlukları tire ile değiştir
		.replace(/-+/g, '-') // Birden fazla tireyi tek tireye çevir
		.replace(/^-+|-+$/g, ''); // Başta ve sonda tireleri kaldır
	
	return slug;
};

interface PageBasicInfoStepProps {
	formData: PageRequest;
	errors: Record<string, string>;
	pageTypes: { id: number; type: string }[];
	languages: { id: number; code: string }[];
	activeLanguageTab: string;
	isTranslating: boolean;
	filePreview: string | null;
	imagePreview: string | null;
	onFormDataChange: (data: Partial<PageRequest>) => void;
	onLocalizationChange: (index: number, field: keyof localizations, value: string) => void;
	onActiveLanguageTabChange: (tab: string) => void;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemoveFile: () => void;
	onRemoveImage: () => void;
	onTranslate: (sourceLanguageCode: string) => void;
}

export function PageBasicInfoStep({
	formData,
	errors,
	pageTypes,
	languages,
	activeLanguageTab,
	isTranslating,
	filePreview,
	imagePreview,
	onFormDataChange,
	onLocalizationChange,
	onActiveLanguageTabChange,
	onFileChange,
	onImageChange,
	onRemoveFile,
	onRemoveImage,
	onTranslate,
}: PageBasicInfoStepProps) {
	return (
		<div className="space-y-6">
			{/* Basic Fields */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
				{/* Name */}
				<div className="space-y-2">
					<Label htmlFor="name" className="text-p3 font-semibold flex items-center gap-2">
						<FileText className="h-4 w-4 text-muted-foreground" />
						Ad *
					</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => {
							const nameValue = e.target.value;
							// Ad değiştiğinde slug'ı otomatik oluştur
							const autoSlug = generateSlug(nameValue);
							onFormDataChange({ name: nameValue, slug: autoSlug });
						}}
						className={`h-11 ${
							errors.name ? "border-destructive focus-visible:ring-destructive" : ""
						}`}
						placeholder="Sayfa adı giriniz"
					/>
					{errors.name && (
						<p className="text-p3 text-destructive flex items-center gap-1">
							<span>•</span>
							{errors.name}
						</p>
					)}
				</div>

				{/* Slug */}
				<div className="space-y-2">
					<Label htmlFor="slug" className="text-p3 font-semibold flex items-center gap-2">
						<LinkIcon className="h-4 w-4 text-muted-foreground" />
						Slug *
					</Label>
					<Input
						id="slug"
						value={formData.slug}
						onChange={(e) => onFormDataChange({ slug: e.target.value })}
						className={`h-11 font-mono ${
							errors.slug ? "border-destructive focus-visible:ring-destructive" : ""
						}`}
						placeholder="sayfa-slug"
					/>
					{errors.slug && (
						<p className="text-p3 text-destructive flex items-center gap-1">
							<span>•</span>
							{errors.slug}
						</p>
					)}
				</div>
			</div>

			{/* Page Type */}
			<div className="space-y-2">
				<Label htmlFor="typeId" className="text-p3 font-semibold">
					Sayfa Tipi *
				</Label>
				<Select
					value={formData.typeId && formData.typeId !== 0 ? formData.typeId.toString() : ""}
					onValueChange={(value) => {
						if (value) {
							onFormDataChange({ typeId: parseInt(value, 10) });
						} else {
							onFormDataChange({ typeId: 0 });
						}
					}}
				>
					<SelectTrigger
						className={`h-11 ${
							errors.typeId ? "border-destructive focus-visible:ring-destructive" : ""
						}`}
					>
						<SelectValue placeholder="Sayfa tipi seçiniz" />
					</SelectTrigger>
					<SelectContent>
						{pageTypes.map((pageType) => (
							<SelectItem key={pageType.id} value={pageType.id.toString()}>
								{pageType.type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.typeId && (
					<p className="text-p3 text-destructive flex items-center gap-1">
						<span>•</span>
						{errors.typeId}
					</p>
				)}
			</div>

			{/* File Upload */}
			<div className="space-y-2">
				<Label className="text-p3 font-semibold flex items-center gap-2">
					<File className="h-4 w-4 text-muted-foreground" />
					Dosya
				</Label>
				{filePreview || formData.fileAsset ? (
					<div className="flex items-center gap-4">
						<div className="flex-1 border border-border rounded-lg p-4 bg-muted/50">
							{filePreview && filePreview.startsWith("http") ? (
								<div className="flex items-center gap-2">
									<File className="h-5 w-5 text-muted-foreground" />
									<a
										href={filePreview}
										target="_blank"
										rel="noopener noreferrer"
										className="text-p3 text-primary hover:underline"
									>
										Mevcut dosyayı görüntüle
									</a>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<File className="h-5 w-5 text-muted-foreground" />
									<span className="text-p3">
										{formData.fileAsset && typeof formData.fileAsset === "object" && "name" in formData.fileAsset
											? (formData.fileAsset as File).name
											: "Dosya seçildi"}
									</span>
								</div>
							)}
						</div>
						<Button type="button" variant="outline" size="icon" onClick={onRemoveFile}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
						<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
						<Label
							htmlFor="fileAsset"
							className="cursor-pointer text-p3 text-muted-foreground hover:text-foreground"
						>
							Dosya seçmek için tıklayın
						</Label>
						<Input
							id="fileAsset"
							type="file"
							onChange={onFileChange}
							className="hidden"
							accept="*/*"
						/>
					</div>
				)}
				{errors.fileAsset && (
					<p className="text-p3 text-destructive flex items-center gap-1">
						<span>•</span>
						{errors.fileAsset}
					</p>
				)}
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<Label className="text-p3 font-semibold flex items-center gap-2">
					<ImageIcon className="h-4 w-4 text-muted-foreground" />
					Görsel
				</Label>
				{imagePreview || formData.imageAsset ? (
					<div className="flex items-center gap-4">
						<div className="flex-1 border border-border rounded-lg p-4 bg-muted/50">
							{imagePreview ? (
								<img
									src={imagePreview}
									alt="Preview"
									className="h-32 w-auto rounded object-cover"
								/>
							) : (
								<div className="flex items-center gap-2">
									<ImageIcon className="h-5 w-5 text-muted-foreground" />
									<span className="text-p3">
										{formData.imageAsset && typeof formData.imageAsset === "object" && "name" in formData.imageAsset
											? (formData.imageAsset as File).name
											: "Görsel seçildi"}
									</span>
								</div>
							)}
						</div>
						<Button type="button" variant="outline" size="icon" onClick={onRemoveImage}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
						<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
						<Label
							htmlFor="imageAsset"
							className="cursor-pointer text-p3 text-muted-foreground hover:text-foreground"
						>
							Görsel seçmek için tıklayın
						</Label>
						<Input
							id="imageAsset"
							type="file"
							onChange={onImageChange}
							className="hidden"
							accept="image/*"
						/>
					</div>
				)}
				{errors.imageAsset && (
					<p className="text-p3 text-destructive flex items-center gap-1">
						<span>•</span>
						{errors.imageAsset}
					</p>
				)}
			</div>

			{/* Localizations */}
			{formData.localizations.length > 0 && (
				<div className="space-y-4 pt-4 border-t border-border">
					<div className="flex items-center justify-between">
						<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
							<Languages className="h-5 w-5" />
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
					<Tabs
						value={activeLanguageTab}
						onValueChange={onActiveLanguageTabChange}
						className="w-full"
					>
						<TabsList
							className="grid w-full"
							style={{
								gridTemplateColumns: `repeat(${formData.localizations.length}, minmax(0, 1fr))`,
							}}
						>
							{formData.localizations.map((localization, index) => {
								const language = languages.find((l) => l.code === localization.languageCode);
								return (
									<TabsTrigger key={index} value={localization.languageCode}>
										{language?.code.toUpperCase() || localization.languageCode}
									</TabsTrigger>
								);
							})}
						</TabsList>
						{formData.localizations.map((localization, index) => {
							const language = languages.find((l) => l.code === localization.languageCode);
							return (
								<TabsContent key={index} value={localization.languageCode} className="mt-4">
									<div className="space-y-4">
										<div className="space-y-2">
											<Label className="text-p3 font-semibold">Başlık *</Label>
											<Input
												value={localization.title}
												onChange={(e) => onLocalizationChange(index, "title", e.target.value)}
												className="h-11"
												placeholder={`${language?.code.toUpperCase() || localization.languageCode} başlığını girin`}
											/>
											{errors[`localizations.${index}.title`] && (
												<p className="text-p3 text-destructive">
													{errors[`localizations.${index}.title`]}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label className="text-p3 font-semibold">Özet</Label>
											<Textarea
												value={localization.excerpt}
												onChange={(e) => onLocalizationChange(index, "excerpt", e.target.value)}
												className="min-h-[100px]"
												placeholder={`${language?.code.toUpperCase() || localization.languageCode} özetini girin`}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-p3 font-semibold">İçerik *</Label>
											<RichTextEditor
												value={localization.content}
												onChange={(content) => onLocalizationChange(index, "content", content)}
												placeholder={`${language?.code.toUpperCase() || localization.languageCode} içeriğini girin`}
												height={400}
											/>
											{errors[`localizations.${index}.content`] && (
												<p className="text-p3 text-destructive">
													{errors[`localizations.${index}.content`]}
												</p>
											)}
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label className="text-p3 font-semibold">Meta Başlık</Label>
												<Input
													value={localization.metaTitle}
													onChange={(e) => onLocalizationChange(index, "metaTitle", e.target.value)}
													className="h-11"
													placeholder="Meta başlık"
												/>
											</div>
											<div className="space-y-2">
												<Label className="text-p3 font-semibold">Meta Anahtar Kelimeler</Label>
												<Input
													value={localization.metaKeywords}
													onChange={(e) => onLocalizationChange(index, "metaKeywords", e.target.value)}
													className="h-11"
													placeholder="Anahtar kelimeler (virgülle ayırın)"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label className="text-p3 font-semibold">Meta Açıklama</Label>
											<Textarea
												value={localization.metaDescription}
												onChange={(e) => onLocalizationChange(index, "metaDescription", e.target.value)}
												className="min-h-[100px]"
												placeholder="Meta açıklama"
											/>
										</div>
									</div>
								</TabsContent>
							);
						})}
					</Tabs>
				</div>
			)}
		</div>
	);
}

