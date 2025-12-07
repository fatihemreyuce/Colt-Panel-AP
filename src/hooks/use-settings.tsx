import { useAuthQuery } from "./use-auth-query";
import { getSettings, updateSettings, getSetting, deleteSettingsTranslation, deleteSettings } from "@/services/settings-service";
import type { settingsRequest } from "@/types/settings.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSettings = () => {
    return useAuthQuery({
        queryKey: ["settings", ],
        queryFn: () => getSettings(),
    });
}

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, settings}: {id: number, settings: settingsRequest}) => updateSettings(id, settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Ayarlar başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Ayarlar güncellenirken bir hata oluştu");
        },
    });
}

export const useGetSetting = (id: number) => {
    return useAuthQuery({
        queryKey: ["setting", id],
        queryFn: () => getSetting(id),
    });
}

export const useDeleteSettingsTranslation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, languageCode}: {id: number, languageCode: string}) => deleteSettingsTranslation(id, languageCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Ayarlar dili başarıyla silindi");
        },
        onError: () => {
            toast.error("Ayarlar dili silinirken bir hata oluştu");
        },
    });
}

export const useDeleteSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteSettings(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Ayarlar başarıyla silindi");
        },
        onError: () => {
            toast.error("Ayarlar silinirken bir hata oluştu");
        },
    });
}
