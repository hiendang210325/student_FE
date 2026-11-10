# ==============================================================================
# Giai đoạn 1: Biên dịch ứng dụng React + Vite (Builder Stage)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Sao chép tệp cấu hình package để tận dụng bộ nhớ đệm
COPY package*.json ./

# Cài đặt toàn bộ dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn Frontend
COPY . .

# Thiết lập biến môi trường API URL mặc định
ENV VITE_API_BASE_URL=http://localhost:5000/api

# Biên dịch ứng dụng React sang thư mục dist
RUN npm run build

# ==============================================================================
# Giai đoạn 2: Máy chủ Nginx phục vụ tệp tĩnh (Production Server)
# ==============================================================================
FROM nginx:alpine

# Sao chép bản build từ giai đoạn builder vào thư mục mặc định của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Sao chép tệp cấu hình tùy chỉnh của Nginx (hỗ trợ SPA routing & proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 cho dịch vụ Web
EXPOSE 80

# Khởi chạy Nginx ở chế độ tiền cảnh (foreground)
CMD ["nginx", "-g", "daemon off;"]

