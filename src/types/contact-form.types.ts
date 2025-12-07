export interface ContactFormRequest {
    companyMail: string;
    firstName: string;
    lastName: string;
    country: string;
    phoneNumber: string;
    city: string;
    companyName: string;
    sector: string;
    unit: string;
    message: string;
    legal: boolean;
    keepInTouch: boolean;
}

export interface ContactFormResponse {
  id: number;
  companyMail: string;
  firstname: string;
  lastname: string;
  country: string;
  city: string;
  companyName: string;
  sector: string;
  unit: string;
  phoneNumber: string;
  message: string;
  legal: boolean;
  keepInTouch: boolean;
}