import { fetchWrapper } from "@/lib/api/fetchWrapper";
import { Team } from "@/types/api.type";

interface TeamResponse {
  message: string;
  team: Team;
}

const teamRepository = {
  getTeams: (): Promise<Team[]> => {
    return fetchWrapper<Team[]>("/team/getteams");
  },
  getUserTeams: (): Promise<Team[]> => {
    return fetchWrapper<Team[]>("/team/user-teams");
  },
  createTeam: (payload: { name: string; members: string[] }): Promise<TeamResponse> => {
    return fetchWrapper<TeamResponse>("/team/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  addMember: (teamId: Team["id"], email: string): Promise<TeamResponse> => {
    return fetchWrapper<TeamResponse>(`/team/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  removeMember: (teamId: Team["id"], userId: number): Promise<TeamResponse> => {
    return fetchWrapper<TeamResponse>(`/team/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  },
  demoteMember: (teamId: Team["id"], userId: number): Promise<TeamResponse> => {
    return fetchWrapper<TeamResponse>(`/team/${teamId}/members/${userId}/demote`, {
      method: "PATCH",
    });
  },
};

export function useTeamRepository() {
  return teamRepository;
}
