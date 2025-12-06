/**
 * Google Translate API servisi
 * Google Cloud Translation API v2 kullanır
 */

interface TranslateResponse {
	data: {
		translations: Array<{
			translatedText: string;
			detectedSourceLanguage?: string;
		}>;
	};
}

/**
 * Metni belirtilen dile çevirir
 * @param text Çevrilecek metin
 * @param targetLanguage Hedef dil kodu (örn: 'en', 'tr', 'de', 'fr')
 * @param sourceLanguage Kaynak dil kodu (opsiyonel, otomatik tespit edilir)
 * @returns Çevrilmiş metin
 */
export async function translateText(
	text: string,
	targetLanguage: string,
	sourceLanguage?: string
): Promise<string> {
	if (!text || !text.trim()) {
		return "";
	}

	const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
	if (!apiKey) {
		throw new Error("Google Translate API key bulunamadı. Lütfen .env dosyanızda VITE_GOOGLE_TRANSLATE_API_KEY değişkenini tanımlayın.");
	}

	const url = new URL("https://translation.googleapis.com/language/translate/v2");
	url.searchParams.append("key", apiKey);
	url.searchParams.append("q", text);
	url.searchParams.append("target", targetLanguage);
	if (sourceLanguage) {
		url.searchParams.append("source", sourceLanguage);
	}

	try {
		const response = await fetch(url.toString(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error?.message || `Çeviri hatası: ${response.status}`);
		}

		const data: TranslateResponse = await response.json();
		return data.data.translations[0]?.translatedText || text;
	} catch (error) {
		throw error;
	}
}

/**
 * HTML içeriğini belirtilen dile çevirir
 * HTML etiketlerini korur, sadece metin içeriğini çevirir
 * @param html Çevrilecek HTML içeriği
 * @param targetLanguage Hedef dil kodu
 * @param sourceLanguage Kaynak dil kodu (opsiyonel)
 * @returns Çevrilmiş HTML içeriği
 */
export async function translateHtml(
	html: string,
	targetLanguage: string,
	sourceLanguage?: string
): Promise<string> {
	if (!html || !html.trim()) {
		return "";
	}

	// HTML etiketlerini geçici olarak değiştir
	const tagPlaceholders: Record<string, string> = {};
	let placeholderIndex = 0;
	
	// HTML etiketlerini ve özel karakterleri placeholder'larla değiştir
	const htmlWithPlaceholders = html.replace(/<[^>]+>/g, (match) => {
		const placeholder = `__TAG_${placeholderIndex}__`;
		tagPlaceholders[placeholder] = match;
		placeholderIndex++;
		return placeholder;
	});

	// Metni çevir
	const translatedText = await translateText(htmlWithPlaceholders, targetLanguage, sourceLanguage);

	// Placeholder'ları geri yerleştir
	let result = translatedText;
	Object.entries(tagPlaceholders).forEach(([placeholder, tag]) => {
		result = result.replace(placeholder, tag);
	});

	return result;
}

