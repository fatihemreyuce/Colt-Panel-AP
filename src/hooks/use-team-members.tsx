import { useAuthQuery } from "./use-auth-query";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, getTeamMemberById } from "@/services/team-members-service";
import type { TeamMemberRequest } from "@/types/team-members.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTeamMembers = (search: string, page: number, size: number, sort: string) => {
	return useAuthQuery({
		queryKey: ["team-members", search, page, size, sort],
		queryFn: () => getTeamMembers(search, page, size, sort),
	});
};

export const useCreateTeamMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (teamMember: TeamMemberRequest) => createTeamMember(teamMember),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team-members"] });
			toast.success("Takım üyesi başarıyla oluşturuldu");
		},
		onError: () => {
			toast.error("Takım üyesi oluşturulurken bir hata oluştu");
		},
	});
};

export const useUpdateTeamMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({id, teamMember}: {id: number, teamMember: TeamMemberRequest}) => updateTeamMember(id, teamMember),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team-members"] });
			toast.success("Takım üyesi başarıyla güncellendi");
		},
		onError: () => {
			toast.error("Takım üyesi güncellenirken bir hata oluştu");
		},
	});
};

export const useDeleteTeamMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteTeamMember(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team-members"] });
			toast.success("Takım üyesi başarıyla silindi");
		},
		onError: () => {
			toast.error("Takım üyesi silinirken bir hata oluştu");
		},
	});
};

export const useGetTeamMemberById = (id: number) => {
	return useAuthQuery({
		queryKey: ["team-member", id],
		queryFn: () => getTeamMemberById(id),
	});
};
