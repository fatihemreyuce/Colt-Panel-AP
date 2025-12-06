import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateComponentType, useGetComponentTypeById } from "@/hooks/use-component-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Layers, Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import type { componentTypeRequest } from "@/types/component-type.types";

export default function ComponentTypeEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const componentTypeId = id ? parseInt(id) : 0;
	const { data: componentType, isLoading } = useGetComponentTypeById(componentTypeId);
	const updateComponentTypeMutation = useUpdateComponentType();
	const [formData, setFormData] = useState<componentTypeRequest>({
		type: "",
		hasTitle: false,
		hasExcerpt: false,
		hasDescription: false,
		hasImage: false,
		hasValue: false,
		hasAssets: false,
		hasLink: false,
		photo: undefined,
	});
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (componentType) {
			setFormData({
				type: componentType.type,
				hasTitle: componentType.hasTitle,
				hasExcerpt: componentType.hasExcerpt,
				hasDescription: componentType.hasDescription,
				hasImage: componentType.hasImage,
				hasValue: componentType.hasValue,
				hasAssets: componentType.hasAssets,
				hasLink: componentType.hasLink,
				photo: componentType.photo,
			});
			if (componentType.photo) {
				setPreviewImage(componentType.photo);
			}
		}
	}, [componentType]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.type.trim()) {
			newErrors.type = "Tip adı gereklidir";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, photo: file });
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setFormData({ ...formData, photo: undefined });
		setPreviewImage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			try {
				await updateComponentTypeMutation.mutateAsync({
					id: componentTypeId,
					componentType: formData,
				});
				navigate("/component-types");
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	if (isLoading) {
		return (
			<div className="w-full py-6 px-6">
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-p3 text-muted-foreground">Yükleniyor...</p>
				</div>
			</div>
		);
	}

	if (!componentType) {
		return (
			<div className="w-full py-6 px-6">
				<div className="text-center py-12">
					<p className="text-p3 text-muted-foreground mb-4">Bileşen tipi bulunamadı</p>
					<Button
						onClick={() => navigate("/component-types")}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Geri Dön
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-6 space-y-6">
			{/* Header */}
			<div className="flex h-16 items-center gap-4 border-b border-border px-6 -mx-6 mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/component-types")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-h2 font-semibold text-foreground">
						Bileşen Tipi Düzenle
					</h1>
					<p className="text-p3 text-muted-foreground mt-1">Bileşen tipi bilgilerini güncelleyin</p>
				</div>
			</div>
			
			{/* Form Container */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				{/* Form Header */}
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h2 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Layers className="h-5 w-5 text-muted-foreground" />
						Bileşen Tipi Bilgileri
					</h2>
					<p className="text-p3 text-muted-foreground mt-1">Bileşen tipi bilgilerini güncelleyin</p>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Type Field */}
					<div className="space-y-2">
						<Label htmlFor="type" className="text-p3 font-semibold flex items-center gap-2">
							<Layers className="h-4 w-4 text-muted-foreground" />
							Tip Adı
						</Label>
						<Input
							id="type"
							value={formData.type}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
							className={`h-11 ${
								errors.type ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							placeholder="Bileşen tipi adı giriniz"
						/>
						{errors.type && (
							<p className="text-p3 text-destructive flex items-center gap-1">
								<span>•</span>
								{errors.type}
							</p>
						)}
					</div>

					{/* Photo Upload */}
					<div className="space-y-2">
						<Label className="text-p3 font-semibold flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
							Fotoğraf
						</Label>
						{previewImage ? (
							<div className="relative inline-block">
								<img
									src={previewImage}
									alt="Preview"
									className="h-32 w-32 rounded-lg object-cover border border-border"
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									onClick={handleRemoveImage}
									className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						) : (
							<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-8 w-8 text-muted-foreground mb-2" />
									<p className="text-p3 text-muted-foreground">
										<span className="font-semibold">Fotoğraf yüklemek için tıklayın</span> veya sürükleyip bırakın
									</p>
									<p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF (MAX. 10MB)</p>
								</div>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleImageChange}
								/>
							</label>
						)}
						{previewImage && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									const input = document.createElement("input");
									input.type = "file";
									input.accept = "image/*";
									input.onchange = (e) => {
										const target = e.target as HTMLInputElement;
										handleImageChange({ target } as React.ChangeEvent<HTMLInputElement>);
									};
									input.click();
								}}
								className="mt-2"
							>
								<Upload className="h-4 w-4 mr-2" />
								Fotoğrafı Değiştir
							</Button>
						)}
					</div>

					{/* Features Section */}
					<div className="space-y-4 pt-4 border-t border-border">
						<h3 className="text-h5 font-semibold text-foreground">Özellikler</h3>
						<div className="grid gap-4 md:grid-cols-2">
							{/* Has Title */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasTitle" className="text-p3 font-semibold cursor-pointer">
										Başlık
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi başlık içerebilir</p>
								</div>
								<Switch
									id="hasTitle"
									checked={formData.hasTitle}
									onCheckedChange={(checked) => setFormData({ ...formData, hasTitle: checked })}
								/>
							</div>

							{/* Has Excerpt */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasExcerpt" className="text-p3 font-semibold cursor-pointer">
										Özet
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi özet içerebilir</p>
								</div>
								<Switch
									id="hasExcerpt"
									checked={formData.hasExcerpt}
									onCheckedChange={(checked) => setFormData({ ...formData, hasExcerpt: checked })}
								/>
							</div>

							{/* Has Description */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasDescription" className="text-p3 font-semibold cursor-pointer">
										Açıklama
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi açıklama içerebilir</p>
								</div>
								<Switch
									id="hasDescription"
									checked={formData.hasDescription}
									onCheckedChange={(checked) => setFormData({ ...formData, hasDescription: checked })}
								/>
							</div>

							{/* Has Image */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasImage" className="text-p3 font-semibold cursor-pointer">
										Resim
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi resim içerebilir</p>
								</div>
								<Switch
									id="hasImage"
									checked={formData.hasImage}
									onCheckedChange={(checked) => setFormData({ ...formData, hasImage: checked })}
								/>
							</div>

							{/* Has Value */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasValue" className="text-p3 font-semibold cursor-pointer">
										Değer
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi değer içerebilir</p>
								</div>
								<Switch
									id="hasValue"
									checked={formData.hasValue}
									onCheckedChange={(checked) => setFormData({ ...formData, hasValue: checked })}
								/>
							</div>

							{/* Has Assets */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasAssets" className="text-p3 font-semibold cursor-pointer">
										Varlıklar
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi varlık içerebilir</p>
								</div>
								<Switch
									id="hasAssets"
									checked={formData.hasAssets}
									onCheckedChange={(checked) => setFormData({ ...formData, hasAssets: checked })}
								/>
							</div>

							{/* Has Link */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
								<div className="space-y-0.5">
									<Label htmlFor="hasLink" className="text-p3 font-semibold cursor-pointer">
										Link
									</Label>
									<p className="text-xs text-muted-foreground">Bileşen tipi link içerebilir</p>
								</div>
								<Switch
									id="hasLink"
									checked={formData.hasLink}
									onCheckedChange={(checked) => setFormData({ ...formData, hasLink: checked })}
								/>
							</div>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/component-types")}
							className="min-w-[100px]"
						>
							İptal
						</Button>
						<Button
							type="submit"
							disabled={updateComponentTypeMutation.isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
						>
							{updateComponentTypeMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Güncelleniyor...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Güncelle
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

