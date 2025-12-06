import { useAuthQuery } from "./use-auth-query";
import { getComponents, createComponent, createComponentAsset, updateComponent, updateComponentAsset, deleteComponent, deleteComponentAsset, getComponentById } from "../services/components-service";
import type { componentRequest } from "../types/components.types";
import type { assetRequest } from "../types/assets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useComponents = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["components", search, page, size, sort],
        queryFn: () => getComponents(search, page, size, sort),
    });
}

export const useCreateComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (component: componentRequest) => createComponent(component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bileşen oluşturulurken bir hata oluştu");
        },
    });
}

export const useCreateComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({componentId, asset}: {componentId: number, asset: assetRequest}) => createComponentAsset(componentId, asset),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen seti başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bileşen seti oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, component}: {id: number, component: componentRequest}) => updateComponent(id, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen güncellenirken bir hata oluştu");
        },
    });
}

export const useUpdateComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({componentId, assetId, asset}: {componentId: number, assetId: number, asset: assetRequest}) => updateComponentAsset(componentId, assetId, asset),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen seti başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bileşen seti güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteComponent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen silinirken bir hata oluştu");
        },
    });
}

export const useDeleteComponentAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({componentId, assetId}: {componentId: number, assetId: number}) => deleteComponentAsset(componentId, assetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
            toast.success("Bileşen seti başarıyla silindi");
        },
        onError: () => {
            toast.error("Bileşen seti silinirken bir hata oluştu");
        },
    });
}

export const useGetComponentById = (id: number) => {
    return useAuthQuery({
        queryKey: ["component", id],
        queryFn: () => getComponentById(id),
    });
}
