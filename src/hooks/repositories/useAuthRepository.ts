import { fetchWrapper } from "@/lib/api/fetchWrapper";
import { ApiResponse } from "@/types/api.type";

export function useAuthRepository() {
  return {
    login: (payload: Record<string, unknown>): Promise<ApiResponse> => {
      return fetchWrapper("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    register: (payload: Record<string, unknown>): Promise<ApiResponse> => {
      return fetchWrapper("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    logout: (): Promise<ApiResponse> => {
      return fetchWrapper("/auth/logout", {
        method: "POST",
      });
    },
  };
}
