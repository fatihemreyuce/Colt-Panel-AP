import {useAuthQuery} from "./use-auth-query";
import { getUsers, createUser, updateUser, deleteUser, getUser } from "@/services/user-service";
import type { UserRequest } from "@/types/user.types";
import {useMutation,  useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

export const useUsers = (search: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["users", search, page, size, sort],
        queryFn: () => getUsers(search, page, size, sort),
    });
}

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UserRequest) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Kullanıcı başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Kullanıcı oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, user}: {id: number, user: UserRequest}) => updateUser(id, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Kullanıcı başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Kullanıcı güncellenirken bir hata oluştu");
        },
    });
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Kullanıcı başarıyla silindi");
        },
        onError: () => {
            toast.error("Kullanıcı silinirken bir hata oluştu");
        },
    });
}

export const useGetUser = (id: number) => {
    return useAuthQuery({
        queryKey: ["user", id],
        queryFn: () => getUser(id),
    });
}