# Kiến Trúc Thư Mục Frontend (ReactJS Business / Enterprise Standard)

Dự án frontend của Hệ Thống Quản Lý Học Sinh (`quanlyhocsinh/client`) được xây dựng theo **Feature-Driven Architecture (Kiến trúc hướng tính năng / Bulletproof React)** chuẩn doanh nghiệp. Cấu trúc này tối ưu cho việc mở rộng (scalability), dễ bảo trì (maintainability), kiểm thử (testability) và làm việc theo nhóm (team collaboration).

---

## 1. Sơ đồ Cây Thư Mục Tổng Quan

```
client/
├── public/                     # Static assets công khai không qua bundler
├── src/
│   ├── assets/                 # Hình ảnh, icons, SVGs nội bộ
│   │
│   ├── components/             # Reusable UI Components dùng chung toàn app
│   │   ├── common/             # Atomic & molecule components: Button, Input, Modal, Table, Badge...
│   │   ├── feedback/           # Alert, Toast, Spinner, EmptyState...
│   │   └── form/               # Form fields, Select, Checkbox, DatePicker...
│   │
│   ├── config/                 # Cấu hình hệ thống & hằng số toàn cục
│   │   ├── env.ts              # Typed environment variables (VITE_API_BASE_URL,...)
│   │   └── constants.ts        # ROLES, PAGINATION, STORAGE_KEYS, DATE_FORMATS
│   │
│   ├── features/               # Các mô-đun nghiệp vụ độc lập (Feature-Driven Modules)
│   │   ├── auth/               # Nghiệp vụ Đăng nhập & Xác thực
│   │   │   ├── api/            # authApi.ts (endpoints login, logout, me)
│   │   │   ├── pages/          # LoginPage.tsx
│   │   │   └── types/          # auth.types.ts
│   │   ├── dashboard/          # Nghiệp vụ Tổng quan / Thống kê
│   │   │   ├── api/            # dashboardApi.ts
│   │   │   ├── components/     # StatsCard.tsx, Charts...
│   │   │   ├── pages/          # DashboardPage.tsx
│   │   │   └── types/          # dashboard.types.ts
│   │   ├── students/           # Nghiệp vụ Trọng tâm: Quản lý học sinh
│   │   │   ├── api/            # studentApi.ts (CRUD học sinh)
│   │   │   ├── components/     # StudentFilter.tsx, StudentFormModal.tsx...
│   │   │   ├── pages/          # StudentListPage.tsx, StudentDetailPage.tsx
│   │   │   └── types/          # student.types.ts (Interfaces, Enums, DTOs)
│   │   └── classes/            # Nghiệp vụ Lớp học
│   │       ├── api/            # classApi.ts
│   │       ├── pages/          # ClassListPage.tsx
│   │       └── types/          # class.types.ts
│   │
│   ├── hooks/                  # Custom React Hooks dùng chung
│   │   ├── useDebounce.ts      # Debounce search input
│   │   ├── usePagination.ts    # Logic phân trang độc lập
│   │   ├── useModal.ts         # Quản lý trạng thái mở/đóng modal
│   │   └── useLocalStorage.ts  # Tương tác an toàn với LocalStorage
│   │
│   ├── layouts/                # Khung giao diện (Layout Shells)
│   │   ├── MainLayout/         # Shell chính (Sidebar, Header, Breadcrumbs, Content)
│   │   └── AuthLayout/         # Shell cho các màn Đăng nhập / Quên mật khẩu
│   │
│   ├── routes/                 # Định tuyến ứng dụng
│   │   ├── paths.ts            # Hằng số đường dẫn (ROUTES.STUDENTS, ...)
│   │   ├── ProtectedRoute.tsx  # Route Guard kiểm tra Auth & Role RBAC
│   │   └── AppRoutes.tsx       # Cấu hình routes tập trung
│   │
│   ├── services/               # Tích hợp dịch vụ bên ngoài & HTTP Client
│   │   ├── api/
│   │   │   ├── apiClient.ts    # Axios instance với interceptors (JWT Injection, 401 redirect)
│   │   │   └── apiError.ts     # Chuẩn hóa lỗi API
│   │   └── storage/
│   │       └── tokenService.ts # Quản lý Access/Refresh Token và User Session
│   │
│   ├── store/                  # Quản lý State toàn cục (Zustand)
│   │   └── useAuthStore.ts     # Lưu trữ User profile, trạng thái Login/Logout
│   │
│   ├── types/                  # Kiểu dữ liệu TypeScript dùng chung
│   │   ├── common.types.ts     # ApiResponse<T>, PaginatedResponse<T>, PaginationParams...
│   │   └── user.types.ts       # Role, User interface
│   │
│   ├── utils/                  # Hàm tiện ích thuần túy (Pure functions)
│   │   ├── formatters.ts       # Định dạng ngày tháng, tiền tệ, số điện thoại
│   │   └── helpers.ts          # Merge Tailwind classes (cn), xóa dấu tiếng Việt...
│   │
│   ├── App.tsx                 # Root Application Component
│   ├── main.tsx                # Entry point
│   └── index.css               # Base Tailwind CSS & Global design tokens
│
├── .env.example                # File mẫu biến môi trường
├── .env.development            # Biến môi trường local
├── .gitignore
├── index.html
├── package.json                # Dependencies & Scripts
├── postcss.config.js
├── tailwind.config.js          # Tailwind tokens & themes
├── tsconfig.json               # TypeScript config với path alias `@/*`
└── vite.config.ts              # Vite configuration
```

---

## 2. Quy Tắc & Tiêu Chuẩn Doanh Nghiệp (Business Standard Rules)

1. **Feature Encapsulation (Đóng gói theo tính năng)**:
   - Tất cả mã nguồn liên quan chặt chẽ đến một nghiệp vụ (`api`, `components`, `types`, `pages`) phải nằm trong thư mục của tính năng đó (`src/features/[feature-name]/`).
   - Chỉ đưa vào `src/components/common` các component dùng chung từ 2 feature trở lên.

2. **Strict TypeScript & Path Alias**:
   - Sử dụng path alias `@/...` thay vì import tương đối `../../..`.
   - Mọi request payload và response trả về từ server đều phải được định nghĩa kiểu dữ liệu trong `types/`. Không sử dụng kiểu `any`.

3. **HTTP & API Interceptor**:
   - Mọi API call đều thông qua `src/services/api/apiClient.ts`.
   - Tự động gắn header `Authorization: Bearer <token>` vào request.
   - Bắt tự động mã lỗi `401 Unauthorized` để điều hướng về `/login` và xóa session hết hạn.

4. **Quản lý State rõ ràng**:
   - UI State ngắn hạn: Dùng `useState` hoặc custom hooks cục bộ.
   - Global State nghiệp vụ (User auth, app settings): Dùng `zustand` trong `src/store/`.
   - Server Cache (nếu cần): Tích hợp TanStack Query khi dự án phát triển sâu hơn.

---

## 3. Lệnh Thao Tác Cơ Bản

```bash
# Cài đặt thư viện (chạy từ thư mục client)
npm install

# Khởi chạy môi trường phát triển (Local Dev Server)
npm run dev

# Kiểm tra lỗi type và build bản production
npm run build
```

