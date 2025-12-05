import type { EcoPartnerRequest, EcoPartnerResponse } from "@/types/eco-partners.types";
import { fetchClient } from "@/utils/fetch-client";
import type { Page } from "@/types/pagination.types";

export const getEcoPartners = (): Promise<Page<EcoPartnerResponse>> => {
    return fetchClient<void, Page<EcoPartnerResponse>>(`/admin/eco-partners`, {
        method: "GET",
    });
}

export const createEcoPartner = (ecoPartner: EcoPartnerRequest): Promise<EcoPartnerResponse> => {
    return fetchClient<EcoPartnerRequest, EcoPartnerResponse>("/admin/eco-partners", {
        method: "POST",
        body: ecoPartner,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateEcoPartner = (id: number, ecoPartner: EcoPartnerRequest): Promise<EcoPartnerResponse> => {
    return fetchClient<EcoPartnerRequest, EcoPartnerResponse>(`/admin/eco-partners/${id}`, {
        method: "PUT",
        body: ecoPartner,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteEcoPartner = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/eco-partners/${id}`, {
        method: "DELETE",
    });
}

export const getEcoPartnerById = (id: number): Promise<EcoPartnerResponse> => {
    return fetchClient<void, EcoPartnerResponse>(`/admin/eco-partners/${id}`, {
        method: "GET",
    });
}