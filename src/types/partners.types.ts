export interface PartnerRequest {
    logo?: File|string;
    orderIndex: number;
}

export interface PartnerResponse {
    id: number;
    logo: string;
    orderIndex: number;
}