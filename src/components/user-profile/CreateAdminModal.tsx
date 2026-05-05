"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuthRepository } from "@/hooks/repositories/useAuthRepository";
import toast from "react-hot-toast";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAdminModal({
  isOpen,
  onClose,
}: CreateAdminModalProps) {
  const { createAdmin } = useAuthRepository();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const result: any = await createAdmin({ email, password });
      toast.success(result.message || "Tạo tài khoản admin thành công!");
      resetForm();
      onClose();
    } catch (error: any) {
      if (error.status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này");
      } else if (error.status === 400) {
        toast.error(error.message || "Email đã tồn tại");
      } else {
        toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[480px] m-4">
      <div className="no-scrollbar relative w-full max-w-[480px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            Tạo tài khoản Admin
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo tài khoản admin mới cho hệ thống. Tài khoản sẽ có quyền quản
            trị ngay sau khi tạo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              id="create-admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <Label>
              Mật khẩu <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="create-admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              type="button"
            >
              Hủy
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang tạo...
                </span>
              ) : (
                "Tạo Admin"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
