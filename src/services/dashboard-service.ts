import { fetchClient } from "../utils/fetch-client";
import type { DashboardResponse } from "../types/dashboard.types";

export const getDashboard = (): Promise<DashboardResponse> => {
    return fetchClient<void, DashboardResponse>("/admin/dashboard", {
        method: "GET",
    });
}
