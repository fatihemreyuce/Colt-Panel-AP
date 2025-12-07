import { useAuthQuery } from "./use-auth-query";
import { getDashboard } from "@/services/dashboard-service";

export const useDashboard = () => {
    return useAuthQuery({
        queryKey: ["dashboard"],
        queryFn: () => getDashboard(),
    });
}
