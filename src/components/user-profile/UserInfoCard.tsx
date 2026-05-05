"use client";
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Modal } from "../ui/modal";
import { useTeamRepository } from "@/hooks/repositories/useTeamRepository";
import { Team } from "@/types/api.type";

type RequestError = {
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as RequestError).message || fallback);
  }

  return fallback;
};

export default function MyTeams() {
  const { getUserTeams, createTeam, addMember, removeMember, demoteMember } =
    useTeamRepository();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamError, setTeamError] = useState("");
  const [memberActionError, setMemberActionError] = useState("");
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        setTeamError("");
        const data = await getUserTeams();
        // API có thể trả về array hoặc object, normalize về array
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi fetch teams:", err);
        setTeamError("Không tải được danh sách team");
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [getUserTeams]);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberList, setMemberList] = useState<string[]>([]);
  const [manageMemberEmail, setManageMemberEmail] = useState("");

  const updateTeamState = (team: Team) => {
    setTeams((currentTeams) =>
      currentTeams.map((currentTeam) =>
        currentTeam.id === team.id ? team : currentTeam
      )
    );
    setSelectedTeam(team);
  };

  const handleAddEmail = () => {
    if (memberEmail.trim() && !memberList.includes(memberEmail.trim())) {
      setMemberList([...memberList, memberEmail.trim()]);
      setMemberEmail("");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName) return alert("Nhập tên team");

    try {
      const data = await createTeam({
        name: teamName,
        members: memberList,
      });

      // Thêm team mới vào danh sách (sử dụng dữ liệu từ BE)
      setTeams([...teams, data.team]);
      alert("Tạo team thành công!");
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

  const handleOpenManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setManageMemberEmail("");
    setMemberActionError("");
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !manageMemberEmail.trim()) return;

    try {
      setMemberActionLoading(true);
      setMemberActionError("");
      const data = await addMember(selectedTeam.id, manageMemberEmail.trim());
      updateTeamState(data.team);
      setManageMemberEmail("");
    } catch (err: unknown) {
      setMemberActionError(getErrorMessage(err, "Thêm thành viên thất bại"));
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      setMemberActionLoading(true);
      setMemberActionError("");
      const data = await removeMember(selectedTeam.id, userId);
      updateTeamState(data.team);
    } catch (err: unknown) {
      setMemberActionError(getErrorMessage(err, "Xóa thành viên thất bại"));
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleDemoteMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      setMemberActionLoading(true);
      setMemberActionError("");
      const data = await demoteMember(selectedTeam.id, userId);
      updateTeamState(data.team);
    } catch (err: unknown) {
      setMemberActionError(getErrorMessage(err, "Hạ quyền thành viên thất bại"));
    } finally {
      setMemberActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Team của bạn</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Tạo Team</Button>
      </div>

      <div className="grid gap-4">
        {isLoadingTeams && (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Đang tải danh sách team...
          </div>
        )}

        {!isLoadingTeams && teamError && (
          <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {teamError}
          </div>
        )}

        {!isLoadingTeams && !teamError && teams.length === 0 && (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Bạn chưa có team nào.
          </div>
        )}

        {teams.map((team) => (
          <div
            key={team.id}
            className="flex justify-between items-center p-4 border rounded-lg dark:border-gray-700"
          >
            <div>
              <h3 className="text-lg font-medium">{team.name}</h3>
              <p className="text-sm text-gray-500">
                Số lượng thành viên: {team.memberCount ?? team.users?.length ?? 0}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenManageMembers(team)}
            >
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

      <Modal
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        className="max-w-2xl"
      >
        <div className="p-5 sm:p-6">
          <div className="mb-5 pr-12">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Quản lý thành viên
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedTeam?.name} ·{" "}
              {selectedTeam?.memberCount ?? selectedTeam?.users?.length ?? 0} thành viên
            </p>
          </div>

          <div className="mb-5">
            <Label>Thêm thành viên bằng email</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder="example@email.com"
                value={manageMemberEmail}
                onChange={(e) => setManageMemberEmail(e.target.value)}
                disabled={memberActionLoading}
              />
              <Button
                size="sm"
                className="h-11 sm:min-w-28"
                onClick={handleAddMember}
                disabled={memberActionLoading || !manageMemberEmail.trim()}
              >
                {memberActionLoading ? "Đang lưu" : "Thêm"}
              </Button>
            </div>
          </div>

          {memberActionError && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {memberActionError}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {selectedTeam?.users?.length ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTeam.users.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {member.name || member.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {member.roleName || "Member"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {member.roleName && member.roleName !== "Member" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemoteMember(member.id)}
                          disabled={memberActionLoading}
                        >
                          Hạ quyền
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={memberActionLoading}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Team này chưa có thành viên.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
