import type { TeamMemberRequest, TeamMemberResponse } from "@/types/team-members.types";
import { fetchClient } from "@/utils/fetch-client";
import type { Page } from "@/types/pagination.types";

export const getTeamMembers = (search: string, page: number, size: number, sort: string): Promise<Page<TeamMemberResponse>> => {
    return fetchClient<void, Page<TeamMemberResponse>>(`/admin/team-members?search=${search}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createTeamMember = (teamMember: TeamMemberRequest): Promise<TeamMemberResponse> => {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>("/admin/team-members", {
        method: "POST",
        body: teamMember,
        headers: {
            "Content-Type": "multipart/form-data",
        },  
    });
}

export const updateTeamMember = (id: number, teamMember: TeamMemberRequest): Promise<TeamMemberResponse> => {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/team-members/${id}`, {
        method: "PUT",
        body: teamMember,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteTeamMember = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/team-members/${id}`, {
        method: "DELETE",
    });
}

export const getTeamMemberById = (id: number): Promise<TeamMemberResponse> => {
    return fetchClient<void, TeamMemberResponse>(`/admin/team-members/${id}`, {
        method: "GET",
    });
}