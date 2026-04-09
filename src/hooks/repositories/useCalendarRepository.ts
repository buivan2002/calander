import { fetchWrapper } from "@/lib/api/fetchWrapper";
import { CalendarItem } from "@/types/api.type";

export function useCalendarRepository() {
  return {
    getCalendars: (): Promise<CalendarItem[]> => {
      return fetchWrapper<CalendarItem[]>("/calendars");
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
    deleteCalendar: (id: string | number): Promise<unknown> => {
      return fetchWrapper(`/calendars/${id}`, {
        method: "DELETE",
      });
    },
  };
}
