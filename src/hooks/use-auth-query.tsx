import { useLoginState } from "@/hooks/use-login-state";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const useAuthQuery = <TData = unknown, TError = unknown>(
  options: Omit<UseQueryOptions<TData, TError>, "enabled"> & {
    enabled?: boolean; 
  }
) => {
  const { isLoggedIn } = useLoginState();

  return useQuery({
    ...options,
    enabled: isLoggedIn && options.enabled !== false,
  });
};
