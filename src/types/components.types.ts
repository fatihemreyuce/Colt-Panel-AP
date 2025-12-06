import type {assetResponse,assetRequest} from "./assets.types";

export interface localization{
    languageCode: string;
    title: string;
    description: string;
    excerpt: string;
    subdescription: string;
}

export interface componentRequest{
    name: string;
    typeId: number;
    value: string;
    localizations: localization[];
    assets: assetRequest[];
    sortOrder: number;
    link: string;
}

export interface componentResponse{
    id: number;
    name: string;
    type: string;
    typeId: number;
    value: string;
    localizations: localization[];
    assets: assetResponse[];
    sortOrder: number;
    link: string;
}