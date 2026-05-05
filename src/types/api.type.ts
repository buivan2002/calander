export interface ApiResponse<T = unknown> {
  // Vì hiện tại backend trả về thẳng data hoặc object tùy endpoint, ta có thể cast generic types
  // Nếu backend update sang format msg/data chuẩn, bạn có thể chỉnh interface này sau.
  message?: string;
  error?: string;
  data?: T;
  [key: string]: unknown;
}

export interface CalendarItem {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
  team_id: string | number;
  user_id: string | number;
  assigner_id?: string | number;
  file_id?: string | number | null;
  user?: string;
  team?: string;
  role?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  roleId?: number;
  roleName?: string;
}

export interface Team {
  id: string | number;
  name: string;
  roleName?: string;
  memberCount?: number;
  users?: User[];
}
