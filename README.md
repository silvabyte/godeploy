# 🚀 GoDeploy — Effortless SPA Packaging & Deployment

> **Simple, fast, and flexible Docker + Nginx containerization for SPAs.**  
> **No full-stack frameworks. No infrastructure headaches. Just ship.**

---

## ✨ What Is GoDeploy?

GoDeploy makes it **dead-simple to package and serve SPAs (Single Page Applications)** as production-ready Docker + Nginx containers.  
Ship any static frontend — **React, Vue, Angular, Svelte** — without SSR or complex infrastructure.

- **OSS CLI** to **self-host** your SPAs in Docker.
- **Optional SaaS** to deploy instantly to GoDeploy’s zero-infrastructure hosting.  
  👉 [See `godeploy deploy` docs for SaaS users →](docs/deploy.md)

## ⚡ Quick Start — Self-Hosted (OSS)

1️⃣ **Install GoDeploy**

```bash
curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash
# OR
go install github.com/audetic/godeploy/cmd/godeploy@latest
```

2️⃣ **Build your SPA**

```bash
npm run build  # React, Vue, Angular, etc.
```

3️⃣ **Init & Configure**

```bash
godeploy init
```

Edit `godeploy.config.json` to set `source_dir` to your app's production build folder, eg: `dist`

```json
{ "apps": [{ "name": "your-app", "source_dir": "dist", "path": "/", "description": "Single application", "enabled": true }] }
```

4️⃣ **Run Locally**

```bash
godeploy serve
```

➡️ [localhost:8082](http://localhost:8082)

5️⃣ **Package & Deploy**

```bash
godeploy package
cd deploy && docker build -t my-app . && docker run -p 80:80 my-app
```

Done. 🚀

---

## 🎯 Examples

Want to see GoDeploy in action? Check out our example implementations:

- **[Multi-App Demo](examples/multi-app)** - Deploy multiple SPAs under one domain:

  - Home app at `/`
  - Dashboard at `/dashboard`
  - Auth portal at `/auth`

- **[Single-App Demo](examples/single-app)** - Basic single SPA deployment

To run the demos:

```bash
# For multi-app demo
cd examples/multi-app && make run-demo

# For single-app demo
cd examples/single-app && make run-demo
```

See [examples/README.md](examples/README.md) for detailed instructions and prerequisites.

---

## 🔧 Full CLI Reference

| Command                           | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `godeploy init`                   | Scaffold default `godeploy.config.json`           |
| `godeploy serve`                  | Serve SPA locally via Docker (default: port 8082) |
| `godeploy package`                | Create container-ready Docker + Nginx setup       |
| `godeploy auth login --email <e>` | (SaaS) Authenticate for `godeploy deploy`         |
| `godeploy deploy`                 | (SaaS) Instantly deploy to GoDeploy hosting       |

> ℹ️ **Self-hosting?** Only `init`, `serve`, and `package` needed.  
> 💥 **Want zero-infra hosting?** Use `godeploy deploy` — see below!

---

## ✅ Requirements

- **Go 1.16+**
- **Docker** (for `serve` and `package`)

---

## 🌐 **Instant SPA Hosting with `godeploy deploy` (SaaS)**

> **Don’t want to manage servers?** Use GoDeploy’s hosted service.  
> Get a live, HTTPS, CDN-backed URL in seconds.

```bash
godeploy auth login --email=you@example.com  # First time only
godeploy deploy
```

✅ Example:

```
Successfully deployed!
🌍 URL: https://my-app.godeploy.app
```

➡️ [Read Full Deploy Docs →](docs/deploy.md)

---

## 🤯 Why Use GoDeploy?

| Frustration                             | GoDeploy Solution                         |
| --------------------------------------- | ----------------------------------------- |
| "I don't want Next.js/Remix for static" | Pure static SPA deploy, no SSR required   |
| "I hate writing Docker + Nginx config"  | Auto-generated container and server setup |
| "I just want to ship fast"              | One command to package, serve, or deploy  |
| "I need multiple SPAs under one domain" | Built-in multi-SPA routing in config      |

---

## ✨ Features at a Glance

### ✅ 1. **Fast SPA Containerization**

Go from build to container-ready:

```bash
godeploy package
```

➡️ Output:

- Dockerfile
- Nginx config
- Ready-to-ship SPA

---

### ✅ 2. **Local Docker Preview**

Instant production-like local preview:

```bash
godeploy serve
```

---

### ✅ 3. **Raw Nginx Performance**

- **50,000+ req/sec** static file serving.
- **Optimized cache headers**.
- **HTML5 history mode routing**.
- CDN-friendly — works perfectly with Cloudflare, Fastly, etc.

---

### ✅ 4. **Framework Agnostic**

Works with any SPA stack:

- React, Vue, Angular, Svelte, Solid, Astro (static mode).
- No full-stack lock-in.

---

### ✅ 5. **Multi-SPA Support (Monorepo Friendly)**

Serve multiple SPAs under one domain:

```json
{
  "apps": [
    { "name": "main", "source_dir": "dist", "path": "/" },
    { "name": "admin", "source_dir": "admin-dist", "path": "/admin" }
  ]
}
```

## 📖 More Resources

- [Advanced Multi-SPA Config](docs/advanced-configuration.md)
- [Deploy Command Docs (SaaS)](docs/deploy.md)

---

## 📝 License

MIT

---

## ⭐️ Support the Project

If you find GoDeploy useful:

- ⭐️ [Star us on GitHub](https://github.com/matsilva/godeploy)
- Share with other frontend devs

---

> **GoDeploy — Package and ship SPAs like it's 2017. No SSR, no drama.**
