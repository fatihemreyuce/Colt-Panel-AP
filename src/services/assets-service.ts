import { fetchClient } from "../utils/fetch-client";
import type { assetRequest, assetResponse } from "../types/assets.types";
import type { Page } from "../types/pagination.types";

export const getAssets = (search: string, page: number, size: number, sort: string): Promise<Page<assetResponse>> => {
    return fetchClient<void, Page<assetResponse>>(`/admin/assets?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createAsset = (asset: assetRequest): Promise<assetResponse> => {
    return fetchClient<assetRequest, assetResponse>("/admin/assets", {
        method: "POST",
        body: asset,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateAsset = (id: number, asset: assetRequest): Promise<assetResponse> => {
    return fetchClient<assetRequest, assetResponse>(`/admin/assets/${id}`, {
        method: "PUT",
        body: asset,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteAsset = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/assets/${id}`, {
        method: "DELETE",
    });
}

export const getAsset = (id: number): Promise<assetResponse> => {
    return fetchClient<void, assetResponse>(`/admin/assets/${id}`, {
        method: "GET",
    });
}
