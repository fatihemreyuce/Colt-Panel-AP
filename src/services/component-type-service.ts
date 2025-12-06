import { fetchClient } from "../utils/fetch-client";
import type { componentTypeRequest, componentTypeResponse } from "../types/component-type.types";
import type { Page } from "../types/pagination.types";

export const getComponentTypes = (search: string, page: number, size: number, sort: string): Promise<Page<componentTypeResponse>> => {
    return fetchClient<void, Page<componentTypeResponse>>(`/admin/component-types?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createComponentType = (componentType: componentTypeRequest): Promise<componentTypeResponse> => {
    return fetchClient<componentTypeRequest, componentTypeResponse>("/admin/component-types", {
        method: "POST",
        body: componentType,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateComponentType = (id: number, componentType: componentTypeRequest): Promise<componentTypeResponse> => {
    return fetchClient<componentTypeRequest, componentTypeResponse>(`/admin/component-types/${id}`, {
        method: "PUT",
        body: componentType,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteComponentType = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/component-types/${id}`, {
        method: "DELETE",
    });
}

export const getComponentTypeById = (id: number): Promise<componentTypeResponse> => {
    return fetchClient<void, componentTypeResponse>(`/admin/component-types/${id}`, {
        method: "GET",
    });
}
