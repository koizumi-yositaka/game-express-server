FROM node:20-alpine

WORKDIR /usr/src/app

# 依存関係インストール
COPY package.json package-lock.json* prisma/schema.prisma ./
RUN npm install

# ソースコードコピー
COPY . .
RUN npx prisma generate
# ★ TypeScript をビルドして dist/ を作る
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]