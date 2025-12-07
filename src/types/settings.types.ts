export interface translation{
    languageCode: string;
    termsOfUse: string;
    privacyPolicy: string;
    cookiePolicy: string;
    footerDescription: string;
}

export interface settingsRequest{
    translations: translation[];
    twitterUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
}

export interface settingsResponse{
    id: number;
    translations: translation[];
    twitterUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
}