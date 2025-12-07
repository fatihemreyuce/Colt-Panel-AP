import { fetchClient } from "../utils/fetch-client";
import type { ContactFormRequest, ContactFormResponse } from "../types/contact-form.types";
import type { Page } from "../types/pagination.types";

export const getContactForms = (search: string, page: number, size: number, sort: string): Promise<Page<ContactFormResponse>> => {
    return fetchClient<void, Page<ContactFormResponse>>(`/admin/contact-forms?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createContactForm = (contactForm: ContactFormRequest): Promise<ContactFormResponse> => {
    return fetchClient<ContactFormRequest, ContactFormResponse>("/public/contact-forms", {
        method: "POST",
        body: contactForm,
    });
}

export const getContactFormById = (id: number): Promise<ContactFormResponse> => {
    return fetchClient<void, ContactFormResponse>(`/admin/contact-forms/${id}`, {
        method: "GET",
    });
}

export const deleteContactForm = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/contact-forms/${id}`, {
        method: "DELETE",
    });
}
