"use client";

import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface CalendarItem {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
  user: string;
  team: string;
  role: string;
}

export default function CalendarTable() {
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [editingCalendar, setEditingCalendar] = useState<CalendarItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/getcalendars`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu lịch");

        const data = await res.json();
        setCalendars(data);
      } catch (error) {
        console.error("❌ Lỗi fetch lịch:", error);
      }
    };

    fetchCalendars();
  }, []);

  const handleEdit = (calendar: CalendarItem) => {
    setEditingCalendar(calendar);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCalendar(null);
    setShowModal(false);
  };

  const handleUpdateCalendar = async (calendar: CalendarItem) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/updatecalendar/${calendar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(calendar),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật");

      setCalendars((prev) =>
        prev.map((item) => (item.id === calendar.id ? calendar : item))
      );
      handleCloseModal();
    } catch (err) {
      console.error("❌ Cập nhật thất bại:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deletecalendar/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa");

      setCalendars((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("❌ Xóa thất bại:", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">User</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Calendar</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Team</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Start Time</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">End Time</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Type</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Role</TableCell>
                <TableCell isHeader className="px-5 py-3 text-theme-xs">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {calendars.map((calendar) => (
                <TableRow key={calendar.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {calendar.user}
                      </div>
                      <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {calendar.role}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    {calendar.name}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600">
                    {calendar.team}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600">
                    {new Date(calendar.start_time).toLocaleString()}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600">
                    {new Date(calendar.end_time).toLocaleString()}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        calendar.status === "Active"
                          ? "success"
                          : calendar.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {calendar.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600">
                    {calendar.type}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600">
                    {calendar.role}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <div className="flex gap-2">
                     <button
                      onClick={() => handleEdit(calendar)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>

                      <button
                        onClick={() => handleDelete(calendar.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Edit */}
      {showModal && editingCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Chỉnh sửa lịch</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCalendar(editingCalendar);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={editingCalendar.name}
                onChange={(e) =>
                  setEditingCalendar({ ...editingCalendar, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                placeholder="Tên lịch"
              />
                <input
                 type="text"
                 value={editingCalendar.team}
                 onChange={(e) =>
                   setEditingCalendar({ ...editingCalendar, team: e.target.value })
                 }
                 className="w-full border px-3 py-2 rounded"
                 placeholder="Team"
               />
              <input
                type="datetime-local"
                value={new Date(editingCalendar.start_time).toISOString().slice(0, -1)}
                onChange={(e) =>
                  setEditingCalendar({
                    ...editingCalendar,
                    start_time: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="datetime-local"
                value={new Date(editingCalendar.end_time).toISOString().slice(0, -1)}
                onChange={(e) =>
                  setEditingCalendar({
                    ...editingCalendar,
                    end_time: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
                <input
                type="text"
                value={editingCalendar.status}
                onChange={(e) =>
                  setEditingCalendar({ ...editingCalendar, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                placeholder="Status"
              />
               <input
                type="text"
                value={editingCalendar.type}
                onChange={(e) =>
                  setEditingCalendar({ ...editingCalendar, type: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                placeholder="Type"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
