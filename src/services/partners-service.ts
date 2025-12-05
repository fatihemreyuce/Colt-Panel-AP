import type { PartnerRequest, PartnerResponse } from "@/types/partners.types";
import { fetchClient } from "@/utils/fetch-client";
import type { Page } from "@/types/pagination.types";

export const getPartners = (): Promise<Page<PartnerResponse>> => {
    return fetchClient<void, Page<PartnerResponse>>(`/admin/partners`, {
        method: "GET",
    });
}

export const createPartner = (partner: PartnerRequest): Promise<PartnerResponse> => {
    return fetchClient<PartnerRequest, PartnerResponse>("/admin/partners", {
        method: "POST",
        body: partner,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updatePartner = (id: number, partner: PartnerRequest): Promise<PartnerResponse> => {
    return fetchClient<PartnerRequest, PartnerResponse>(`/admin/partners/${id}`, {
        method: "PUT",
        body: partner,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deletePartner = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/partners/${id}`, {
        method: "DELETE",
    });
}

export const getPartnerById = (id: number): Promise<PartnerResponse> => {
    return fetchClient<void, PartnerResponse>(`/admin/partners/${id}`, {
        method: "GET",
    });
}