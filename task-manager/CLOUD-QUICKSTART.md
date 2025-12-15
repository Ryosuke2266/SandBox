# Quick Start: Deploy to Cloud (Access from Anywhere)

This is the **fastest way** to get your Task Manager accessible from any laptop.

## Step 1: Choose Your Method

### 🚀 Easiest: Railway (Recommended)
**Time: 10 minutes | Cost: Free tier available**

1. **Sign up:** https://railway.app/ (use GitHub login)

2. **Deploy:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo and the `claude/portable-task-manager` branch
   - Set root directory: `task-manager/backend`

3. **Set Environment Variable:**
   - Go to Variables tab
   - Add: `AUTH_TOKEN` = (generate random string)
   - Generate token: Open terminal and run:
     ```bash
     openssl rand -hex 32
     ```
     Or use: https://generate-random.org/api-token-generator

4. **Get Your URL:**
   - Railway will give you a URL like `https://your-app.railway.app`
   - That's it! Access from any browser

### 🔧 Alternative: Render
**Time: 15 minutes | Cost: Free tier available**

1. Sign up: https://render.com/
2. Deploy backend as "Web Service"
3. Deploy frontend as "Static Site"
4. See DEPLOYMENT.md for detailed steps

---

## Step 2: Access from Any Laptop

1. **Open browser** on any laptop
2. **Go to your deployed URL:**
   ```
   https://your-app.railway.app
   ```
3. **Use the app!** Your auth token is stored in the browser

---

## Step 3: Use on Multiple Devices

The authentication token is automatically stored in your browser's local storage.

**First time on a new device:**
The token should persist, but if needed:
1. Press F12 (open developer console)
2. Go to Console tab
3. Run: `localStorage.setItem('auth_token', 'your-token-here')`
4. Refresh page

---

## Important Notes

### Data Persistence
Railway/Render use ephemeral storage by default. Your data might be lost on restart.

**Solution:** Enable persistent volumes in Railway
1. Go to your service → Settings → Volumes
2. Add volume mounted to `/app/backend`
3. Your `tasks.json` will now persist

### Security
- ✅ Your data is protected by authentication token
- ✅ HTTPS is automatic on Railway/Render
- ✅ Only you have the auth token
- ⚠️ Don't share your auth token or deployed URL

### Updating the App
Just push to GitHub:
```bash
git add -A
git commit -m "Updates"
git push
```
Railway will automatically redeploy.

---

## Full Documentation

For more deployment options, see:
- **DEPLOYMENT.md** - Complete deployment guide
- **README.md** - App features and local setup

---

## Quick Comparison

| Method | Setup Time | Free Tier | Best For |
|--------|------------|-----------|----------|
| Railway | 10 min | ✅ Yes | Easiest, recommended |
| Render | 15 min | ✅ Yes | Alternative option |
| Fly.io | 20 min | ✅ Yes | Advanced users |
| VPS | 60 min | ❌ No | Full control |

**My recommendation:** Start with Railway. You can always migrate later.

---

## Need Help?

Common issues:
- **"Unauthorized" error:** Check AUTH_TOKEN matches in backend and browser
- **Data lost on restart:** Enable persistent volumes
- **Can't access from other laptop:** Make sure you're using the deployed URL (not localhost)

See DEPLOYMENT.md for detailed troubleshooting.
