export interface EcoPartnerRequest {
    logo?: File|string;
    orderIndex: number;
}

export interface EcoPartnerResponse {
    id: number;
    logo: string;
    orderIndex: number;
}
