import { useState } from "react";
import { useComponents } from "@/hooks/use-components";
import { useComponentTypes } from "@/hooks/use-component-type";
import { useCreatePageComponent, useDeletePageComponent } from "@/hooks/use-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Plus, Search, Trash2, X, Loader2, Box, Layers } from "lucide-react";
import type { componentRequest, componentResponse } from "@/types/components.types";
import { useGetPage } from "@/hooks/use-page";
import { useParams } from "react-router-dom";

interface PageComponentsStepProps {
	pageId: number;
}

export function PageComponentsStep({ pageId }: PageComponentsStepProps) {
	const { data: page } = useGetPage(pageId);
	const { data: componentsData } = useComponents("", 0, 1000, "id,ASC");
	const { data: componentTypesData } = useComponentTypes("", 0, 1000, "id,ASC");
	const createPageComponentMutation = useCreatePageComponent();
	const deletePageComponentMutation = useDeletePageComponent();

	const components = componentsData?.content || [];
	const componentTypes = componentTypesData?.content || [];
	const pageComponents = page?.components?.map((item) => item.component) || [];

	const [searchInput, setSearchInput] = useState("");
	const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
	const [selectedComponentTypeId, setSelectedComponentTypeId] = useState<number>(0);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [componentToDelete, setComponentToDelete] = useState<number | null>(null);

	const filteredComponents = components.filter((comp) =>
		comp.name.toLowerCase().includes(searchInput.toLowerCase())
	);

	const handleAddComponent = async () => {
		if (!selectedComponentId || selectedComponentTypeId === 0) {
			return;
		}

		const component = components.find((c) => c.id === selectedComponentId);
		if (!component) return;

		// Backend expects { componentId: number } for existing components
		// Using type assertion to maintain hook/service/types structure
		try {
			await createPageComponentMutation.mutateAsync({
				id: pageId,
				component: { componentId: component.id } as componentRequest,
			});
			setSelectedComponentId(null);
			setSelectedComponentTypeId(0);
		} catch (error) {
			// Error handled by mutation
		}
	};

	const handleDeleteComponent = async () => {
		if (componentToDelete) {
			try {
				await deletePageComponentMutation.mutateAsync({
					id: pageId,
					componentId: componentToDelete,
				});
				setDeleteModalOpen(false);
				setComponentToDelete(null);
			} catch (error) {
				// Error handled by mutation
			}
		}
	};

	const handleOpenDeleteModal = (componentId: number) => {
		setComponentToDelete(componentId);
		setDeleteModalOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Add Component Section */}
			<div className="rounded-lg border border-border p-6 bg-muted/50">
				<h3 className="text-h5 font-semibold text-foreground mb-4 flex items-center gap-2">
					<Plus className="h-5 w-5" />
					Bileşen Ekle
				</h3>
				<div className="space-y-4">
					{/* Component Search */}
					<div className="space-y-2">
						<Label className="text-p3 font-semibold">Bileşen Ara</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Bileşen ara..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Component Selection */}
					<div className="space-y-2">
						<Label className="text-p3 font-semibold">Bileşen Seç</Label>
						<Select
							value={selectedComponentId?.toString() || ""}
							onValueChange={(value) => setSelectedComponentId(parseInt(value, 10))}
						>
							<SelectTrigger className="h-11">
								<SelectValue placeholder="Bileşen seçiniz" />
							</SelectTrigger>
							<SelectContent>
								{filteredComponents.map((component) => (
									<SelectItem key={component.id} value={component.id.toString()}>
										{component.name} ({component.type})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Component Type Selection */}
					<div className="space-y-2">
						<Label className="text-p3 font-semibold flex items-center gap-2">
							<Layers className="h-4 w-4 text-muted-foreground" />
							Bileşen Tipi *
						</Label>
						<Select
							value={selectedComponentTypeId && selectedComponentTypeId !== 0 ? selectedComponentTypeId.toString() : undefined}
							onValueChange={(value) => setSelectedComponentTypeId(parseInt(value, 10))}
						>
							<SelectTrigger className="h-11">
								<SelectValue placeholder="Bileşen tipi seçiniz" />
							</SelectTrigger>
							<SelectContent>
								{componentTypes.map((type) => (
									<SelectItem key={type.id} value={type.id.toString()}>
										{type.type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button
						onClick={handleAddComponent}
						disabled={!selectedComponentId || selectedComponentTypeId === 0 || createPageComponentMutation.isPending}
						className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{createPageComponentMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Ekleniyor...
							</>
						) : (
							<>
								<Plus className="h-4 w-4 mr-2" />
								Bileşen Ekle
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Page Components List */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Box className="h-5 w-5" />
						Sayfa Bileşenleri ({pageComponents.length})
					</h3>
				</div>
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead>ID</TableHead>
							<TableHead>Ad</TableHead>
							<TableHead>Tip</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pageComponents.length > 0 ? (
							pageComponents.map((component) => (
								<TableRow key={component.id} className="hover:bg-muted/50 transition-colors">
									<TableCell className="font-medium">{component.id}</TableCell>
									<TableCell className="font-medium">{component.name}</TableCell>
									<TableCell>
										<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
											{component.type}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleOpenDeleteModal(component.id)}
											className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
											title="Sil"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-p3 text-muted-foreground">
									Henüz bileşen eklenmemiş
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onConfirm={handleDeleteComponent}
				onCancel={() => {
					setDeleteModalOpen(false);
					setComponentToDelete(null);
				}}
				title="Bileşeni Sil"
				description="Bu bileşeni sayfadan silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
				confirmationText=""
				confirmText="Sil"
				cancelText="İptal"
				loading={deletePageComponentMutation.isPending}
			/>
		</div>
	);
}

