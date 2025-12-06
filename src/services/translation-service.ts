import { fetchClient } from "../utils/fetch-client";

export interface TranslationRequest {
	sourceLanguage: string;
	targetLanguage: string;
	text: string;
}

export interface TranslationResponse {
	translatedText: string;
}

export const translateText = (request: TranslationRequest): Promise<TranslationResponse> => {
	return fetchClient<TranslationRequest, TranslationResponse>("/admin/translate", {
		method: "POST",
		body: request,
	});
}

