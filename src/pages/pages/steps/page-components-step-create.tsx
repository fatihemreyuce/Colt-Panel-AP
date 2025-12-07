import { useState } from "react";
import { useComponents } from "@/hooks/use-components";
import { useComponentTypes } from "@/hooks/use-component-type";
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
import { Plus, Search, Trash2, Box, Layers } from "lucide-react";
import type { componentRequest, componentResponse } from "@/types/components.types";

interface SelectedComponent {
	componentId: number;
	componentTypeId: number;
	component: componentResponse;
}

interface PageComponentsStepCreateProps {
	selectedComponents: SelectedComponent[];
	onComponentsChange: (components: SelectedComponent[]) => void;
}

export function PageComponentsStepCreate({
	selectedComponents,
	onComponentsChange,
}: PageComponentsStepCreateProps) {
	const { data: componentsData } = useComponents("", 0, 1000, "id,ASC");
	const { data: componentTypesData } = useComponentTypes("", 0, 1000, "id,ASC");

	const components = componentsData?.content || [];
	const componentTypes = componentTypesData?.content || [];

	const [searchInput, setSearchInput] = useState("");
	const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
	const [selectedComponentTypeId, setSelectedComponentTypeId] = useState<number>(0);

	const filteredComponents = components.filter((comp) =>
		comp.name.toLowerCase().includes(searchInput.toLowerCase())
	);

	const handleAddComponent = () => {
		if (!selectedComponentId || selectedComponentTypeId === 0) {
			return;
		}

		const component = components.find((c) => c.id === selectedComponentId);
		if (!component) return;

		// Check if already added
		if (selectedComponents.some((sc) => sc.componentId === selectedComponentId)) {
			return;
		}

		const newComponent: SelectedComponent = {
			componentId: selectedComponentId,
			componentTypeId: selectedComponentTypeId,
			component: component,
		};

		onComponentsChange([...selectedComponents, newComponent]);
		setSelectedComponentId(null);
		setSelectedComponentTypeId(0);
	};

	const handleRemoveComponent = (componentId: number) => {
		onComponentsChange(selectedComponents.filter((sc) => sc.componentId !== componentId));
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
						disabled={!selectedComponentId || selectedComponentTypeId === 0}
						className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Plus className="h-4 w-4 mr-2" />
						Bileşen Ekle
					</Button>
				</div>
			</div>

			{/* Selected Components List */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Box className="h-5 w-5" />
						Seçilen Bileşenler ({selectedComponents.length})
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
						{selectedComponents.length > 0 ? (
							selectedComponents.map((selectedComponent) => {
								const componentType = componentTypes.find(
									(ct) => ct.id === selectedComponent.componentTypeId
								);
								return (
									<TableRow
										key={selectedComponent.componentId}
										className="hover:bg-muted/50 transition-colors"
									>
										<TableCell className="font-medium">
											{selectedComponent.component.id}
										</TableCell>
										<TableCell className="font-medium">
											{selectedComponent.component.name}
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
												{componentType?.type || selectedComponent.component.type}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveComponent(selectedComponent.componentId)}
												className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
												title="Kaldır"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-p3 text-muted-foreground">
									Henüz bileşen seçilmemiş
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

