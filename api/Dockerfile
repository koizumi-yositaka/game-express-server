FROM node:20-alpine

WORKDIR /usr/src/app

# 依存関係インストール
COPY package.json package-lock.json* ./
RUN npm install

# ソースコードコピー
COPY . .

# ★ TypeScript をビルドして dist/ を作る
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]