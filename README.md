# GoDeploy — Effortless Web App Packaging & Deployment
[![CI](https://github.com/matsilva/godeploy/actions/workflows/go.yml/badge.svg)](https://github.com/matsilva/godeploy/actions/workflows/go.yml)
[![Release: Automated with xrelease](https://img.shields.io/badge/Release-Automated%20with%20xrelease-blueviolet?logo=github&logoColor=white)](https://github.com/matsilva/xrelease)

GoDeploy makes it simple to package and serve browser-based applications as production-ready Docker + Nginx containers. Ship any static frontend — React, Vue, Angular, Svelte, client-side games, static sites like blogs — without SSR or complex infrastructure.

## About

GoDeploy is designed to make deploying your web applications fast and straightforward. Package your app into a Docker + Nginx container for self-hosting or deploy directly to GoDeploy’s zero-infrastructure hosting.

- OSS CLI for self-hosted deployments.
- SaaS option for fast, zero-config hosting with HTTPS and global CDN.

## OSS Features

- Browser-first deployment: Supports any app that can run in the browser (SPAs, client-side JS games, static sites, etc.).
- Framework agnostic: Works with React, Vue, Angular, Svelte, and more.
- Simple packaging: Creates a Docker + Nginx setup.
- Local preview: Serve your app locally in a Docker container.
- Performance optimized: Proper cache control and hashing for optimal browser performance. Fast and secure with global CDN support.

## Pro Features

- Zero-infrastructure hosting: Instantly deploy to GoDeploy’s servers.
- Automatic HTTPS: Secure, live URL with zero configuration.
- Global CDN: Fast, reliable static file delivery.
- Multi-app support: Serve multiple apps under one domain.

## Quick Start

1. Install GoDeploy

```bash
curl -sSL https://install.godeploy.app/now.sh | bash
```

2. Build your app

```bash
npm run build
```

3. Deploy

```bash
godeploy deploy --project my-app
```

Your app is live at:

```
https://my-app-12345.godeploy.app
```

Or if you are using the OSS

3.1 Package your app into a docker container

```bash
godeploy package
```

Your app's Dockerfile and assets are now available in `./deploy` directory.
Deploy your container to where ever you'd like. We'd recommend digital ocean for $5/month.

## Why GoDeploy?

| Problem                      | GoDeploy Solution                |
| ---------------------------- | -------------------------------- |
| Complex deployment processes | One-command deploy               |
| Full-stack platform lock-in  | Works with any browser-based app |
| Server setup and management  | Managed, zero-config hosting     |
| Setting up HTTPS and CDN     | Automatic with GoDeploy          |

## Pro and OSS Comparison

| Feature                           | OSS | Pro (SaaS) |
| --------------------------------- | --- | ---------- |
| Self-hosting with Docker          | Yes | No         |
| Instant deploy with HTTPS and CDN | No  | Yes        |
| Automatic subdomains              | No  | Yes        |
| Multi-app support                 | Yes | Yes        |

## OSS FAQ

**What type of performance can I expect for my SPA using Nginx?**
Running your SPA on a $5 DigitalOcean droplet with Nginx can deliver impressive performance, thanks to Nginx's efficiency in handling static content. Example stats from similar setups include:

- **Requests per second:** Over 10,000 req/sec for static file serving.
- **Response time:** Typically under 10ms for cached content.
- **Throughput:** Handles thousands of concurrent connections without degradation.
- **CPU usage:** Minimal due to Nginx's asynchronous, event-driven architecture.

This makes GoDeploy highly suitable for content-heavy SPAs, client-side games, and static websites with high traffic, without the need for expensive infrastructure.

**How is GoDeploy better than putting your files in an S3 bucket?**
While S3 can host static files, GoDeploy offers more robust application serving through Nginx, including features like caching, automatic HTTPS, and routing. Additionally, GoDeploy handles multi-app configurations under one domain, making it ideal for dashboards, admin panels, and other multi-SPA setups. With GoDeploy, you get both local development support and global CDN-backed production hosting without configuring AWS services manually.

**Why use Nginx?**
Nginx is a high-performance web server that excels at serving static content. It efficiently handles large numbers of concurrent connections and provides fast content delivery, making it an ideal choice for static web apps. Additionally, it supports caching and reverse proxying, further improving performance and scalability.

**Do I need to rewrite my app to use GoDeploy?**
No. GoDeploy works with any web app that builds to static files.

**What makes GoDeploy different from Vercel/Netlify?**
GoDeploy focuses on static web app deployment, offering simplicity without SSR.

**Can I deploy to my own server?**
Yes. Use the OSS CLI to package your app as a Docker container.

## Pro FAQ

**How does GoDeploy handle HTTPS?**
GoDeploy automatically provisions HTTPS certificates through Let's Encrypt, ensuring your app is secure by default without any manual configuration.

**How can I manage multiple apps with Pro?**
With Pro, each project is treated as a separate app and gets its own domain or subdomain. This setup is ideal when your apps need to be hosted independently or have different configurations. In contrast, the OSS version supports serving multiple apps from the same origin domain, making it easier to host multiple SPAs together.

**What kind of analytics are available with GoDeploy?** GoDeploy provides analytics to track deployment success and usage. More advanced DORA related analytics are planned for future releases.
