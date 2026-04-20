import { fetchWrapper } from "@/lib/api/fetchWrapper";
import { CalendarItem } from "@/types/api.type";

export function useCalendarRepository() {
  return {
    getCalendars: (role: string): Promise<CalendarItem[]> => {
      const endpoint = role === 'admin' ? '/calendars/admin' : '/calendars/user';
      return fetchWrapper<CalendarItem[]>(endpoint);
    },
    createCalendar: (payload: unknown): Promise<unknown> => {
      return fetchWrapper("/calendars", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateCalendar: (id: string | number, payload: Partial<CalendarItem>): Promise<unknown> => {
      return fetchWrapper(`/calendars/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    updateStatus: (id: string | number, status: string, file_id?: number): Promise<unknown> => {
      return fetchWrapper(`/calendars/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, file_id }),
      });
    },
    uploadFile: async (file: File): Promise<{ file_id: number; file_path: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3100/api/v1";
      const res = await fetch(`${url}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    deleteCalendar: (id: string | number): Promise<unknown> => {
      return fetchWrapper(`/calendars/${id}`, {
        method: "DELETE",
      });
    },
  };
}
