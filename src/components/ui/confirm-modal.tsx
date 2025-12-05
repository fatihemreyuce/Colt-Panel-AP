import { useEffect, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
	open: boolean;
	title?: string;
	description?: string;
	confirmationText?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
}

export function ConfirmModal({
	open,
	title = "Onayla",
	description,
	confirmationText,
	confirmText = "Sil",
	cancelText = "İptal",
	onConfirm,
	onCancel,
	loading = false,
}: ConfirmModalProps) {
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
			setInputValue(""); // Modal açıldığında input'u temizle
			return () => {
				document.body.style.overflow = "";
			};
		}
	}, [open]);

	const isConfirmDisabled = confirmationText ? inputValue !== confirmationText : false;

	const handleConfirm = () => {
		if (!isConfirmDisabled) {
			onConfirm();
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
				onClick={onCancel}
			/>
			
			{/* Modal */}
			<div className="relative z-50 w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl transform transition-all overflow-hidden">
				{/* Header with gradient accent */}
				<div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-b border-red-100 dark:border-red-900/30">
					<div className="flex items-center justify-between px-6 py-5">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 shadow-sm">
								<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
								{title}
							</h3>
						</div>
						<button
							onClick={onCancel}
							disabled={loading}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 rounded-lg p-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="px-6 py-6 space-y-6">
					{/* Warning Message Box */}
					{description && (
						<div className="rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4">
							<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
								{description}
							</p>
						</div>
					)}
					
					{/* Confirmation Input */}
					{confirmationText && (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="confirmation-input" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
									Onaylama
								</Label>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Bu işlemi onaylamak için <span className="font-mono font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">"{confirmationText}"</span> yazın
								</p>
							</div>
							<Input
								id="confirmation-input"
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder={confirmationText}
								disabled={loading}
								className="h-11 border-gray-300 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-red-500/30 dark:focus-visible:ring-red-500/30 focus-visible:border-red-500 dark:focus-visible:border-red-500 bg-white dark:bg-gray-800 transition-all font-mono text-sm"
								onKeyDown={(e) => {
									if (e.key === "Enter" && !isConfirmDisabled) {
										handleConfirm();
									}
								}}
							/>
							{inputValue && inputValue !== confirmationText && (
								<p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" />
									Kullanıcı adı eşleşmiyor
								</p>
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 px-6 pb-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={loading}
						className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all font-medium"
					>
						{cancelText}
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						disabled={loading || isConfirmDisabled}
						className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold px-6"
					>
						{loading ? (
							<span className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
								Siliniyor...
							</span>
						) : (
							confirmText
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}


