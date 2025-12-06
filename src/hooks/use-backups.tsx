import { useAuthQuery } from "./use-auth-query";
import { getBackups, createBackup, deleteBackup, getBackupById, getBackupByDownload } from "../services/backups-service";
import type { backupRequest } from "../types/backups.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBackups = (page: number, size: number) => {
    return useAuthQuery({
        queryKey: ["backups", page, size],
        queryFn: () => getBackups(page, size),
    });
}

export const useCreateBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (backup: backupRequest) => createBackup(backup),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backups"] });
            toast.success("Backup başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Backup oluşturulurken bir hata oluştu");
        },
    });
}

export const useDeleteBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteBackup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backups"] });
            toast.success("Backup başarıyla silindi");
        },
        onError: () => {
            toast.error("Backup silinirken bir hata oluştu");
        },
    });
}

export const useGetBackupById = (id: number) => {
    return useAuthQuery({
        queryKey: ["backup", id],
        queryFn: () => getBackupById(id),
    });
}

export const useGetBackupByDownload = (id: number) => {
    return useAuthQuery({
        queryKey: ["backup", id, "download"],
        queryFn: () => getBackupByDownload(id),
    });
}
