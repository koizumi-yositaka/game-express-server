project-root/
├─ docker-compose.yml
├─ api/          # Express(TS) プロジェクト
│   ├─ Dockerfile
│   ├─ package.json
│   ├─ tsconfig.json
│   └─ src/
│       └─ app.ts
├─ web/          # React プロジェクト (Vite や CRA 想定)
│   ├─ package.json
│   └─ src/ ...
├─ nginx/
│   ├─ Dockerfile
│   └─ default.conf
└─ mysql/
    └─ init.sql



docker compose up -d --build

## Volumeも削除
docker compose down -v

## APIのみ
docker compose build api
docker compose up -d api
