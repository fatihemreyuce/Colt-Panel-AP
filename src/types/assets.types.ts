export interface localization{
    languageCode: string;
    title: string;
    description: string;
    subdescription: string;
}

export interface assetRequest{
    file?: File|string;
    localizations: localization[];
    type?: string;
    componentTypeId?: number;
    assetId?: number;
}

export interface assetResponse{
    id: number;
    url: string;
    type: string;
    mime: string;
    width: number;
    height: number;
    localizations: localization[];
    componentTypeId?: number;
    assetId?: number;
}