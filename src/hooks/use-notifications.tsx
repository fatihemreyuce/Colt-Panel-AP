import { useAuthQuery } from "./use-auth-query";
import { getNotifications, createNotification, updateNotification, deleteNotification, getNotification, sendNotification } from "../services/notifications-service";
import type { notificationRequest } from "../types/notifications.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNotifications = (page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["notifications", page, size, sort],
        queryFn: () => getNotifications(page, size, sort),
    });
}

export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notification: notificationRequest) => createNotification(notification),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Bildirim başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Bildirim oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, notification}: {id: number, notification: notificationRequest}) => updateNotification(id, notification),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Bildirim başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Bildirim güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Bildirim başarıyla silindi");
        },
        onError: () => {
            toast.error("Bildirim silinirken bir hata oluştu");
        },
    });
}

export const useGetNotification = (id: number) => {
    return useAuthQuery({
        queryKey: ["notification", id],
        queryFn: () => getNotification(id),
    });
}

export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({notification, id}: {notification: notificationRequest, id: number}) => sendNotification(notification, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Bildirim başarıyla gönderildi");
        },
        onError: () => {
            toast.error("Bildirim gönderilirken bir hata oluştu");
        },
    });
}