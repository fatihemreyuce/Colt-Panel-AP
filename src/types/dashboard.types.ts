import type { PageResponse } from "./page.types";
import type { notificationSubscriberResponse } from "./notification-subscribers.types";
import type { componentResponse } from "./components.types";
import type { ContactFormResponse } from "./contact-form.types";

export interface DashboardResponse {
    pages: PageResponse[];
    notificationSubscribers: notificationSubscriberResponse[];
    components: componentResponse[];
    contactForms: ContactFormResponse[];
    totalPages: number;
    totalNotificationSubscribers: number;
    totalComponents: number;
    totalContactForms: number;
}