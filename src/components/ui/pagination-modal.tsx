import { useEffect, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface PaginationModalProps {
	open: boolean;
	page: number;
	size: number;
	onApply: (page: number, size: number) => void;
	onCancel: () => void;
}

export function PaginationModal({ open, page, size, onApply, onCancel }: PaginationModalProps) {
	const [localPage, setLocalPage] = useState(page);
	const [localSize, setLocalSize] = useState(size);

	useEffect(() => {
		if (open) {
			setLocalPage(page);
			setLocalSize(size);
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = "";
			};
		}
	}, [open, page, size]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/60" onClick={onCancel} />
			<div className="relative z-10 w-full max-w-sm rounded-lg border bg-card p-5 text-card-foreground shadow-lg">
				<h3 className="text-lg font-semibold">Sayfalama</h3>
				<div className="mt-4 grid grid-cols-2 gap-3">
					<div>
						<label className="text-sm text-muted-foreground">Sayfa</label>
						<Input type="number" min={1} value={localPage} onChange={(e) => setLocalPage(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-muted-foreground">Boyut</label>
						<Input type="number" min={1} value={localSize} onChange={(e) => setLocalSize(Number(e.target.value))} />
					</div>
				</div>
				<div className="mt-5 flex items-center justify-end gap-2">
					<Button variant="outline" onClick={onCancel}>Vazgeç</Button>
					<Button onClick={() => onApply(localPage, localSize)}>Uygula</Button>
				</div>
			</div>
		</div>
	);
}


