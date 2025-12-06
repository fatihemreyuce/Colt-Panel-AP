import { useAuthQuery } from "./use-auth-query";
import { getNotificationSubscribers, createNotificationSubscriber, deleteNotificationSubscriber } from "../services/notification-subscribers-service";
import type { notificationSubscriberRequest } from "../types/notification-subscribers.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNotificationSubscribers = (page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["notification-subscribers", page, size, sort],
        queryFn: () => getNotificationSubscribers(page, size, sort),
    });
}

export const useCreateNotificationSubscriber = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationSubscriber: notificationSubscriberRequest) => createNotificationSubscriber(notificationSubscriber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
            toast.success("Bildirim aboneliği başarıyla oluşturuldu");
        },
        onError: (error: any) => {
            const errorMessage = error?.data?.message || error?.message || "Bildirim aboneliği oluşturulurken bir hata oluştu";
            toast.error(errorMessage);
        },
    });
}

export const useDeleteNotificationSubscriber = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteNotificationSubscriber(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-subscribers"] });
            toast.success("Bildirim aboneliği başarıyla silindi");
        },
        onError: (error: any) => {
            const errorMessage = error?.data?.message || error?.message || "Bildirim aboneliği silinirken bir hata oluştu";
            toast.error(errorMessage);
        },
    });
}