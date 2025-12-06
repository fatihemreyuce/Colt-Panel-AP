import { useAuthQuery } from "./use-auth-query";
import { translateText } from "../services/translations-service";

export const useTranslateText = (text: string, targetLanguage: string, sourceLanguage: string) => {
    return useAuthQuery({
        queryKey: ["translate-text", text, targetLanguage, sourceLanguage],
        queryFn: () => translateText(text, targetLanguage, sourceLanguage),
    });
}

