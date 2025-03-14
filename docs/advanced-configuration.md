# ⚙️ Advanced Configuration — GoDeploy

Take your **Single Page Application (SPA) deployments** to the next level with **multi-SPA support, advanced command options, and custom output directories**.

---

## 🚀 Multi-SPA Configuration

GoDeploy can deploy **multiple SPAs** under a single domain — each on its own route.

### Example `spa-config.json`

```json
{
  "default_app": "auth",
  "apps": [
    {
      "name": "auth",
      "source_dir": "dist",
      "description": "Authentication app",
      "enabled": true
    },
    {
      "name": "dashboard",
      "source_dir": "dashboard-dist",
      "description": "User dashboard app",
      "enabled": true
    }
  ]
}
```

### Resulting Routes

| App Name    | Route            |
| ----------- | ---------------- |
| `auth`      | `/` and `/auth/` |
| `dashboard` | `/dashboard/`    |

> ✅ **Note**: The `default_app` is served on `/` and `/auth/`.

---

## 🛠️ Command Line Options

### 🌍 Global Option

| Option                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `--config="spa-config.json"` | Use custom config file (default: `spa-config.json`) |

---

### 🧪 Serve Command

Run and test SPAs locally in Docker.

```bash
godeploy serve [options]
```

| Option                        | Description                                |
| ----------------------------- | ------------------------------------------ |
| `--port=8082`                 | Set custom port (default: `8082`)          |
| `--image-name="custom-image"` | Use custom Docker image name               |
| `--output="deploy"`           | Set output folder for deployment artifacts |

---

### 🚀 Deploy Command

Generate Nginx configs, Dockerfile, and SPA assets for deployment.

```bash
godeploy deploy [options]
```

| Option              | Description                                   |
| ------------------- | --------------------------------------------- |
| `--output="deploy"` | Set custom output folder (default: `deploy/`) |

---

### ⚙️ Init Command

Create `spa-config.json` interactively.

```bash
godeploy init [options]
```

| Option        | Description                    |
| ------------- | ------------------------------ |
| `-f, --force` | Overwrite existing config file |

---

## ✅ Full Command Reference

| Command                              | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `godeploy init`                      | Create default `spa-config.json`                  |
| `godeploy init --force`              | Overwrite existing `spa-config.json`              |
| `godeploy deploy`                    | Generate deployable Docker/Nginx setup            |
| `godeploy deploy --output <dir>`     | Output deployment files to custom directory       |
| `godeploy serve`                     | Serve SPAs locally in Docker (default port: 8082) |
| `godeploy serve --port <port>`       | Serve on custom port                              |
| `godeploy serve --image-name <name>` | Use custom Docker image name                      |
| `godeploy --config <file>`           | Use custom config file                            |

---

## 🔍 Technical Overview

### 1. **Config-Driven, Zero-Code Setup**

- Define SPAs, source directories, and defaults in `spa-config.json`.
- Multi-app aware, route-based serving (e.g., `/auth/`, `/dashboard/`).

### 2. **Automatic Asset Handling**

- Processes hashed assets (e.g., `index-CgbRfOA8.js`) for cache-busting.
- Injects correct Nginx cache headers and routes.

### 3. **Path-Based Routing**

- Default app served on `/`.
- Other apps mapped to `/[app-name]/`.

### 4. **Localization Support**

- Locale files auto-served under `/[app-name]/locales/`.
- Fallback to default locales if needed.

---

## 🧵 Nginx Configuration

Generated **Nginx config** handles:

- SPA routing and fallback (HTML5 history mode support).
- Static asset caching (immutable hashed filenames).
- Localization file serving.
- Redirect `/` to the default app.

---

## 🐳 Dockerfile Overview

Generated `Dockerfile` includes:

- **Base Image**: `nginx:1.13-alpine`
- **Tools**: Minimal (bash, curl, jq) for runtime flexibility.
- **Assets**: All SPA files and Nginx config copied in.
- **Ports**: Exposes port `80`.
- **Entrypoint**: Runs optimized Nginx config.

---

## ⚡ Example: Custom Deployment Directory

```bash
godeploy deploy --output custom-output
```

➡️ Deployment files (Dockerfile, Nginx config, SPA assets) will be in `custom-output/`.

---

## 🔑 Summary

| Feature               | Supported          |
| --------------------- | ------------------ |
| Single-SPA            | ✅                 |
| Multi-SPA             | ✅                 |
| Custom Output Dir     | ✅                 |
| Custom Docker Image   | ✅                 |
| Custom Ports (serve)  | ✅                 |
| Localization          | ✅ (auto-detected) |
| Hashed Asset Handling | ✅                 |

---

## 💡 Pro Tip

Need more control over Nginx?  
➡️ After running `godeploy deploy`, **edit the generated `nginx.conf`** before building your Docker image.
