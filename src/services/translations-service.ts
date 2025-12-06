import { fetchClient } from "../utils/fetch-client";
import type { translationRequest, translationResponse } from "../types/translations.types";

export const translateText = (text: string, targetLanguage: string, sourceLanguage: string): Promise<translationResponse> => {
    return fetchClient<translationRequest, translationResponse>("/translations/translate-fields", {
        method: "POST",
        body: {
            sourceLanguage,
            targetLanguage,
            fields: {
                additionalProp1: text,
                additionalProp2: "",
                additionalProp3: "",
            }
        },
    });
}
