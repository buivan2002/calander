"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

type Team = {
  id: string;
  name: string;
};

type CalendarData = {
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
  teamId: string;
};

export default function UserCalendarModals() {
  const createModal = useModal();


  const [calendarData, setCalendarData] = useState<CalendarData>({
    name: "",
    type: "",
    start_time: "",
    end_time: "",
    status: "",
    teamId: "",
  });

  const [teams, setTeams] = useState<Team[]>([]);
useEffect(() => {
  fetch("http://localhost:3001/api/getteams", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(setTeams)
    .catch((err) => console.error("Failed to fetch teams:", err));
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCalendarData({ ...calendarData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
     const start = new Date(calendarData.start_time);
  const end = new Date(calendarData.end_time);

  if (!calendarData.start_time || !calendarData.end_time || !calendarData.teamId) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  if (start >= end) {
    alert("⛔ Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
    return;
  }
    try {
      const response = await fetch("http://localhost:3001/api/calendars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(calendarData),
      });

      if (!response.ok) throw new Error("Failed to create calendar");
      createModal.closeModal();
    } catch (error) {
      console.error("Error creating calendar:", error);
    }
  };


  return (
    <div className="flex space-x-4">
      <Button onClick={createModal.openModal}>➕ Thêm lịch</Button>
      {/* Modal Thêm lịch */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.closeModal} title="Thêm lịch mới">
        <FormFields calendarData={calendarData} handleChange={handleChange} teams={teams} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="primary" onClick={createModal.closeModal}>Huỷ</Button>
      <Button
        onClick={handleSave}
        disabled={
          !calendarData.start_time ||
          !calendarData.end_time ||
          !calendarData.teamId
        }
      >
        Lưu
      </Button>
        </div>
      </Modal>

    </div>
  );
}
type FormFieldsProps = {
  calendarData: CalendarData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  teams: Team[];
};

  function FormFields({ calendarData, handleChange, teams }: FormFieldsProps) {
    return (
      <div className="space-y-2">
        <Label>Tên lịch</Label>
        <Input name="name" value={calendarData.name} onChange={handleChange} />

        <Label>Loại lịch</Label>
        <Input name="type" value={calendarData.type} onChange={handleChange} />

        <Label>Thời gian bắt đầu</Label>
        <Input type="datetime-local" name="start_time" value={calendarData.start_time} onChange={handleChange} />

        <Label>Thời gian kết thúc</Label>
        <Input type="datetime-local" name="end_time" value={calendarData.end_time} onChange={handleChange} />

        <Label>Trạng thái</Label>
        <Input name="status" value={calendarData.status} onChange={handleChange} />

        <Label>Đội nhóm</Label>
        <select
          name="teamId"
          value={calendarData.teamId}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">-- Chọn đội nhóm --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
