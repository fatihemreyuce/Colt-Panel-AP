import { useAuthQuery } from "./use-auth-query";
import { getPages, createPage, updatePage, deletePage, getPage, createPageComponent, updatePageComponent, deletePageComponent, createPageTeamMember, updatePageTeamMember, deletePageTeamMember } from "@/services/page-service";
import type { PageRequest } from "@/types/page.types";
import type { componentRequest } from "@/types/components.types";
import type { TeamMemberRequest } from "@/types/team-members.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePages = (search: string, type: string, page: number, size: number, sort: string) => {
    return useAuthQuery({
        queryKey: ["pages", search, type, page, size, sort],
        queryFn: () => getPages(search, type, page, size, sort),
    });
}

export const useCreatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (page: PageRequest) => createPage(page),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Sayfa oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, page}: {id: number, page: PageRequest}) => updatePage(id, page),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["page", variables.id] });
            toast.success("Sayfa başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Sayfa güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deletePage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfa silinirken bir hata oluştu");
        },
    });
}

export const useGetPage = (id: number) => {
    return useAuthQuery({
        queryKey: ["page", id],
        queryFn: () => getPage(id),
    });
}

export const useCreatePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, component}: {id: number, component: componentRequest}) => createPageComponent(id, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa bileşeni başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Sayfa bileşeni oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, componentId, component}: {id: number, componentId: number, component: componentRequest}) => updatePageComponent(id, componentId, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa bileşeni başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Sayfa bileşeni güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePageComponent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, componentId}: {id: number, componentId: number}) => deletePageComponent(id, componentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa bileşeni başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfa bileşeni silinirken bir hata oluştu");
        },
    });
}

export const useCreatePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, teamMember}: {id: number, teamMember: TeamMemberRequest}) => createPageTeamMember(id, teamMember),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa ekibinin üyesi başarıyla oluşturuldu");
        },
        onError: () => {
            toast.error("Sayfa ekibinin üyesi oluşturulurken bir hata oluştu");
        },
    });
}

export const useUpdatePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, teamMemberId, teamMember}: {id: number, teamMemberId: number, teamMember: TeamMemberRequest}) => updatePageTeamMember(id, teamMemberId, teamMember),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa ekibinin üyesi başarıyla güncellendi");
        },
        onError: () => {
            toast.error("Sayfa ekibinin üyesi güncellenirken bir hata oluştu");
        },
    });
}

export const useDeletePageTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, teamMemberId}: {id: number, teamMemberId: number}) => deletePageTeamMember(id, teamMemberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            toast.success("Sayfa ekibinin üyesi başarıyla silindi");
        },
        onError: () => {
            toast.error("Sayfa ekibinin üyesi silinirken bir hata oluştu");
        },
    });
}
