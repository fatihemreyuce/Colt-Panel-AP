import { useAuthQuery } from "./use-auth-query";
import { getOffices, createOffice, updateOffice, deleteOffice, getOffice } from "../services/offices-service";
import type { officeRequest } from "../types/offices.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useOffices = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["offices", search, page, size, sort],
        queryFn: () => getOffices(search, page, size, sort),
    });
}

export const useCreateOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (office: officeRequest) => createOffice(office),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            toast.success("Ofis başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Ofis oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, office}: {id: number, office: officeRequest}) => updateOffice(id, office),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            toast.success("Ofis başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Ofis güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteOffice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteOffice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            toast.success("Ofis başarıyla silindi");
        },
        onError: () => {
            toast.error("Ofis silinirken bir hata oluştu");
        },
    });
}

export const useGetOffice = (id: number) => {
    return useAuthQuery({
        queryKey: ["office", id],
        queryFn: () => getOffice(id),
    });
}
