# ⚙️ Advanced Configuration — GoDeploy

Level up your SPA containerization with **multi-app support**, **custom Docker output**, and **fine-tuned CLI options** — all without extra DevOps overhead.

---

## 🚀 Multi-SPA Configuration

Host **multiple SPAs under one domain**, each on its own route — great for dashboards, admin panels, or microsites.

### Example `spa-config.json`

```json
{
  "apps": [
    {
      "name": "main",
      "source_dir": "dist",
      "path": "/",
      "description": "Main application (served at root)",
      "enabled": true
    },
    {
      "name": "dashboard",
      "source_dir": "dashboard-dist",
      "path": "app",
      "description": "User dashboard app",
      "enabled": true
    }
  ]
}
```

### Configuration Properties

| Property      | Description                                                                  | Required |
| ------------- | ---------------------------------------------------------------------------- | -------- |
| `name`        | Unique identifier for the app                                                | Yes      |
| `source_dir`  | Directory containing built SPA files                                         | Yes      |
| `path`        | URL path for the app (use "/" for root, defaults to `name` if not specified) | No       |
| `description` | Human-readable description                                                   | No       |
| `enabled`     | Whether the app is enabled                                                   | Yes      |

### Automatic Routes

| App Name    | URL Paths |
| ----------- | --------- |
| `main`      | `/`       |
| `dashboard` | `/app/`   |

---

## 🛠️ CLI Options

### 🌍 Global Option

| Option                       | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `--config="spa-config.json"` | Use a custom config file (default: `spa-config.json`) |

---

### 🧪 Serve Command

Run and preview SPAs **locally in Docker**.

```bash
godeploy serve [options]
```

| Option                        | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `--port=8082`                 | Set custom port (default: `8082`)               |
| `--image-name="custom-image"` | Use custom Docker image name                    |
| `--output="deploy"`           | Set output folder for generated container files |

---

### 📦 Package Command

Package everything for production — Docker, Nginx, assets.

```bash
godeploy package [options]
```

| Option              | Description                           |
| ------------------- | ------------------------------------- |
| `--output="deploy"` | Output directory (default: `deploy/`) |

---

### ⚙️ Init Command

Scaffold a default config quickly.

```bash
godeploy init [options]
```

| Option        | Description                          |
| ------------- | ------------------------------------ |
| `-f, --force` | Overwrite existing `spa-config.json` |

---

## ✅ Complete CLI Reference

| Command                              | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `godeploy init`                      | Create default `spa-config.json`                    |
| `godeploy init --force`              | Overwrite existing config                           |
| `godeploy serve`                     | Serve SPA locally via Docker (port 8082)            |
| `godeploy serve --port <port>`       | Use custom port                                     |
| `godeploy serve --image-name <name>` | Use custom Docker image name                        |
| `godeploy package`                   | Generate containerized Docker + Nginx setup         |
| `godeploy package --output <dir>`    | Output to custom directory (default: `deploy/`)     |
| `godeploy --config <file>`           | Use custom config file (default: `spa-config.json`) |

---

## 📂 Example: Custom Output Directory

```bash
godeploy package --output="custom-output"
```

➡️ Container files will be created in `custom-output/`.

---

## 🔑 Feature Recap

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
➡️ After running `godeploy package`, **edit the generated `nginx.conf`** before building your Docker image.

---

## 🔍 How It Works

### 1. **Config-Driven, Zero-Code Setup**

- Define each SPA and source directory in `spa-config.json`.
- Supports **multi-app routing** out of the box.

---

### 2. **Automatic Asset Handling**

- Detects and serves **hashed assets** (e.g., `app.234sd.js`) with proper cache-busting.
- Injects **optimized cache headers** for performance.

---

### 3. **Path-Based Routing**

- Default app on `/`, others on `/[app-name]/`.
- Fully supports **HTML5 history mode** for clean URLs.

---

### 4. **Localization Support**

- Serves locale files under `/[app-name]/locales/`.
- Auto-redirects `/locales/` requests to the correct app's locales.

---

## 🧵 Nginx Configuration

Auto-generated **Nginx config** does all the heavy lifting:

- SPA routing with fallback for client-side navigation.
- Static asset caching (hashed filenames + cache headers).
- Localization file serving.
- Redirect `/` to the default app.

> Want to tweak it? Just edit `deploy/nginx.conf` after running `godeploy package`.

---

## 🐳 Dockerfile Overview

Generated `Dockerfile` includes:

| Layer          | Detail                                     |
| -------------- | ------------------------------------------ |
| **Base Image** | `nginx:1.13-alpine` (lightweight and fast) |
| **Tools**      | Minimal (bash, curl, jq) for flexibility   |
| **Assets**     | Copies Nginx config + SPA files            |
| **Ports**      | Exposes port `80`                          |
| **Entrypoint** | Starts optimized Nginx server              |

---

## ⚡ Example: Custom Output Directory

```bash
godeploy package --output custom-output
```

➡️ Container files will be created in `
