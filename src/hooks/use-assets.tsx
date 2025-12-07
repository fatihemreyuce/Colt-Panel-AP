import { useAuthQuery } from "./use-auth-query";
import { getAssets, createAsset, updateAsset, deleteAsset, getAsset } from "../services/assets-service";
import type { assetRequest } from "../types/assets.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAssets = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["assets", search, page, size, sort],
        queryFn: () => getAssets(search, page, size, sort),
    });
}

export const useCreateAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (asset: assetRequest) => createAsset(asset),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast.success("Set başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Set oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, asset}: {id: number, asset: assetRequest}) => updateAsset(id, asset),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast.success("Set başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Set güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast.success("Set başarıyla silindi");
        },
        onError: (error: any) => {
            // Foreign key constraint hatası kontrolü
            const errorMessage = error?.message || error?.data?.message || "";
            if (
                errorMessage.includes("foreign key constraint") || 
                errorMessage.includes("still referenced") ||
                errorMessage.includes("fk_pages_image_asset") ||
                errorMessage.includes("fk_pages_file_asset") ||
                errorMessage.includes("Data integrity violation")
            ) {
                toast.error("Bu set sayfalarda kullanılıyor. Önce ilgili sayfalardan bu seti kaldırmanız gerekiyor.");
            } else {
                toast.error(errorMessage || "Set silinirken bir hata oluştu");
            }
        },
    });
}

export const useGetAsset = (id: number) => {
    return useAuthQuery({
        queryKey: ["asset", id],
        queryFn: () => getAsset(id),
    });
}
