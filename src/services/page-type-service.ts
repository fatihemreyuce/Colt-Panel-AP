import { fetchClient } from "../utils/fetch-client";
import type { PageTypeRequest, PageTypeResponse } from "../types/page-type.types";
import type { Page } from "../types/pagination.types";

export const getPageTypes = (search: string, page: number, size: number, sort: string): Promise<Page<PageTypeResponse>> => {
    return fetchClient<void, Page<PageTypeResponse>>(`/admin/page-types?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createPageType = (pageType: PageTypeRequest): Promise<PageTypeResponse> => {
    return fetchClient<PageTypeRequest, PageTypeResponse>("/admin/page-types", {
        method: "POST",
        body: pageType,
    });
}

export const updatePageType = (id: number, pageType: PageTypeRequest): Promise<PageTypeResponse> => {
    return fetchClient<PageTypeRequest, PageTypeResponse>(`/admin/page-types/${id}`, {
        method: "PUT",
        body: pageType,
    });
}

export const deletePageType = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/page-types/${id}`, {
        method: "DELETE",
    });
}

export const getPageTypeById = (id: number): Promise<PageTypeResponse> => {
    return fetchClient<void, PageTypeResponse>(`/admin/page-types/${id}`, {
        method: "GET",
    });
}

