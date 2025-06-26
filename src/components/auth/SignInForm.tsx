"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Sử dụng router để chuyển trang

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // ✅ State cho form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Gửi yêu cầu đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_BASE_URL}/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // cần để gửi cookie
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng nhập thành công!");
        router.push("/"); // ✅ chuyển hướng sau khi đăng nhập
      } else {
        alert(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Lỗi kết nối đến máy chủ!");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* ... phần header ... */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {/* ... phần Google/X login ... */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Checkbox + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                href="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <div>
              <Button className="w-full" size="sm" type="submit">
                Sign in
              </Button>
            </div>
          </div>
        </form>

        {/* Link to Sign Up */}
        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
