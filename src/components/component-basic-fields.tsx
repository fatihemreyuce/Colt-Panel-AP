import { Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { componentType } from "@/types/component-type.types";

interface ComponentBasicFieldsProps {
	name: string;
	typeId: number;
	value: string;
	link: string;
	componentTypes: componentType[];
	errors: Record<string, string>;
	onNameChange: (value: string) => void;
	onTypeChange: (value: number) => void;
}

export function ComponentBasicFields({
	name,
	typeId,
	value,
	link,
	componentTypes,
	errors,
	onNameChange,
	onTypeChange,
}: ComponentBasicFieldsProps) {
	return (
		<>
			{/* Basic Fields */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Name Field */}
				<div className="space-y-2">
					<Label htmlFor="name" className="text-p3 font-semibold flex items-center gap-2">
						<Box className="h-4 w-4 text-muted-foreground" />
						Ad
					</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
						className={`h-11 ${
							errors.name ? "border-destructive focus-visible:ring-destructive" : ""
						}`}
						placeholder="Bileşen adı giriniz"
					/>
					{errors.name && (
						<p className="text-p3 text-destructive flex items-center gap-1">
							<span>•</span>
							{errors.name}
						</p>
					)}
				</div>

				{/* Type Field */}
				<div className="space-y-2">
					<Label htmlFor="typeId" className="text-p3 font-semibold flex items-center gap-2">
						<Box className="h-4 w-4 text-muted-foreground" />
						Tip
					</Label>
					<Select
						value={typeId && typeId !== 0 ? typeId.toString() : ""}
						onValueChange={(value) => onTypeChange(value ? parseInt(value) : 0)}
					>
						<SelectTrigger className={`h-11 ${
							errors.typeId ? "border-destructive focus-visible:ring-destructive" : ""
						}`}>
							<SelectValue placeholder="Tip seçiniz" />
						</SelectTrigger>
						<SelectContent>
							{componentTypes.map((type) => (
								<SelectItem key={type.id} value={type.id.toString()}>
									{type.type}
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
			</div>

			{/* Value Field */}
			<div className="space-y-2">
				<Label htmlFor="value" className="text-p3 font-semibold">
					Değer
				</Label>
				<Input
					id="value"
					value={value}
					readOnly
					className="h-11 bg-muted/50 cursor-not-allowed"
					placeholder="Değer giriniz (opsiyonel)"
				/>
			</div>

			{/* Link Field */}
			<div className="space-y-2">
				<Label htmlFor="link" className="text-p3 font-semibold">
					Link
				</Label>
				<Input
					id="link"
					value={link}
					readOnly
					className="h-11 bg-muted/50 cursor-not-allowed"
					placeholder="Link giriniz (opsiyonel)"
				/>
			</div>
		</>
	);
}

