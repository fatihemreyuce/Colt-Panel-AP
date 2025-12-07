import { useAuthQuery } from "./use-auth-query";
import { getContactForms, createContactForm, getContactFormById, deleteContactForm } from "@/services/contact-form-service";
import type { ContactFormRequest } from "@/types/contact-form.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useContactForms = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["contact-forms", search, page, size, sort],
        queryFn: () => getContactForms(search, page, size, sort),
    });
}

export const useCreateContactForm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contactForm: ContactFormRequest) => createContactForm(contactForm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact-forms"] });
            toast.success("İletişim formu başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("İletişim formu oluşturulurken bir hata oluştu");
        },
    });
}

export const useGetContactFormById = (id: number) => {
    return useAuthQuery({
        queryKey: ["contact-form", id],
        queryFn: () => getContactFormById(id),
    });
}

export const useDeleteContactForm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteContactForm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact-forms"] });
            toast.success("İletişim formu başarıyla silindi");
        },
        onError: () => {
            toast.error("İletişim formu silinirken bir hata oluştu");
        },
    });
}
