import type { LanguageRequest, LanguageResponse } from "@/types/languages.types";
import { fetchClient } from "@/utils/fetch-client";
import type { Page } from "@/types/pagination.types";

export const getLanguages = (page: number, size: number, sort: string): Promise<Page<LanguageResponse>> => {
	return fetchClient<void, Page<LanguageResponse>>(`/admin/languages?page=${page}&size=${size}&sort=${sort}`, {
		method: "GET",
	});
};

export const createLanguage = (language: LanguageRequest): Promise<LanguageResponse> => {
	return fetchClient<LanguageRequest, LanguageResponse>("/admin/languages", {
		method: "POST",
		body: language,
	});
};

export const updateLanguage = (id: number, language: LanguageRequest): Promise<LanguageResponse> => {
	return fetchClient<LanguageRequest, LanguageResponse>(`/admin/languages/${id}`, {
		method: "PUT",
		body: language,
	});
};

export const deleteLanguage = (id: number): Promise<void> => {
	return fetchClient<void, void>(`/admin/languages/${id}`, {
		method: "DELETE",
	});
};

export const getLanguageById = (id: number): Promise<LanguageResponse> => {
	return fetchClient<void, LanguageResponse>(`/admin/languages/${id}`, {
		method: "GET",
	});
};
