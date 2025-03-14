Here's a **cleaned up and improved version** of your **GoDeploy Quickstart**, focusing on **clearer flow, better formatting, and stronger developer experience (DevX)** — without adding unnecessary verbosity:

---

# 🚀 GoDeploy — Simple SPA Deployment with Docker + Nginx

[![Release: Automated with xrelease](https://img.shields.io/badge/Release-Automated%20with%20xrelease-blueviolet?logo=github&logoColor=white)](https://github.com/matsilva/xrelease)

GoDeploy makes it easy for frontend developers to package and deploy Single Page Applications (SPAs) using Docker and Nginx — with **zero infrastructure headaches**.

---

## 📦 Install GoDeploy

### Option 1: Install via `go install` (recommended)

```bash
go install github.com/audetic/godeploy/cmd/godeploy@latest
```

### Option 2: Build from source

```bash
git clone https://github.com/audetic/godeploy.git
cd godeploy
go build -o godeploy ./cmd/godeploy
```

---

## ⚡ Quick Start

### 1. **Build your SPA**

Use your framework's build command:

```bash
# React / Vite / Vue / Angular
npm run build
```

This creates a `dist/` or `build/` folder (depending on your framework).

---

### 2. **Initialize GoDeploy**

In your project root:

```bash
godeploy init
```

➡️ This creates a `spa-config.json` file.  
🛠️ Edit it to match your app:

```json
{
  "default_app": "myapp",
  "apps": [
    {
      "name": "myapp",
      "source_dir": "dist", // or "build" for React
      "description": "My awesome SPA",
      "enabled": true
    }
  ]
}
```

---

### 3. **Run Locally in Docker**

Test your app in a local Docker container:

```bash
godeploy serve
```

🌐 Visit: [http://localhost:8082](http://localhost:8082)

---

### 4. **Generate Deployment Artifacts**

When ready to deploy:

```bash
godeploy deploy
```

📂 This creates a `deploy/` directory with:

- Dockerfile
- Nginx config
- Your SPA files

---

### 5. **Deploy Anywhere Docker Runs**

```bash
cd deploy
docker build -t myapp .
docker run -p 80:80 myapp
```

✅ Done. Your app is now running in Docker + Nginx.

---

## ⚙️ Common Commands & Options

| Command                                  | Description                         |
| ---------------------------------------- | ----------------------------------- |
| `godeploy serve --port 3000`             | Serve locally on custom port        |
| `godeploy serve --image-name my-image`   | Use a custom Docker image name      |
| `godeploy deploy --output custom-folder` | Set custom output folder for deploy |

---

## ✨ Features

- **⚡ Fast**: Get from code to container in minutes
- **🧪 Local Testing**: Dockerized SPA for local testing
- **🛡️ Production-Ready**: Nginx optimized config, cache headers, hashed assets
- **🌍 Localization**: Auto-detects locale files
- **🚀 Flexible**: Supports multi-SPA setup & custom Nginx config

---

## ✅ Requirements

- Go 1.16+
- Docker

---

## 📚 Advanced Usage

For **multi-SPA**, **custom Nginx config**, and **advanced workflows**, check out the [Advanced Configuration Guide](docs/advanced-configuration.md).

---

## 📄 License

MIT

---

Let me know if you want a **Markdown file** version ready to drop in `README.md`.
