# GoDeploy — Deploy Your Web Apps to the Cloud Instantly

[![CI](https://github.com/matsilva/godeploy/actions/workflows/go.yml/badge.svg)](https://github.com/matsilva/godeploy/actions/workflows/go.yml)
[![Release: Automated with xrelease](https://img.shields.io/badge/Release-Automated%20with%20xrelease-blueviolet?logo=github&logoColor=white)](https://github.com/matsilva/xrelease)

Deploy your Single Page Applications (SPAs) to the cloud in seconds with GoDeploy - the simplest way to get your frontend applications online.

## 🚀 Features

- **Instant Deployment**: Deploy your SPA with a single command
- **Zero Configuration**: Works out of the box with React, Vue, Angular, and other frameworks
- **Automatic HTTPS**: SSL certificates provisioned automatically
- **Global CDN**: Your apps are served from edge locations worldwide
- **Multi-App Support**: Deploy multiple SPAs from a single configuration
- **Authentication**: Secure account-based deployments
- **Custom Domains**: Connect your own domains (coming soon)
- **Team Collaboration**: Multi-user support (coming soon)

## 📦 Installation

### macOS/Linux

```bash
curl -sSL https://install.godeploy.app/now.sh | bash
```

### Manual Installation

Download the latest binary from our [releases page](https://github.com/silvabyte/godeploy/releases) and add it to your PATH.

## 🏃‍♂️ Quick Start

### 1. Sign Up

Create your GoDeploy account:

```bash
godeploy auth sign-up
```

### 2. Initialize

In your project directory, create a configuration file:

```bash
godeploy init
```

This creates a `godeploy.config.json` file:

```json
{
  "apps": [
    {
      "name": "yourAppName",
      "source_dir": "dist",
      "description": "Your application description",
      "enabled": true
    }
  ]
}
```

### 3. Build Your App

Build your SPA using your framework's build command:

```bash
# React/Vue/Angular
npm run build

# Or your framework's build command
```

### 4. Deploy

Deploy your application to the cloud:

```bash
godeploy deploy
```

Your app is now live at `https://yourAppName-12345.godeploy.app`! 🎉

## 📖 Configuration

### Basic Configuration

The `godeploy.config.json` file defines your deployment settings:

- `name`: Your application's name (used in the deployment URL)
- `source_dir`: The directory containing your built files (e.g., `dist`, `build`)
- `description`: A brief description of your application
- `enabled`: Whether the app should be deployed

### Multi-App Configuration

Deploy multiple SPAs from a single project:

```json
{
  "apps": [
    {
      "name": "main-app",
      "source_dir": "apps/main/dist",
      "enabled": true
    },
    {
      "name": "admin-panel",
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

## 🔐 Authentication

### Login

```bash
godeploy auth login
```

### Check Status

```bash
godeploy auth status
```

### Logout

```bash
godeploy auth logout
```

## 📝 Commands

| Command                            | Description                         |
| ---------------------------------- | ----------------------------------- |
| `godeploy init`                    | Initialize a new configuration file |
| `godeploy auth sign-up` | Create a new GoDeploy account |
| `godeploy auth login`              | Authenticate with your account      |
| `godeploy auth status`             | Check authentication status         |
| `godeploy auth logout`             | Log out from your account           |
| `godeploy deploy`                  | Deploy your SPA to the cloud        |
| `godeploy deploy --project <name>` | Deploy a specific project           |
| `godeploy version`                 | Display the CLI version             |

## 🌟 Why GoDeploy?

### Simple

No complex configurations, build steps, or infrastructure management. Just build and deploy.

### Fast

Global CDN ensures your app loads quickly for users worldwide with edge caching and optimized delivery.

### Secure

Automatic HTTPS with SSL certificates keeps your app and users safe.

### Reliable

Enterprise-grade infrastructure with 99.9% uptime SLA.

### Performance Optimized

- Automatic cache control headers for optimal browser caching
- Content hashing for efficient updates
- Gzip compression for faster downloads
- Global edge locations for low latency

## 🎯 Perfect For

- **Single Page Applications**: React, Vue, Angular, Svelte, and more
- **Static Sites**: Documentation, blogs, landing pages
- **Client-Side Games**: JavaScript games that run in the browser
- **Dashboards**: Admin panels and data visualization apps
- **Portfolio Sites**: Showcase your work with fast, reliable hosting

## 💳 Pricing

- **Free Tier**: Perfect for personal projects and testing
- **Pro**: $9/month for production apps with custom domains
- **Team**: $29/month for collaboration features
- **Enterprise**: Custom pricing for large-scale deployments

## 🤝 Support

- **Email**: support@godeploy.app
- **Issues**: [GitHub Issues](https://github.com/silvabyte/godeploy/issues)

## 🚧 Roadmap

- [x] Core deployment functionality
- [x] Authentication system
- [x] Multi-app support
- [ ] Custom domains
- [ ] Environment variables
- [ ] Team collaboration
- [ ] Analytics dashboard
- [ ] Rollback capabilities
- [ ] Build hooks and CI/CD integration
- [ ] Edge functions

## 📄 License

Copyright © 2024 GoDeploy. All rights reserved.

---

Built with ❤️ for developers who want to ship fast.

