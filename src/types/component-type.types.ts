export interface componentTypeRequest{
    type: string;
    hasTitle: boolean;
    hasExcerpt: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasValue: boolean;
    hasAssets: boolean;
    photo?:File|string;
    hasLink: boolean;
}

export interface componentTypeResponse{
    id: number;
    type: string;
    hasTitle: boolean;
    hasExcerpt: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasValue: boolean;
    hasAssets: boolean;
    photo?:string;
    hasLink: boolean;
}