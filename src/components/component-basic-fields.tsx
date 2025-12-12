import { Box, Component } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ComponentBasicFieldsProps {
	name: string;
	typeId: number;
	value: string;
	link: string;
	componentTypes: any[];
	errors: Record<string, string>;
	onNameChange: (value: string) => void;
	onTypeChange: (value: number) => void;
	onValueChange?: (value: string) => void;
	onLinkChange?: (value: string) => void;
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
	onValueChange,
	onLinkChange,
}: ComponentBasicFieldsProps) {
	return (
		<>
			{/* Component Type Field */}
			<div className="space-y-2">
				<Label htmlFor="typeId" className="text-p3 font-semibold flex items-center gap-2">
					<Component className="h-4 w-4 text-muted-foreground" />
					Bileşen Tipi
				</Label>
				<Select
					value={typeId !== 0 ? typeId.toString() : undefined}
					onValueChange={(value) => onTypeChange(value ? parseInt(value, 10) : 0)}
				>
					<SelectTrigger className="h-11">
						<SelectValue placeholder="Bileşen tipi seçiniz (opsiyonel)" />
					</SelectTrigger>
					<SelectContent>
						{componentTypes.map((componentType) => (
							<SelectItem key={componentType.id} value={componentType.id.toString()}>
								{componentType.type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

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
			</div>

			{/* Value Field */}
			<div className="space-y-2">
				<Label htmlFor="value" className="text-p3 font-semibold">
					Değer
				</Label>
				<Input
					id="value"
					value={value}
					onChange={(e) => onValueChange?.(e.target.value)}
					className="h-11"
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
					onChange={(e) => onLinkChange?.(e.target.value)}
					className="h-11"
					placeholder="Link giriniz (opsiyonel)"
				/>
			</div>
		</>
	);
}

