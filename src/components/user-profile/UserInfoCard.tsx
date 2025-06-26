"use client";
import React, { useState, useEffect } from "react"; // <== thêm useEffect
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Modal } from "../ui/modal";

interface Team {
  id: number;
  name: string;
  members: string[]; // Email list
  roleName: string;
}

export default function MyTeams() {
  useEffect(() => {
  const fetchTeams = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/user-teams", {
        credentials: "include", // Để gửi cookie chứa token
      });

      if (!res.ok) throw new Error("Không thể lấy dữ liệu team");

      const data = await res.json();
      // Gỉa sử API trả về [{ id, name, members: [email1, email2] }]
      setTeams(data);
    } catch (err) {
      console.error("Lỗi khi fetch teams:", err);
    }
  };

  fetchTeams();
}, []);

  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberList, setMemberList] = useState<string[]>([]);

  const handleAddEmail = () => {
    if (memberEmail.trim() && !memberList.includes(memberEmail.trim())) {
      setMemberList([...memberList, memberEmail.trim()]);
      setMemberEmail("");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName) return alert("Nhập tên team");

    try {
      const response = await fetch("http://localhost:3001/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: teamName,
          members: memberList,
        }),
      });

      const data = await response.json();
        console.log(data)
      if (response.ok) {
        // Thêm team mới vào danh sách (sử dụng dữ liệu từ BE)
        setTeams([...teams, data.team]);
        alert("Tạo team thành công!");
      } else {
        alert(data.message || "Tạo team thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }

    // Reset form
    setTeamName("");
    setMemberEmail("");
    setMemberList([]);
    setIsCreateModalOpen(false);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Team của bạn</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Tạo Team</Button>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex justify-between items-center p-4 border rounded-lg dark:border-gray-700"
          >
            <div>
              <h3 className="text-lg font-medium">{team.name}</h3>
              <p className="text-sm text-gray-500">
                Role: {team.roleName}
              </p>

            </div>
            <Button size="sm" variant="outline" onClick={() => alert("Mở thêm người")}>
              Thêm người
            </Button>
          </div>
        ))}
      </div>

      {/* Modal Tạo Team */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="p-5 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Tạo Team mới</h2>

          <div className="mb-4">
            <Label>Tên Team</Label>
            <Input
              placeholder="Nhập tên team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <Label>Thêm thành viên (Email)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="example@email.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <Button size="sm" onClick={handleAddEmail}>
                Thêm
              </Button>
            </div>
          </div>

          {memberList.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              {memberList.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateTeam}>Tạo</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
