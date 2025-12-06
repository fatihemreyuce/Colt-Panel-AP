import { fetchClient } from "../utils/fetch-client";
import type { componentRequest, componentResponse } from "../types/components.types";
import type { Page } from "../types/pagination.types";
import type { assetRequest, assetResponse } from "../types/assets.types";

export const getComponents = (search: string, page: number, size: number, sort: string): Promise<Page<componentResponse>> => {
    return fetchClient<void, Page<componentResponse>>(`/admin/components?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createComponent = (component: componentRequest): Promise<componentResponse> => {
    return fetchClient<componentRequest, componentResponse>("/admin/components", {
        method: "POST",
        body: component,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const createComponentAsset = (componentId: number, asset: assetRequest): Promise<assetResponse> => {
    return fetchClient<assetRequest, assetResponse>(`/admin/components/${componentId}/assets`, {
        method: "POST",
        body: asset,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateComponent = (id: number, component: componentRequest): Promise<componentResponse> => {
    return fetchClient<componentRequest, componentResponse>(`/admin/components/${id}`, {
        method: "PUT",
        body: component,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateComponentAsset = (componentId: number, assetId: number, asset: assetRequest): Promise<assetResponse> => {
    return fetchClient<assetRequest, assetResponse>(`/admin/components/${componentId}/assets/${assetId}`, {
        method: "PUT",
        body: asset,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteComponent = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/components/${id}`, {
        method: "DELETE",
    });
}

export const deleteComponentAsset = (componentId: number, assetId: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/components/${componentId}/assets/${assetId}`, {
        method: "DELETE",
    });
}

export const getComponentById = (id: number): Promise<componentResponse> => {
    return fetchClient<void, componentResponse>(`/admin/components/${id}`, {
        method: "GET",
    });
}
