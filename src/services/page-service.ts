import type { PageRequest, PageResponse } from "../types/page.types";
import { fetchClient } from "../utils/fetch-client";
import type { Page } from "../types/pagination.types";
import type { componentRequest, componentResponse } from "../types/components.types";
import type { TeamMemberRequest, TeamMemberResponse } from "../types/team-members.types";

export const getPages = (search: string, type: string, page: number, size: number, sort: string): Promise<Page<PageResponse>> => {
    return fetchClient<void, Page<PageResponse>>(`/admin/pages?search=${search}&type=${type}&page=${page}&size=${size}&sort=${sort}`, {
        method: "GET",
    });
}

export const createPage = (page: PageRequest): Promise<PageResponse> => {
    return fetchClient<PageRequest, PageResponse>("/admin/pages", {
        method: "POST",
        body: page,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updatePage = (id: number, page: PageRequest): Promise<PageResponse> => {
    return fetchClient<PageRequest, PageResponse>(`/admin/pages/${id}`, {
        method: "PUT",
        body: page,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deletePage = (id: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/pages/${id}`, {
        method: "DELETE",
    });
}

export const getPage = (id: number): Promise<PageResponse> => {
    return fetchClient<void, PageResponse>(`/admin/pages/${id}`, {
        method: "GET",
    });
}

export const createPageComponent = (id: number, component: componentRequest): Promise<componentResponse> => {
    return fetchClient<componentRequest, componentResponse>(`/admin/pages/${id}/components`, {
        method: "POST",
        body: component,
    });
}

export const updatePageComponent = (id: number, componentId: number, component: componentRequest): Promise<componentResponse> => {
    return fetchClient<componentRequest, componentResponse>(`/admin/pages/${id}/components/${componentId}`, {
        method: "PUT",
        body: component,
    });
}

export const deletePageComponent = (id: number, componentId: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/pages/${id}/components/${componentId}`, {
        method: "DELETE",
    });
}

export const createPageTeamMember = (id: number, teamMember: TeamMemberRequest): Promise<TeamMemberResponse> => {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/pages/${id}/team-members`, {
        method: "POST",
        body: teamMember,
    });
}

export const updatePageTeamMember = (id: number, teamMemberId: number, teamMember: TeamMemberRequest): Promise<TeamMemberResponse> => {
    return fetchClient<TeamMemberRequest, TeamMemberResponse>(`/admin/pages/${id}/team-members/${teamMemberId}`, {
        method: "PUT",
        body: teamMember,
    });
}

export const deletePageTeamMember = (id: number, teamMemberId: number): Promise<void> => {
    return fetchClient<void, void>(`/admin/pages/${id}/team-members/${teamMemberId}`, {
        method: "DELETE",
    });
}
