# Custom Domains

This guide covers setting up custom domains for your GoDeploy projects.

## Overview

By default, your project is available at:

```
https://<project-name>.godeploy.app
```

You can add a custom domain to serve your app from your own domain:

```
https://www.example.com
```

## Prerequisites

- A deployed project on GoDeploy
- Access to your domain's DNS settings
- A domain you own or control

## Setup Process

### 1. Add Domain in Dashboard

1. Go to your project in the GoDeploy Dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Custom Domain**
4. Enter your domain (e.g., `www.example.com`)
5. Click **Add Domain**

### 2. Configure DNS

After adding the domain, you'll see a CNAME target:

```
CNAME Target: godeploy-nginx-xxx.ondigitalocean.app
```

Add a CNAME record in your DNS provider:

| Type  | Name | Value                                 |
| ----- | ---- | ------------------------------------- |
| CNAME | www  | godeploy-nginx-xxx.ondigitalocean.app |

### 3. Wait for Propagation

DNS changes can take up to 48 hours to propagate, though usually it's much faster (5-30 minutes).

Check propagation status:

```bash
dig www.example.com CNAME
```

### 4. SSL Certificate

Once DNS is configured, GoDeploy automatically provisions an SSL certificate via Let's Encrypt. This typically takes 1-5 minutes after DNS propagation.

## Domain Types

### Subdomain (Recommended)

```
www.example.com
app.example.com
```

Use a CNAME record pointing to the GoDeploy target.

### Apex Domain

```
example.com (no www)
```

Apex domains require special handling since CNAME records aren't allowed at the root. Options:

1. **ALIAS/ANAME Record** - If your DNS provider supports it
2. **Redirect** - Redirect apex to www subdomain

#### Apex with ALIAS Record

Some DNS providers (Cloudflare, DNSimple, etc.) support ALIAS records:

| Type  | Name | Value                                 |
| ----- | ---- | ------------------------------------- |
| ALIAS | @    | godeploy-nginx-xxx.ondigitalocean.app |

#### Apex with Redirect

If ALIAS isn't available, set up a redirect:

1. Add CNAME for `www` subdomain
2. Configure redirect from `example.com` → `www.example.com`

Most registrars offer this as "URL forwarding" or "redirect."

## API Configuration

### Add Domain via API

```http
POST /api/domains
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid",
  "domain": "www.example.com"
}
```

Response:

```json
{
  "domain": "www.example.com",
  "status": "pending",
  "cname_target": "godeploy-nginx-xxx.ondigitalocean.app",
  "ssl_status": "pending"
}
```

### Check Domain Status

```http
GET /api/domains
Authorization: Bearer <token>
```

Response:

```json
{
  "data": [
    {
      "domain": "www.example.com",
      "project_id": "uuid",
      "status": "active",
      "ssl_status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Remove Domain

```http
DELETE /api/domains/www.example.com
Authorization: Bearer <token>
```

## Domain Status

| Status      | Description                                 |
| ----------- | ------------------------------------------- |
| `pending`   | Domain added, waiting for DNS configuration |
| `verifying` | DNS configured, verifying ownership         |
| `active`    | Domain is live and serving traffic          |
| `error`     | Configuration error (check DNS)             |

## SSL Status

| Status         | Description                     |
| -------------- | ------------------------------- |
| `pending`      | Waiting for DNS verification    |
| `provisioning` | Certificate being issued        |
| `active`       | SSL certificate active          |
| `error`        | Certificate provisioning failed |

## DNS Provider Guides

### Cloudflare

1. Go to DNS settings
2. Add record:
   - Type: CNAME
   - Name: www (or subdomain)
   - Target: godeploy-nginx-xxx.ondigitalocean.app
   - Proxy status: DNS only (gray cloud)

**Important:** Disable Cloudflare proxy (orange cloud) initially. You can enable it after SSL is provisioned.

### Namecheap

1. Go to Domain List → Manage → Advanced DNS
2. Add new record:
   - Type: CNAME Record
   - Host: www
   - Value: godeploy-nginx-xxx.ondigitalocean.app
   - TTL: Automatic

### GoDaddy

1. Go to DNS Management
2. Add record:
   - Type: CNAME
   - Name: www
   - Value: godeploy-nginx-xxx.ondigitalocean.app
   - TTL: 1 Hour

### Route 53 (AWS)

1. Go to Hosted Zones → Your domain
2. Create record:
   - Record name: www
   - Record type: CNAME
   - Value: godeploy-nginx-xxx.ondigitalocean.app
   - TTL: 300

## Troubleshooting

### Domain Not Resolving

1. Verify CNAME record is correct:

   ```bash
   dig www.example.com CNAME
   ```

2. Check for typos in the CNAME target

3. Wait for DNS propagation (up to 48 hours)

### SSL Certificate Not Provisioning

1. Ensure DNS is properly configured
2. Check domain status in dashboard
3. Verify no CAA records blocking Let's Encrypt:
   ```bash
   dig example.com CAA
   ```

### "Domain Already in Use" Error

The domain is already configured for another project. Remove it from the other project first.

### Mixed Content Warnings

After adding SSL, ensure all resources use HTTPS:

- Update hardcoded HTTP URLs to HTTPS
- Use protocol-relative URLs (`//example.com/...`)
- Use relative paths where possible

## Best Practices

### Use www Subdomain

Prefer `www.example.com` over `example.com`:

- Easier DNS configuration (CNAME vs ALIAS)
- Better cookie handling
- More flexible for future changes

### Set Up Redirects

Redirect non-www to www (or vice versa) for consistency:

- `example.com` → `www.example.com`
- Prevents duplicate content issues
- Better user experience

### Monitor SSL Expiration

GoDeploy automatically renews SSL certificates. If you see expiration warnings:

1. Check domain status in dashboard
2. Verify DNS is still correctly configured
3. Contact support if issues persist

## Related Documentation

- [CLI Usage](cli-usage.md) - Deploying via CLI
- [API Reference](../api/reference.md) - Domain API endpoints
- [Architecture Overview](../architecture/overview.md) - How domains work
