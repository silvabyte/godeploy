# 🚀 **GoDeploy Quick Start — Your First Deploy (Required Setup)**

> **Deploy your SPA with one command — fast, secure, and zero DevOps.**

Welcome to GoDeploy! Let's get your app live — **start to finish in minutes**.

---

## ⚡ **Step 1. Install the GoDeploy CLI**

Run this in your terminal to install GoDeploy:

```bash
curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash
```

---

## ✍️ **Step 2. Log in to Your GoDeploy Account**

Authenticate with your email:

```bash
godeploy auth login --email=you@example.com
```

✅ You'll only need to do this once. GoDeploy remembers you for all future deploys.

---

## ⚙️ **Step 3. Initialize Your Project (Required)**

Run this command to create a `spa-config.json` for your app:

```bash
godeploy init
```

---

## ✏️ **Step 4. Edit Your `spa-config.json` (Important!)**

Open `spa-config.json` in your editor and **customize it to match your app**.

Example template:

```json
{
  "apps": [
    {
      "name": "main", // Name your app (e.g., "main", "dashboard")
      "source_dir": "./dist", // Path to your built files (e.g., "dist" or "build")
      "path": "/", // URL path — "/" for root app
      "description": "My awesome SPA", // Optional description for your app
      "enabled": true // Enable the app for deployment
    }
  ]
}
```

👉 **Be sure to:**

- Set `"source_dir"` to **your build folder** (e.g., `./dist` or `./build`).
- Set `"name"` and `"description"` to identify the app.
- Keep `"enabled": true` for deployment.

> ⚠️ **Important**: The default `"install"` app in the config is just a placeholder — **replace it with your app details**!

---

## 🛠️ **Step 5. Build Your App**

If you haven’t already built your SPA:

```bash
npm run build   # Or yarn build, pnpm build, etc.
```

---

## 🚀 **Step 6. Deploy Your App — Go Live!**

Run this command to deploy:

```bash
godeploy deploy
```

🎉 **That's it!** Your app is now live with HTTPS and CDN.

Example output:

```
✅ Successfully deployed!
🌍 URL: https://your-app.godeploy.app
```

---

## 🔑 **Need Help?**

- **Email**: [support@godeploy.app](mailto:support@godeploy.app)

---

> **GoDeploy: From zero to live in minutes — no AWS, no Netlify, no headaches.**
