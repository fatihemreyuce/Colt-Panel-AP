import { fetchClient } from "../utils/fetch-client";
import type { notificationSubscriberRequest, notificationSubscriberResponse } from "../types/notification-subscribers.types";
import type { Page } from "../types/pagination.types";

export const getNotificationSubscribers = (page: number, size: number, sort: string): Promise<Page<notificationSubscriberResponse>> => {
    return fetchClient<void, Page<notificationSubscriberResponse>>(`/admin/notification-subscribers?page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createNotificationSubscriber = (notificationSubscriber: notificationSubscriberRequest): Promise<notificationSubscriberResponse> => {
    return fetchClient<notificationSubscriberRequest, notificationSubscriberResponse>("/notification-subscribers", {
        method: "POST",
        body: notificationSubscriber,
    });
}

export const deleteNotificationSubscriber = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/notification-subscribers/${id}`, {
        method: "DELETE",
    });
}

