import { fetchClient } from "../utils/fetch-client";
import type { backupRequest, backupResponse } from "../types/backups.types";
import type { Page } from "../types/pagination.types";

export const getBackups = (page: number, size: number): Promise<Page<backupResponse>> => {
    return fetchClient<void, Page<backupResponse>>(`/admin/backups?page=${page}&size=${size}`, {
        method: "GET",
    });
}

export const createBackup = (backup: backupRequest): Promise<backupResponse> => {
    return fetchClient<backupRequest, backupResponse>("/admin/backups/create", {
        method: "POST",
        body: backup,
    });
}

export const deleteBackup = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/backups/${id}`, {
        method: "DELETE",
    });
}

export const getBackupById = (id: number): Promise<backupResponse> => {
    return fetchClient<void, backupResponse>(`/admin/backups/${id}`, {
        method: "GET",
    });
}

export const getBackupByDownload = (id: number): Promise<backupResponse> => {
    return fetchClient<void, backupResponse>(`/admin/backups/${id}/download`, {
        method: "GET",
    });
}
