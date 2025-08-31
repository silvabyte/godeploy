# 🚀 GoDeploy Quick Start — Deploy Your App in Minutes

> **Deploy your SPA with one command — fast, secure, and zero DevOps.**

Welcome to GoDeploy! Let's get your app live in just a few minutes.

---

## ⚡ Step 1: Install the GoDeploy CLI

Run this in your terminal to install GoDeploy:

```bash
curl -sSL https://install.godeploy.app/now.sh | bash
```

---

## ✍️ Step 2: Create Your Account

Sign up for GoDeploy:

```bash
godeploy auth signup
```

Or if you already have an account:

```bash
godeploy auth login
```

✅ You'll only need to do this once. GoDeploy remembers you for all future deploys.

---

## ⚙️ Step 3: Initialize Your Project

Run this command to create a `godeploy.config.json` for your app:

```bash
godeploy init
```

---

## ✏️ Step 4: Configure Your App

Open `godeploy.config.json` in your editor and customize it to match your app.

Example configuration:

```json
{
  "apps": [
    {
      "name": "my-app",           // Your app name (used in URL)
      "source_dir": "dist",        // Your build folder
      "description": "My awesome SPA",
      "enabled": true
    }
  ]
}
```

👉 **Important settings:**
- `name`: Your app identifier (alphanumeric and hyphens only)
- `source_dir`: Your build folder (e.g., `dist`, `build`, `out`)
- `description`: Brief description of your app

---

## 🛠️ Step 5: Build Your App

Build your SPA using your framework's build command:

```bash
npm run build   # Or yarn build, pnpm build, etc.
```

---

## 🚀 Step 6: Deploy!

Deploy your app to the cloud:

```bash
godeploy deploy
```

🎉 **That's it!** Your app is now live with HTTPS and global CDN.

Example output:
```
✅ Successfully deployed project 'my-app'!
🌍 URL: https://my-app-12345.godeploy.app
```

---

## 📚 Advanced Usage

### Deploy a Specific Project

If you have multiple apps configured:

```bash
godeploy deploy --project admin-panel
```

### Multi-App Configuration

Deploy multiple SPAs from one project:

```json
{
  "apps": [
    {
      "name": "main-site",
      "source_dir": "apps/main/dist",
      "enabled": true
    },
    {
      "name": "admin",
      "source_dir": "apps/admin/dist",
      "enabled": true
    },
    {
      "name": "docs",
      "source_dir": "apps/docs/dist",
      "enabled": true
    }
  ]
}
```

---

## 🔑 Authentication Commands

| Command | Description |
|---------|-------------|
| `godeploy auth signup` | Create a new account |
| `godeploy auth login` | Log in to your account |
| `godeploy auth status` | Check if you're logged in |
| `godeploy auth logout` | Log out |

---

## 💡 Tips

- **Framework Support**: Works with React, Vue, Angular, Svelte, and any static site generator
- **Build First**: Always build your app before deploying
- **Multiple Deploys**: Each deploy creates a new version - no downtime!
- **Custom Domains**: Coming soon!

---

## 🤝 Need Help?

- **Email**: [support@godeploy.app](mailto:support@godeploy.app)
- **GitHub**: [github.com/silvabyte/godeploy](https://github.com/silvabyte/godeploy)

---

> **GoDeploy: Ship faster, worry less.**