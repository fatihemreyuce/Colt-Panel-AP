import { useAuthQuery } from "./use-auth-query";
import { getPartners, createPartner, updatePartner, deletePartner, getPartnerById } from "@/services/partners-service";
import type { PartnerRequest } from "@/types/partners.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePartners = () => {
    return useAuthQuery({
        queryKey: ["partners"],
        queryFn: () => getPartners(),
    });
}

export const useCreatePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (partner: PartnerRequest) => createPartner(partner),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Partner başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Partner oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, partner}: {id: number, partner: PartnerRequest}) => updatePartner(id, partner),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Partner başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Partner güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deletePartner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Partner başarıyla silindi");
        },
        onError: () => {
            toast.error("Partner silinirken bir hata oluştu");
        },
    });
}

export const useGetPartnerById = (id: number) => {
    return useAuthQuery({
        queryKey: ["partner", id],
        queryFn: () => getPartnerById(id),
    });
}