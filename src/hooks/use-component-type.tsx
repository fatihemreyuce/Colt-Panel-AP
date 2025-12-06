import { useAuthQuery } from "./use-auth-query";
import { getComponentTypes, createComponentType, updateComponentType, deleteComponentType, getComponentTypeById } from "../services/component-type-service";
import type { componentTypeRequest } from "../types/component-type.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useComponentTypes = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["component-types", search, page, size, sort],
        queryFn: () => getComponentTypes(search, page, size, sort),
    });
}

export const useCreateComponentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (componentType: componentTypeRequest) => createComponentType(componentType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["component-types"] });
            toast.success("Bileşen tipi başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bileşen tipi oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateComponentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, componentType}: {id: number, componentType: componentTypeRequest}) => updateComponentType(id, componentType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["component-types"] });
            toast.success("Bileşen tipi başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen tipi güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteComponentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteComponentType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["component-types"] });
            toast.success("Bileşen tipi başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen tipi silinirken bir hata oluştu");
        },
    });
}

export const useGetComponentTypeById = (id: number) => {
    return useAuthQuery({
        queryKey: ["component-type", id],
        queryFn: () => getComponentTypeById(id),
    });
}
