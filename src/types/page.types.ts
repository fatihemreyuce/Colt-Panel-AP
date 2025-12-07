import type { componentResponse } from "./components.types";
import type { assetResponse } from "./assets.types";
import type { TeamMemberResponse } from "./team-members.types";

export interface localization{
    languageCode: string;
    title: string;
    description: string;
    subdescription: string;
}

export interface localizations{
    languageCode: string;
    title: string;
    content: string;
    excerpt: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
}

export interface PageRequest {
    slug: string;
    name: string;
    typeId: number;
    fileAsset?: string | File;
    fileAssetId?: number;
    imageAsset?: string | File;
    imageAssetId?: number;
    localizations: localizations[];
}

export interface PageResponse {
    id: number;
    slug: string;
    name: string;
    type: string;
    typeId: number;
    file?: {
        id: number;
        url: string;
        type: string;
        mime: string;
        width: number;
        height: number;
        localizations: localization[];
    },
    image?: {
        id: number;
        url: string;
        type: string;
        mime: string;
        width: number;
        height: number;
        localizations: localization[];
    },
    localizations: localizations[];
    components: {
        component: componentResponse;
        sortOrder: number | null;
    }[];
    assets:{
        asset: assetResponse;
        sortOrder: number | null;
    }[];
    teamMembers: {
        teamMember: TeamMemberResponse;
        sortOrder: number | null;
    }[];
    createdAt: string;
    updatedAt: string;
}