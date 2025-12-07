import { fetchClient } from "../utils/fetch-client";
import type { settingsRequest, settingsResponse } from "../types/settings.types";
import type { Page } from "../types/pagination.types";

export const getSettings = (): Promise<Page<settingsResponse>> => {
    return fetchClient<void, Page<settingsResponse>>("/admin/settings", {
        method: "GET",
    });
}

export const updateSettings = (id: number, settings: settingsRequest): Promise<settingsResponse> => {
    return fetchClient<settingsRequest, settingsResponse>(`/admin/settings/${id}`, {
        method: "PUT",
        body: settings,
    });
}

export const getSetting = (id: number): Promise<settingsResponse> => {
    return fetchClient<void, settingsResponse>(`/admin/settings/${id}`, {
        method: "GET",
    });
}

export const deleteSettingsTranslation = (id: number, languageCode: string): Promise<void> => {
    return fetchClient<void, void>(`/admin/settings/${id}/translations/${languageCode}`, {
        method: "DELETE",
    });
}

export const deleteSettings = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/settings/${id}`, {
        method: "DELETE",
    });
}
