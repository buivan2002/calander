# ==========================================
# Stage 1: Dependencies - Cài đặt thư viện
# ==========================================
FROM node:18-alpine AS deps
# Cài libc6-compat vì Alpine thiếu một số thư viện C mà các module Node native cần
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files để tận dụng Docker layer cache
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Không tìm thấy lockfile!" && exit 1; \
  fi

# ==========================================
# Stage 2: Builder - Biên dịch mã nguồn
# ==========================================
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vô hiệu hóa telemetry của Next.js cho CI/CD nhanh hơn
ENV NEXT_TELEMETRY_DISABLED 1
# ✅ FIX: Khai báo ARG để nhận build-args từ CI/CD
ARG NEXT_PUBLIC_API_BASE_URL
# ✅ FIX: Bake giá trị vào ENV để next build có thể đọc
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Lệnh build sẽ tạo ra thư mục .next/standalone nhờ config ở trên
RUN npm run build

# ==========================================
# Stage 3: Runner - Chạy ứng dụng (Production)
# ==========================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Chạy app dưới quyền user non-root để bảo mật (Zero Trust cơ bản)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy thư mục public
COPY --from=builder /app/public ./public

# Set quyền cho thư mục .next
RUN mkdir .next
RUN chown nextjs:nodejs .next

# COPY bản standalone (Chính là thứ đang gây lỗi của cậu)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY thư mục static (Rất nhiều người quên bước này khiến web không load được CSS/JS)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000
ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

# File server.js này được tự động sinh ra trong thư mục standalone
CMD ["node", "server.js"]