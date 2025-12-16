export interface LanguageRequest {
    code: string;
}

export interface LanguageResponse {
    id: number;
    code: string;
    name?: string;
}

export type language = LanguageResponse;