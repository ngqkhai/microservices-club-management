## Docker Compose development workflow

This repo uses Docker Compose to run the frontend, API gateway, and Node services. Different services reload code differently. Use the commands below to reliably pick up your changes without unnecessary rebuilds.

### TL;DR command recipes
- Frontend (Next.js): code or NEXT_PUBLIC_* changed
  - `docker compose up -d --build frontend`
- Club/Event services: code changed (dev hot-reload)
  - Usually nothing; if watcher misses: `docker compose restart club-service event-service`
- Auth/Notify services: code changed (no watcher)
  - `docker compose restart auth-service notify-service`
- Dependencies updated (package.json/lockfile) for any Node service
  - Try: `docker compose exec <svc> npm ci`
  - If still broken: `docker compose up -d --build <svc>`
  - If node_modules/volumes feel stale: `docker compose down -v --remove-orphans && docker compose up -d --build`
- Kong gateway
  - Env-only changes: `docker compose restart kong`
  - Changed `api-gateway/kong.yml` or plugins: `docker compose up -d --build kong`

### Why these commands?

Service behavior from `docker-compose.yml` and Dockerfiles:

- `frontend`
  - Built as a production Next.js image (no source volume, runs `node server.js`).
  - Build-time args (`NEXT_PUBLIC_*`) are baked in. Changing them or source requires a rebuild.

- `club-service` and `event-service`
  - Built with `target: development`, source is mounted (`./services/<svc>:/app`), command runs `npm run dev`.
  - Code edits hot-reload. If the watcher misses, a container restart is enough.

- `auth-service` and `notify-service`
  - Run with `npm start` (no watcher) but source is mounted. Code edits are visible on disk but process won’t reload; restart needed.

- `kong`
  - Uses a custom image with config and plugins copied into it. Env vars are substituted at runtime. Config/plugin changes require rebuild; env-only changes require restart.

All Node services also mount an anonymous volume at `/app/node_modules` to avoid clobbering container deps.

### Common scenarios

1) I changed only frontend code or `NEXT_PUBLIC_*` values
```sh
docker compose up -d --build frontend
```

2) I edited server code in `services/event` or `services/club`
```sh
# Usually hot-reloads automatically. If not:
docker compose restart event-service club-service
```

3) I edited code in `services/auth` or `services/notify`
```sh
docker compose restart auth-service notify-service
```

4) I changed dependencies (package.json/pnpm-lock/package-lock)
```sh
# Try a fast in-container install first
docker compose exec club-service npm ci
docker compose exec event-service npm ci
docker compose exec auth-service npm ci
docker compose exec notify-service npm ci

# If things remain inconsistent, rebuild just the affected service(s)
docker compose up -d --build event-service

# If node_modules volumes or orphans look stale, do a clean reset
docker compose down -v --remove-orphans
docker compose up -d --build
```

5) I updated `api-gateway/kong.yml` or Lua plugins
```sh
docker compose up -d --build kong
```

6) I changed only gateway environment (service URLs, secrets, CORS)
```sh
docker compose restart kong
```

7) I edited `docker-compose.yml` (services added/removed/renamed)
```sh
docker compose down --remove-orphans
docker compose up -d
```

### Useful tips
- Selective rebuilds: add service names after `--build` to avoid bouncing everything.
  - Example: `docker compose up -d --build frontend event-service`
- View logs while coding: `docker compose logs -f club-service event-service auth-service notify-service frontend kong | cat`
- Force a clean image build (ignore cache) if Dockerfile changed but rebuild seems ignored:
  - `docker compose build --no-cache <svc> && docker compose up -d <svc>`
- Frontend caching: client requests are configured with `cache: 'no-store'` in `frontend/lib/api.ts` to avoid 304 issues from intermediaries.

### When to prefer full reset (down -v)
Use this sparingly. It removes named volumes (e.g., `notify_logs`) and anonymous volumes (`/app/node_modules`). Prefer targeted restarts/rebuilds first. Reach for:
```sh
docker compose down -v --remove-orphans && docker compose up -d --build
```
when: node_modules corruption, persistent orphans, or repeated rebuilds don’t reflect changes.


