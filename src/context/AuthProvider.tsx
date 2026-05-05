"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchWrapper } from "@/lib/api/fetchWrapper";

/**
 * AuthProvider — Khôi phục user state khi app mount (reload/first visit).
 *
 * Flow:
 * 1. App mount → AuthProvider chạy useEffect
 * 2. Gọi GET /auth/me (cookie httpOnly tự động gửi kèm)
 * 3. Nếu thành công → setUser vào Zustand store
 * 4. Nếu thất bại (401 = chưa login hoặc token hết hạn) → clearUser
 * 5. Set isLoading = false → UI render bình thường
 *
 * Vì sao dùng API /me thay vì persist store?
 * - httpOnly cookie không đọc được bằng JS → không thể decode client-side
 * - Luôn lấy role mới nhất từ DB (nếu admin bị thu quyền → biết ngay)
 * - Đây là best practice cho production auth system
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        const data: any = await fetchWrapper("/auth/me", { method: "GET" });
        if (data?.user) {
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch {
        // 401 = chưa đăng nhập hoặc token hết hạn → bỏ qua, không redirect
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    rehydrateAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
