# Calendar App - Frontend (Next.js)

## 📋 Project Overview

**Calendar App** là frontend Next.js cho ứng dụng quản lý lịch và công việc nhóm. Cung cấp:
- Dashboard quản lý công việc cá nhân
- Quản lý lịch sự kiện
- Tạo và quản lý nhóm
- Xác thực người dùng (Đăng ký/Đăng nhập)
- Giao diện dark mode
- Sidebar navigation collapsible

---

## 🛠️ Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|----------|---------|
| **Next.js** | 15.2.3 | Framework React |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | Latest | Type safety |
| **Tailwind CSS** | 4.0.9 | Styling |
| **ApexCharts** | 4.3.0 | Data visualization |
| **FullCalendar** | 6.1.15 | Calendar component |
| **Flatpickr** | 4.6.13 | Date picker |
| **React DnD** | 16.0.1 | Drag & drop |

---

## 📁 Project Structure

```
calander/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── not-found.tsx    # 404 page
│   │   ├── (admin)/         # Protected admin routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx     # Dashboard
│   │   │   └── (others-pages)/
│   │   └── (full-width-pages)/
│   │       ├── (auth)/      # Login/Register
│   │       └── (error-pages)/
│   ├── components/          # Reusable components
│   │   ├── auth/            # SignIn, SignUp forms
│   │   ├── calendar/        # Calendar component
│   │   ├── charts/          # Chart components
│   │   ├── common/          # Shared components
│   │   ├── ecommerce/       # Dashboard widgets
│   │   ├── form/            # Form elements
│   │   ├── header/          # Header component
│   │   ├── tables/          # Table components
│   │   └── ui/              # UI elements
│   ├── context/             # React Context
│   │   ├── SidebarContext.tsx  # Sidebar state
│   │   └── ThemeContext.tsx    # Dark mode
│   ├── hooks/               # Custom hooks
│   │   ├── useGoBack.ts
│   │   └── useModal.ts
│   ├── middleware.ts        # Next.js middleware (auth guard)
│   └── icons/               # Icon components
├── public/                  # Static assets
│   └── images/              # Images (brand, icons, etc.)
├── .env                     # Environment variables
├── next.config.ts           # Next.js config
├── tailwind.config.js       # Tailwind config
└── tsconfig.json            # TypeScript config
```

---

## 🔑 Key Features

### Authentication
- Đăng ký người dùng mới
- Đăng nhập với email/password
- JWT token lưu trong HTTPOnly cookie
- Route protection với middleware

### Dashboard
- Overview công việc
- Chart visualization (Bar, Line charts)
- Todo list management
- Recent orders/activities

### Calendar Management
- Xem lịch tháng/tuần/ngày
- Tạo sự kiện lịch
- Edit/Delete sự kiện
- FullCalendar integration

### Team Management
- Tạo nhóm mới
- Quản lý thành viên
- Gán vai trò
- Nhóm lịch chia sẻ

### UI Features
- Dark mode toggle
- Responsive sidebar (collapsible)
- Tables & data display
- Forms & input validation
- Dropdowns, modals, alerts
- Data visualization (ApexCharts)

---

## 🚀 Installation & Setup

### 1. Install dependencies
```bash
cd calander
npm install
```

### 2. Setup environment variables
Chỉnh sửa file `.env`:
```bash
# API endpoint (Backend URL)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
# Hoặc production
NEXT_PUBLIC_API_BASE_URL=https://be-calander.onrender.com/api
```

### 3. Run development server
```bash
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

**Thay đổi port (ví dụ: 3002)**:
```bash
npm run dev -- -p 3002
```

Hoặc thêm vào `.env.local`:
```bash
PORT=3002
```

### 4. Build for production
```bash
npm run build
npm start
```

---

## 🔐 Authentication Flow

1. User truy cập → middleware kiểm tra token
2. Nếu không có token → redirect `/signin`
3. Đăng nhập → gọi backend `/api/login`
4. Backend trả token → lưu trong cookie
5. Cookie tự động gửi kèm request tiếp theo
6. Middleware xác thực → cho phép truy cập

**Public routes** (không cần đăng nhập):
- `/signin`
- `/signup`

---

## 🌐 API Integration

Tất cả API calls sử dụng `NEXT_PUBLIC_API_BASE_URL` từ `.env`

**Backend endpoints**: [Xem Be-calander README](../Be-calander/README.md#-api-endpoints)

---

## 📊 Components Overview

| Component | Mục đích |
|-----------|---------|
| **SignInForm** | Login form |
| **SignUpForm** | Registration form |
| **Calendar** | FullCalendar wrapper |
| **Charts** | ApexCharts visualization |
| **Tables** | Data table display |
| **Sidebar** | Navigation menu |
| **Header** | Top navigation bar |
| **Modal** | Dialog components |

---

## 🎨 Styling

- **Tailwind CSS v4**: Utility-first CSS
- **Dark Mode**: Context-based theme switching
- **Responsive**: Mobile-first design
- **Global Styles**: [globals.css](src/app/globals.css)

---

## 🔗 Middleware

File [middleware.ts](src/middleware.ts) quản lý:
- ✅ Route protection (require authentication)
- ✅ Token verification
- ✅ Automatic redirect for auth routes
- ✅ Public/Private route configuration

---

## 🗂️ Context Providers

### SidebarContext
- Quản lý sidebar open/close state
- Accessible từ tất cả components

### ThemeContext
- Dark mode on/off
- Theme preference storage

---

## 📝 Development Notes

### Build Process
- Next.js 15 với App Router
- Server Components by default
- TypeScript strict mode
- SVG as React components (@svgr/webpack)

### Deployment
- Production URL: `https://calander-inky.vercel.app`
- Hosted on Vercel
- Environment variables configured

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| API 404 errors | Kiểm tra NEXT_PUBLIC_API_BASE_URL trong .env |
| Auth redirect loop | Xóa cookie, đăng nhập lại |
| Tailwind not loading | Chạy `npm install` lại |
| Build error | Xóa `.next` folder, rebuild |

---

## 👨‍💻 Quick Commands

```bash
# Development
npm run dev                    # Start dev server port 3000
npm run dev -- -p 3002        # Start on custom port

# Build & Production
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Links
http://localhost:3000         # Dev frontend
http://localhost:3001/api     # Dev backend (nếu chạy cùng)
```

---

## 📚 File References

- **Entry Point**: [src/app/layout.tsx](src/app/layout.tsx)
- **Middleware**: [src/middleware.ts](src/middleware.ts)
- **Auth Context**: [src/context/](src/context/)
- **Components**: [src/components/](src/components/)

---

**Backend**: [Be-calander Repository](../Be-calander/)  
**Production Demo**: [https://calander-inky.vercel.app](https://calander-inky.vercel.app)  
**API Docs**: [Be-calander README](../Be-calander/README.md)

---

**Cập nhật**: April 8, 2026  
**Version**: 2.0.2
