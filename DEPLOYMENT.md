# SEO Snap Deployment Guide

This guide covers deploying SEO Snap using Railway.app (for Playwright backend) and Vercel (for frontend).

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel (CDN)   │  ← Fast static content & most APIs
│  - Frontend     │
│  - /api/reports │
│  - /api/export  │
└────────┬────────┘
         │
         │ Proxy /api/audit →
         │
         ▼
┌─────────────────┐
│   Railway.app   │  ← Playwright audits
│  - /api/audit   │
│  - Chromium     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Neon Database  │  ← Shared PostgreSQL
└─────────────────┘
```

## Prerequisites

1. **GitHub Account** - To connect repositories
2. **Railway.app Account** - For Playwright backend
3. **Vercel Account** - For frontend hosting
4. **Neon Account** - For PostgreSQL database
5. **OpenAI API Key** - For AI recommendations

## Step 1: Set Up Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project: `seo-snap`
3. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this handy - you'll use it for both Railway and Vercel

## Step 2: Deploy to Railway (Playwright Backend)

### 2.1 Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select the SEO Snap repository

### 2.2 Configure Environment Variables

In Railway dashboard, go to Variables tab and add:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### 2.3 Deploy

1. Railway will automatically detect the Dockerfile
2. Build will take 5-10 minutes (downloading Playwright browsers)
3. Once deployed, copy your Railway URL: `https://your-app.railway.app`

### 2.4 Initialize Database

After first deployment, run in Railway CLI or dashboard:

```bash
npx prisma db push
```

## Step 3: Deploy to Vercel (Frontend)

### 3.1 Update vercel.json

Before deploying to Vercel, update the `vercel.json` file with your Railway URL:

```json
{
  "rewrites": [
    {
      "source": "/api/audit",
      "destination": "https://YOUR-RAILWAY-URL.railway.app/api/audit"
    }
  ]
}
```

Replace `YOUR-RAILWAY-URL` with your actual Railway deployment URL.

### 3.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your SEO Snap repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (leave as default)

### 3.3 Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
OPENAI_API_KEY=sk-...
RAILWAY_API_URL=https://your-app.railway.app
```

**Important**: Add these to all environments (Production, Preview, Development)

### 3.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site will be live at: `https://your-project.vercel.app`

## Step 4: Verify Deployment

### Test Checklist

1. **Visit Vercel URL** - Frontend should load
2. **Run an audit** - Enter a URL (e.g., `https://example.com`)
3. **Check console** - `/api/audit` should proxy to Railway
4. **View history** - Should load from Neon database
5. **Export report** - Download should work
6. **Compare reports** - Run multiple audits and compare

### Troubleshooting

**Issue: Audit fails with "Cannot find module"**
- Solution: Ensure Railway deployment completed and all environment variables are set

**Issue: "Failed to fetch" error**
- Solution: Check Railway URL in vercel.json is correct
- Verify Railway service is running

**Issue: Database connection errors**
- Solution: Ensure DATABASE_URL is identical in both Railway and Vercel
- Check Neon database is accessible

**Issue: Playwright timeout**
- Solution: Railway deployment may need more resources
- Check Railway logs for specific errors

## Step 5: Custom Domain (Optional)

### Vercel

1. Go to Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `seosnap.com`)
3. Update DNS records as instructed
4. SSL certificate will be provisioned automatically

### Railway

Railway URL is fine for API backend, but if you want a custom domain:

1. Go to Railway dashboard → Settings
2. Add custom domain (e.g., `api.seosnap.com`)
3. Update DNS CNAME record
4. Update `vercel.json` with new domain

## Environment Variables Reference

### Both Platforms (Railway + Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API key for AI recommendations | `sk-proj-...` |

### Vercel Only

| Variable | Description | Example |
|----------|-------------|---------|
| `RAILWAY_API_URL` | Railway backend URL for audit proxy | `https://app.railway.app` |

### Railway Only

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (auto-assigned by Railway) | `3000` |

## Cost Estimates

### Railway
- **Hobby Plan**: $5/month
- Includes 500 execution hours
- ~$0.01 per audit (including Playwright overhead)

### Vercel
- **Hobby Plan**: Free
- 100GB bandwidth
- Unlimited deployments

### Neon
- **Free Tier**: 0.5GB storage, 1 database
- Sufficient for thousands of audits

### OpenAI
- **GPT-4o-mini**: ~$0.01 per audit
- Based on token usage for SEO analysis

**Total**: ~$5-10/month for moderate usage (100-500 audits)

## Monitoring

### Railway Dashboard
- View real-time logs
- Monitor CPU/memory usage
- Track deployment history

### Vercel Analytics
- Page views and performance
- Geographic distribution
- Core Web Vitals

### Neon Dashboard
- Database size and connections
- Query performance
- Backup status

## Scaling Considerations

### When to scale:

1. **>1000 audits/day** - Upgrade Railway plan
2. **Slow audit times** - Add Railway resources or implement queue
3. **Database slow** - Upgrade Neon plan or add caching
4. **High bandwidth** - Upgrade Vercel plan

### Optimization Tips:

1. **Cache reports** - Implement Redis for frequently accessed reports
2. **Queue audits** - Use BullMQ for handling concurrent requests
3. **CDN images** - Store screenshots in Cloudflare R2 or S3
4. **Database indexes** - Add indexes on frequently queried fields

## Support

- **Railway Issues**: [railway.app/help](https://railway.app/help)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate API keys** regularly
3. **Use environment variables** for all secrets
4. **Enable Railway IP restrictions** if needed
5. **Monitor usage** for unusual activity

## Next Steps

After successful deployment:

1. Set up monitoring alerts
2. Configure custom domains
3. Implement rate limiting
4. Add user authentication (optional)
5. Set up automated backups

---

**Deployment Status**:
- ✅ Railway configuration ready
- ✅ Vercel configuration ready
- ✅ Database schema ready
- ✅ Environment variables documented

Ready to deploy! 🚀
