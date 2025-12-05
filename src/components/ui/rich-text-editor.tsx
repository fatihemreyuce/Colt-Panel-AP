import { useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

interface RichTextEditorProps {
	value?: string;
	onChange?: (content: string) => void;
	placeholder?: string;
	height?: number;
	disabled?: boolean;
	className?: string;
}

export function RichTextEditor({
	value = "",
	onChange,
	placeholder = "Metninizi buraya yazın...",
	height = 400,
	disabled = false,
	className = "",
}: RichTextEditorProps) {
	const editorRef = useRef<TinyMCEEditor | null>(null);
	const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

	useEffect(() => {
		if (!apiKey) {
			console.warn(
				"TinyMCE API key bulunamadı. Lütfen .env dosyanızda VITE_TINYMCE_API_KEY değişkenini tanımlayın."
			);
		}
	}, [apiKey]);

	const handleEditorChange = (content: string) => {
		if (onChange) {
			onChange(content);
		}
	};

	return (
		<div className={`rich-text-editor ${className}`}>
			<Editor
				apiKey={apiKey}
				onInit={(_evt, editor) => {
					editorRef.current = editor;
				}}
				value={value}
				onEditorChange={handleEditorChange}
				disabled={disabled}
				init={{
					height,
					menubar: true,
					plugins: [
						"advlist",
						"autolink",
						"lists",
						"link",
						"image",
						"charmap",
						"preview",
						"anchor",
						"searchreplace",
						"visualblocks",
						"code",
						"fullscreen",
						"insertdatetime",
						"media",
						"table",
						"code",
						"help",
						"wordcount",
					],
					toolbar:
						"undo redo | blocks | " +
						"bold italic forecolor | alignleft aligncenter " +
						"alignright alignjustify | bullist numlist outdent indent | " +
						"removeformat | help",
					content_style:
						"body { font-family: 'DM Sans', sans-serif; font-size: 16px; line-height: 1.6; }",
					placeholder,
					language: "tr",
					skin: "oxide",
					content_css: false,
					branding: false,
					promotion: false,
					// Dark mode support
					ui_mode: "split",
				}}
			/>
		</div>
	);
}

