import { fetchClient } from "../utils/fetch-client";
import type { notificationRequest, notificationResponse } from "../types/notifications.types";
import type { Page } from "../types/pagination.types";

export const getNotifications = (page: number, size: number, sort: string): Promise<Page<notificationResponse>> => {
    return fetchClient<void, Page<notificationResponse>>(`/admin/notifications?page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createNotification = (notification: notificationRequest): Promise<notificationResponse> => {
    return fetchClient<notificationRequest, notificationResponse>("/admin/notifications", {
        method: "POST",
        body: notification,
    });
}

export const updateNotification = (id: number, notification: notificationRequest): Promise<notificationResponse> => {
    return fetchClient<notificationRequest, notificationResponse>(`/admin/notifications/${id}`, {
        method: "PUT",
        body: notification,
    });
}

export const deleteNotification = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/notifications/${id}`, {
        method: "DELETE",
    });
}

export const getNotification = (id: number): Promise<notificationResponse> => {
    return fetchClient<void, notificationResponse>(`/admin/notifications/${id}`, {
        method: "GET",
    });
}

export const sendNotification = (notification: notificationRequest, id: number): Promise<void> => {
    return fetchClient<notificationRequest, void>(`/admin/notifications/${id}/send`, {
        method: "POST",
        body: notification,
    });
}
