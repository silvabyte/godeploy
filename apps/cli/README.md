# godeploy

Dead simple SPA deployment. Push your React, Vue, or whatever to the cloud. No BS.

## What is this?

A CLI that deploys your single-page apps. Build your app, run one command, get a URL. That's it.

```bash
# Install

curl -sSL https://install.godeploy.com/now.sh | bash

# Deploy
godeploy auth sign-up
godeploy init
npm run build
godeploy deploy
```

Your app is live. No Docker configs. No nginx tuning. No AWS dashboard.

## Why?

Because I missed being able to run a single command be be instantly live.

I built this because I was tired of:

- Writing Dockerfiles for static files
- Configuring nginx for SPAs
- Learning some new cloud provider dashboard
- Ejecting out of SSR frameworks
- Paying $20/month to host 50KB of JavaScript

## Features

- **One command deploy** - `godeploy deploy` and you're done
- **Automatic HTTPS** - SSL certs handled
- **Global CDN** - Your app loads fast everywhere
- **SPA-ready** - Client-side routing just works
- **Fair pricing** - Pay for what you use, not what you might use

## Getting Started

### 1. Install

```bash
curl -sSL https://install.godeploy.com/now.sh | bash
```

### 2. Sign up

```bash
godeploy auth sign-up
```

### 3. Configure

```bash
godeploy init
```

This creates `godeploy.config.json`:

```json
{
  "apps": [
    {
      "name": "my-app",
      "source_dir": "dist",
      "description": "My app",
      "enabled": true
    }
  ]
}
```

### 4. Deploy

```bash
npm run build  # or yarn, pnpm, whatever
godeploy deploy
```

You get a URL like `https://my-app-12345.godeploy.app`

Default deploy timeout is 10 minutes. If your deploys take longer to upload/process, you can increase the client timeout using an environment variable:

```bash
export GODEPLOY_DEPLOY_TIMEOUT=10m   # supports Go duration strings (e.g., 90s, 2m, 15m)
```

## Commands

- `godeploy init` - Create config file
- `godeploy auth sign-up` - Create account
- `godeploy auth login` - Sign in
- `godeploy auth logout` - Sign out
- `godeploy auth status` - Check auth status
- `godeploy deploy` - Ship it
- `godeploy deploy --project NAME` - Deploy specific app
- `godeploy deploy --commit-sha --commit-branch --commit-message --commit-url` - Attach commit metadata (auto-detected from git by default; use `--no-git` to disable)
- `godeploy version` - Version info

## Multi-app Setup

Got multiple SPAs? No problem:

```json
{
  "apps": [
    {
      "name": "marketing-site",
      "source_dir": "apps/marketing/dist",
      "enabled": true
    },
    {
      "name": "app",
      "source_dir": "apps/app/dist",
      "enabled": true
    },
    {
      "name": "admin",
      "source_dir": "apps/admin/dist",
      "enabled": true
    }
  ]
}
```

Each gets its own URL. Deploy all or deploy one.

## Works With

React, Vue, Angular, Svelte, SolidJS, Astro, Next.js (static export), Nuxt (static), Gatsby, Hugo, Jekyll, Eleventy, vanilla JS, whatever generates HTML/CSS/JS.

## Pricing

**$49/year**

That's it. Unlimited app deployments. No usage fees. No surprises.

## Limits

- This is for SPAs and static sites only
- No server-side rendering (yet)
- No edge functions (yet)
- Max file size: 100MB per deployment

## Support

- Issues: [github.com/silvabyte/godeploy](https://github.com/silvabyte/godeploy/issues)
- Email: <support@godeploy.app>

## The Technical Bits

For the curious:

- Go CLI because it's fast and works everywhere
- Uploads to S3-compatible storage
- CloudFront CDN for distribution
- Let's Encrypt for SSL
- Zero-config by design

## License

MIT. Do whatever.

---

Built by [@matsilva](https://github.com/matsilva). I made this because I needed it. Hope you find it useful too.
