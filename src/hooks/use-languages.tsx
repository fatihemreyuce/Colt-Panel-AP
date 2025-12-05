import { useAuthQuery } from "./use-auth-query";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage, getLanguageById } from "@/services/language-service";
import type { LanguageRequest } from "@/types/languages.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLanguages = (page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["languages", page, size, sort],
        queryFn: () => getLanguages(page, size, sort),
    });
}

export const useCreateLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (language: LanguageRequest) => createLanguage(language),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            toast.success("Dil başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Dil oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, language}: {id: number, language: LanguageRequest}) => updateLanguage(id, language),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            toast.success("Dil başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Dil güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteLanguage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["languages"] });
            toast.success("Dil başarıyla silindi");
        },
        onError: (error: any) => {
            // Foreign key constraint hatası kontrolü
            const errorMessage = error?.message || error?.data?.message || "";
            if (
                errorMessage.includes("foreign key constraint") || 
                errorMessage.includes("still referenced") ||
                errorMessage.includes("team_member_translations") ||
                errorMessage.includes("Data integrity violation")
            ) {
                toast.error("Bu dil takım üyeleri tarafından kullanılıyor. Önce ilgili takım üyelerinden bu dili kaldırmanız gerekiyor.");
            } else {
                toast.error(errorMessage || "Dil silinirken bir hata oluştu");
            }
        },
    });
}

export const useGetLanguageById = (id: number) => {
    return useAuthQuery({
        queryKey: ["language", id],
        queryFn: () => getLanguageById(id),
    });
}