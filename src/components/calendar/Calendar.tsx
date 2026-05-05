"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { useCalendarRepository } from "@/hooks/repositories/useCalendarRepository";
import { useTeamRepository } from "@/hooks/repositories/useTeamRepository";
import { CalendarItem, Team, User } from "@/types/api.type";
import { useAuthStore } from "@/store/useAuthStore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    team_id?: string | number;
    assigner_id?: string | number;
    status?: string;
    file_id?: string | number | null;
    file_url?: string | null;
    file_name?: string | null;
    raw_start?: string;
    raw_end?: string;
  };
}

type CustomFile = { uid: string; name: string; status: string; url: string };

interface CalendarApiItem extends CalendarItem {
  file?: {
    id?: number;
    file_path?: string;
    file_name?: string;
  };
  file_url?: string | null;
}

const getApiUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const Calendar: React.FC = () => {
  const { getCalendars, createCalendar, updateCalendar, uploadFile } = useCalendarRepository();
  const { getUserTeams } = useTeamRepository();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const role = user?.role || "user";
  const isAdmin = role === "admin";

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [assigneeId, setAssigneeId] = useState<number | "">("");

  const [eventStatus, setEventStatus] = useState("pending");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileList, setFileList] = useState<CustomFile[]>([]);

  const availableTeams = React.useMemo(() => {
    if (!assigneeId) return teams;
    return teams.filter(t => t.users?.some(u => u.id === assigneeId));
  }, [teams, assigneeId]);

  const availableAssignees = React.useMemo(() => {
    if (selectedTeamId) {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      return selectedTeam?.users || [];
    }
    const map = new Map<number, User>();
    teams.forEach(t => {
      t.users?.forEach(u => map.set(u.id, u));
    });
    return Array.from(map.values());
  }, [teams, selectedTeamId]);

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const resetModalFields = () => {
    setSelectedEvent(null);
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedTeamId("");
    setAssigneeId("");
    setEventStatus("pending");
    setFileToUpload(null);
    setFileList([]);
  };

  function getCalendarTag(status: string) {
    if (status === 'completed' || status === 'Hoàn thành') return "Success";
    if (status === 'pending' || status === 'Chưa hoàn thành') return "Danger";
    return "Info";
  }

  const fetchCalendars = React.useCallback(async () => {
    if (isLoading) return;

    try {
      const data = await getCalendars(role);

      const mappedEvents = (data as CalendarApiItem[]).map((item) => ({
        id: item.id.toString(),
        title: item.name,
        start: item.start_time ? dayjs.utc(item.start_time).tz(userTimezone).format() : undefined,
        end: item.end_time ? dayjs.utc(item.end_time).tz(userTimezone).format() : undefined,
        extendedProps: {
          calendar: item.type || getCalendarTag(item.status),
          team_id: item.team_id ?? "",
          assigner_id: item.assigner_id ?? "",
          status: item.status === "Hoàn thành" || item.status === "completed" ? "completed" : "pending",
          file_id: item.file?.id || item.file_id || null,
          file_url: getApiUrl(item.file?.file_path || item.file_url),
          file_name: item.file?.file_name || null,
          raw_start: item.start_time,
          raw_end: item.end_time,
        },
      }));
      const teamList = await getUserTeams();
      setEvents(mappedEvents);
      setTeams(teamList);
    } catch (err) {
      console.error("❌ Lỗi fetch lịch:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isLoading]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(dayjs(selectInfo.startStr).format("YYYY-MM-DDTHH:mm"));
    setEventEndDate(dayjs(selectInfo.endStr || selectInfo.startStr).format("YYYY-MM-DDTHH:mm"));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event as unknown as CalendarEvent;
    setSelectedEvent(event);
    setEventTitle(event.title || "");
    const rawStart = event.extendedProps.raw_start;
    const rawEnd = event.extendedProps.raw_end;
    
    // Explicit mapping to Flatpickr formatting limits and dayjs translation to auto-fill form:
    setEventStartDate(rawStart ? dayjs.utc(rawStart).local().format("YYYY-MM-DD HH:mm") : "");
    setEventEndDate(rawEnd ? dayjs.utc(rawEnd).local().format("YYYY-MM-DD HH:mm") : "");
    
    setEventLevel(event.extendedProps.calendar);
    setSelectedTeamId(event.extendedProps.team_id ? Number(event.extendedProps.team_id) : "");
    setAssigneeId(event.extendedProps.assigner_id ? Number(event.extendedProps.assigner_id) : "");
    setEventStatus(event.extendedProps.status || "pending");

    const f_url = event.extendedProps.file_url;
    const f_id = event.extendedProps.file_id;
    const f_name = event.extendedProps.file_name;
    if (f_url && f_id) {
      setFileList([{ uid: String(f_id), name: f_name || "File đính kèm", status: "done", url: f_url }]);
    } else {
      setFileList([]);
    }
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    const payload: {
      name: string;
      start_time: string | null;
      end_time: string | null;
      type: string;
      status?: string;
      file_id?: number | null;
      team_id?: number | null;
      assigner_id?: number | null;
    } = {
      name: eventTitle,
      start_time: eventStartDate ? dayjs.tz(eventStartDate, userTimezone).utc().toISOString() : null,
      end_time: eventEndDate ? dayjs.tz(eventEndDate, userTimezone).utc().toISOString() : null,
      type: eventLevel,
    };

    if (isAdmin) {
      payload.team_id = selectedTeamId || null;
      payload.assigner_id = assigneeId || null;
    }

    try {
      if (selectedEvent) {
        if (eventStatus === 'completed' && fileToUpload) {
          const res = await uploadFile(fileToUpload);
          payload.file_id = res.file_id;
        } else if (eventStatus === 'completed') {
          payload.file_id = selectedEvent.extendedProps.file_id
            ? Number(selectedEvent.extendedProps.file_id)
            : null;
        } else {
          payload.file_id = null;
        }

        payload.status = eventStatus;
        await updateCalendar(selectedEvent.id as string, payload);
      } else {
        await createCalendar(payload);
      }
      
      await fetchCalendars();
      
    } catch (err) {
      console.error('❌ Lỗi lưu sự kiện:', err);
    }

    closeModal();
    resetModalFields();
  };

  const handleCloseModal = () => {
    closeModal();
    resetModalFields();
  };



  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: () => { resetModalFields(); openModal(); },
            },
          }}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Edit Event" : "Add Event"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Plan your next big moment: schedule or edit an event to stay on track
            </p>
          </div>
          <div className="mt-8">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
              </label>
              <input
                id="event-title"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            
            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <div key={key} className="n-chk">
                    <div className={`form-check form-check-${value} form-check-inline`}>
                      <label
                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                        htmlFor={`modal${key}`}
                      >
                        <span className="relative">
                          <input
                            className="sr-only form-check-input"
                            type="radio"
                            name="event-level"
                            value={key}
                            id={`modal${key}`}
                            checked={eventLevel === key}
                            onChange={() => setEventLevel(key)}
                          />
                          <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                            <span
                              className={`h-2 w-2 rounded-full bg-white ${
                                eventLevel === key ? "block" : "hidden"
                              }`}
                            ></span>
                          </span>
                        </span>
                        {key}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Start Date & Time (Quy đổi tự động ra UTC)
              </label>
              <input
                type="datetime-local"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
              />
            </div>

            {isAdmin && (
              <>
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Team
                  </label>
                  <div className="relative">
                    <select
                      id="team-id"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : "")}
                      className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    >
                      <option value="">-- Chọn team --</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Assignee
                  </label>
                  <div className="relative">
                    <select
                      id="assignee-id"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
                      className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    >
                      <option value="">-- Chọn người thực hiện --</option>
                      {availableAssignees.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {selectedEvent && (
              <>
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={eventStatus}
                      onChange={(e) => setEventStatus(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    >
                      <option value="pending">Chưa hoàn thành</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </div>
                </div>

                {eventStatus === 'completed' && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      File đính kèm báo cáo hoàn thành (Tuỳ chọn)
                    </label>
                    <div className="mb-3 space-y-2">
                       {fileList.map((file) => (
                         <div key={file.uid} className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                           <span className="text-xl">📄</span>
                           {file.url ? (
                             <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                               {file.name}
                             </a>
                           ) : (
                             <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
                           )}
                           <button type="button" onClick={() => { setFileList([]); setFileToUpload(null); }} className="ml-auto text-sm text-red-500 hover:text-red-700">XOÁ</button>
                         </div>
                       ))}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setFileToUpload(file || null);
                        if(file) {
                          setFileList([{ uid: 'new', name: file.name, status: 'uploading', url: '' }]);
                        } else {
                          setFileList([]);
                        }
                      }}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={handleCloseModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {selectedEvent ? "Update Changes" : "Add Event"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
