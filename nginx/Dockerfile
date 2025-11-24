# ===== React ビルドステージ =====
FROM node:20-alpine AS build

WORKDIR /app

# React プロジェクトの package をコピー
COPY ./web/package*.json ./web/
WORKDIR /app/web

RUN npm install

# 残りの React ソースをコピー
COPY ./web/ .

# 本番ビルド（Viteなら `npm run build`、CRAでも同じ）
RUN npm run build


# ===== Nginx 本番ステージ =====
FROM nginx:alpine

# Nginx 設定
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# React のビルド成果物を Nginx の公開ディレクトリへコピー
# Vite → dist / CRA → build なので、使っているツールに合わせて片方を有効化
# Vite:
COPY --from=build /app/web/dist /usr/share/nginx/html