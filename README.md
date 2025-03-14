# 🚀 GoDeploy — Effortless SPA Deployment, Your Way

> **Simple, fast, and flexible Docker + Nginx deployment for SPAs.**  
> **No full-stack frameworks. No infrastructure headaches. Just ship.**

---

## 🤯 Why GoDeploy?

If you're building a **Single Page Application (SPA)**, chances are you've hit one of these:

- **"I don't want to use Next, Nuxt or Remix just to deploy a React/Vue app."**
- **"I hate dealing with infrastructure"**
- **"I just want to ship my app fast."**

👉 **GoDeploy is for you.**  
Package **any SPA** into a **production-ready Docker + Nginx container** in **minutes**, with **zero server config** and **no framework lock-in**.

---

## ✨ Features

### ✅ 1. Simplified SPA Deployment

No more fiddling with Dockerfiles or Nginx configs. Go from built assets to deploy ready in seconds.

```bash
godeploy deploy
```

➡️ **Generates:**

- Dockerfile
- Nginx config
- Your app, ready to ship

---

### ✅ 2. Zero Infrastructure Headaches

Test and deploy without writing any server config or understanding container orchestration.

```bash
godeploy serve
```

➡️ Spin up your SPA **locally in Docker**, instantly previewing your production setup.

---

### ✅ 3. Performance-First Without Overhead

Out-of-the-box Nginx config with:

- **Optimized cache headers** (for hashed filenames like `app.234sd.js`)
- **Efficient static file serving**
- **HTML5 history mode routing**

⚡ **SSR-like delivery speeds**, without SSR complexity.

---

### ✅ 4. Use Any Frontend Stack

React, Vue, Angular, Svelte — if it builds to static files, it works. No full-stack lock-in, **just deploy your frontend.**

```bash
npm run build  # or any build tool
godeploy init
```

---

### ✅ 5. Multi-SPA Support, Easy Routing

Host **multiple SPAs under one domain**, each on its own route, configured via `spa-config.json`.

```json
{
  "default_app": "auth",
  "apps": [
    { "name": "auth", "source_dir": "dist" },
    { "name": "dashboard", "source_dir": "dashboard-dist" }
  ]
}
```

➡️ Auto-routes to `/`, `/auth/`, `/dashboard/`.

---

### ✅ 6. Quick to Learn, Fast to Ship

Forget complex docs. GoDeploy is a **3-command workflow**:

```bash
godeploy init    # Scaffold config
godeploy serve   # Test locally
godeploy deploy  # Package for production
```

---

## 🚀 Quick Start

### 1. Install GoDeploy

```bash
go install github.com/audetic/godeploy/cmd/godeploy@latest
```

Or build from source:

```bash
git clone https://github.com/audetic/godeploy.git
cd godeploy && go build -o godeploy ./cmd/godeploy
```

---

### 2. Build Your SPA

```bash
npm run build  # React, Vue, Angular, etc.
```

---

### 3. Initialize GoDeploy

```bash
godeploy init
```

➡️ Edit `spa-config.json` to point to your build directory (e.g., `dist` or `build`).

---

### 4. Test Locally in Docker

```bash
godeploy serve
```

➡️ Visit: [http://localhost:8082](http://localhost:8082)

---

### 5. Generate Deploy-Ready Artifacts

```bash
godeploy deploy
```

➡️ Creates `/deploy` with:

- Dockerfile
- Nginx config
- SPA files

---

### 6. Run in Production Anywhere Docker Runs

```bash
cd deploy
docker build -t my-app .
docker run -p 80:80 my-app
```

---

## 🔧 Full CLI Reference

| Command                              | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `godeploy init`                      | Create default `spa-config.json`                    |
| `godeploy init --force`              | Overwrite existing config                           |
| `godeploy serve`                     | Serve SPA locally via Docker (port 8082)            |
| `godeploy serve --port <port>`       | Use custom port                                     |
| `godeploy serve --image-name <name>` | Use custom Docker image name                        |
| `godeploy deploy`                    | Generate deployable Docker + Nginx setup            |
| `godeploy deploy --output <dir>`     | Output to custom directory (default: `deploy/`)     |
| `godeploy --config <file>`           | Use custom config file (default: `spa-config.json`) |

---

## 📈 Advanced Features

- **Multi-SPA on one domain** — [See Advanced Config](docs/advanced-configuration.md)
- **Localization auto-routing** for `/locales/`
- **Hashed asset handling** for immutable caching
- **Custom output directories** for flexible pipelines

---

## ✅ Requirements

- Go 1.16+
- Docker (for `serve` + `deploy`)

---

## ⚡ TL;DR

> **GoDeploy helps SPA devs ship fast without being forced into full-stack frameworks.**

- 🎯 Focus on **your app**, not deployment
- 🔥 No Nginx or Dockerfile writing
- 🚀 From `npm run build` to deployed container in minutes

---

## 📖 Learn More

- [Advanced Multi-SPA & Custom Config](docs/advanced-configuration.md)

---

## 📝 License

MIT
