# 🚀 Deploying with GoDeploy

> **Ship faster. Deploy anywhere. Zero infrastructure headaches.**

GoDeploy's `deploy` command transforms how you ship Single Page Applications. No more complex CI/CD pipelines, infrastructure provisioning, or deployment scripts. Just build your app and deploy it with a single command.

## ⚡ Quick Start

```bash
# Install GoDeploy CLI
curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash
```

```bash
# Build your SPA
npm run build

godeploy deploy

# Deploy it instantly
godeploy deploy

# That's it! Your app is live.
```

## 🌟 Why Use GoDeploy Deploy?

### 1. **From Local to Live in Seconds**

Traditional deployment pipelines can take minutes to hours. GoDeploy takes seconds:

```bash
$ godeploy deploy
✅ Successfully deployed!
🌍 URL: https://your-app.godeploy.app
```

### 2. **Zero Infrastructure Knowledge Required**

No need to understand:

- Container orchestration
- Load balancers
- SSL certificates
- CDN configuration
- Cache invalidation

We handle it all for you.

### 3. **Optimized for Frontend Developers**

Built specifically for SPA workflows:

- Automatic HTML5 history mode support
- Proper cache headers for hashed assets
- Global CDN distribution
- Instant cache invalidation

### 4. **Seamless Authentication**

Our intelligent authentication system remembers your email and handles token refreshes automatically:

```bash
# First-time authentication
$ godeploy auth login --email=dev@example.com

# All future deployments - no email needed!
$ godeploy deploy
```

## 📋 Full Command Reference

### Deploy Your SPA

```bash
godeploy deploy [flags]
```

| Flag               | Description                                         |
| ------------------ | --------------------------------------------------- |
| `--project <name>` | Deploy a specific project from your spa-config.json |
| `--config <file>`  | Use a custom config file (default: spa-config.json) |

### Authentication Commands

```bash
# Login (email saved for future use)
godeploy auth login --email=your@email.com

# Check status
godeploy auth status

# Logout (email remains saved)
godeploy auth logout
```

## 🔧 Configuration

GoDeploy uses your `spa-config.json` file to determine what to deploy:

```json
{
  "apps": [
    {
      "name": "main",
      "source_dir": "dist",
      "path": "/",
      "enabled": true
    },
    {
      "name": "dashboard",
      "source_dir": "dashboard/build",
      "path": "admin",
      "enabled": true
    }
  ]
}
```

### Multi-App Deployment

To deploy a specific app from your config:

```bash
godeploy deploy --project dashboard
```

## 🚀 Deployment Workflow

1. **Build your SPA** using your framework's build command:

   ```bash
   npm run build  # or yarn build, etc.
   ```

2. **Deploy with a single command**:

   ```bash
   godeploy deploy
   ```

3. **Share your live URL**:
   ```
   🌍 URL: https://your-app.godeploy.app
   ```

## 🔄 Continuous Deployment

Integrate GoDeploy into your CI/CD pipeline:

```yaml
# GitHub Actions example
deploy:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - name: Install GoDeploy
      run: https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash
    - name: Deploy
      run: godeploy deploy
      env:
        GODEPLOY_TOKEN: ${{ secrets.GODEPLOY_TOKEN }}
```

## 🌐 Custom Domains

Connect your own domain to your GoDeploy app:

1. Deploy your app first:

   ```bash
   godeploy deploy
   ```

2. Visit the [GoDeploy Dashboard](https://dashboard.godeploy.app)

3. Select your app and add your custom domain

4. Update your DNS with the provided CNAME record

## 💡 Pro Tips

### 1. **Instant Previews for Pull Requests**

```bash
# Deploy a PR preview
godeploy deploy --project $(git branch --show-current)
```

### 2. **A/B Testing Made Easy**

```bash
# Deploy variant A
godeploy deploy --project variant-a

# Deploy variant B
godeploy deploy --project variant-b
```

### 3. **Rollback in Seconds**

```bash
# Deploy a specific git tag or commit
git checkout v1.2.3
godeploy deploy
```

## 🔒 Security

- All deployments use HTTPS by default
- Authentication tokens are securely stored
- All assets are served via global CDN with DDoS protection
- Automatic security headers are applied

## 🤔 Troubleshooting

### Authentication Issues

If you encounter authentication problems:

```bash
# Check your status
godeploy auth status

# Re-authenticate if needed
godeploy auth login
```

### Deployment Failures

If deployment fails:

1. Ensure your build directory exists and contains an `index.html` file
2. Check that your app is properly configured in `spa-config.json`
3. Verify your internet connection

## 🎯 What's Next?

- **Environment Variables**: Coming soon in v1.3
- **Deployment Previews**: Automatic preview URLs for each deployment
- **Analytics Dashboard**: Real-time visitor insights
- **Performance Monitoring**: Lighthouse scores and Core Web Vitals tracking

---

**GoDeploy: Deploy like it's 2023, not 2003.**

Need help? Contact us at support@godeploy.app or join our [Discord community](https://discord.gg/godeploy).
