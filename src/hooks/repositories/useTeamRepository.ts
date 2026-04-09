import { fetchWrapper } from "@/lib/api/fetchWrapper";
import { Team } from "@/types/api.type";

export function useTeamRepository() {
  return {
    getTeams: (): Promise<Team[]> => {
      return fetchWrapper<Team[]>("/team/getteams");
    },
    getUserTeams: (): Promise<Team[]> => {
      return fetchWrapper<Team[]>("/team/user-teams");
    },
  };
}
