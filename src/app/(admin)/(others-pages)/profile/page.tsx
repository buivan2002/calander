"use client";
import React, { useState } from "react";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import CreateAdminModal from "@/components/user-profile/CreateAdminModal";
import Button from "@/components/ui/button/Button";
import { useAuthStore } from "@/store/useAuthStore";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-5 lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h3>

          {/* Chỉ hiện button khi user là admin */}
          {user?.role === "admin" && (
            <Button
              size="sm"
              onClick={() => setIsCreateAdminOpen(true)}
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Create Admin Account
              </span>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
        </div>
      </div>

      {/* Modal tạo admin */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
      />
    </div>
  );
}
