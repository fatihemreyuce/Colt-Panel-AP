export interface fields{
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
}

export interface data{
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
}

export interface translationRequest{
    sourceLanguage: string;
    targetLanguage: string;
    fields: fields;
}

export interface translationResponse{
    data: data;
    success: boolean;
    message: string;
}

