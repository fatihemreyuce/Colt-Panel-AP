import { fetchClient } from "../utils/fetch-client";
import type { officeRequest, officeResponse } from "../types/offices.types";
import type { Page } from "../types/pagination.types";

export const getOffices = (search: string, page: number, size: number, sort: string): Promise<Page<officeResponse>> => {
    return fetchClient<void, Page<officeResponse>>(`/admin/offices?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createOffice = (office: officeRequest): Promise<officeResponse> => {
    return fetchClient<officeRequest, officeResponse>("/admin/offices", {
        method: "POST",
        body: office,
    });
}

export const updateOffice = (id: number, office: officeRequest): Promise<officeResponse> => {
    return fetchClient<officeRequest, officeResponse>(`/admin/offices/${id}`, {
        method: "PUT",
        body: office,
    });
}

export const deleteOffice = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/offices/${id}`, {
        method: "DELETE",
    });
}

export const getOffice = (id: number): Promise<officeResponse> => {
    return fetchClient<void, officeResponse>(`/admin/offices/${id}`, {
        method: "GET",
    });
}