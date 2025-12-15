# Deployment Guide - Access Your Task Manager from Anywhere

This guide will help you deploy your Task Manager to the cloud so you can access it from any laptop with internet access.

## Quick Overview

**What you'll do:**
1. Choose a hosting platform (Railway recommended)
2. Set up authentication token
3. Deploy backend and frontend
4. Access from anywhere using your deployed URL

## Option 1: Railway (Recommended - Easiest)

### Why Railway?
- ✅ Free tier available ($5 credit/month)
- ✅ Deploys directly from GitHub
- ✅ Automatic HTTPS
- ✅ Easy to set up

### Step-by-Step Railway Deployment

#### 1. Create a Railway Account
- Go to https://railway.app/
- Sign up with GitHub

#### 2. Prepare Your Repository
```bash
# Make sure all changes are committed
cd task-manager
git add -A
git commit -m "Prepare for deployment"
git push
```

#### 3. Create New Project on Railway
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your SandBox repository
4. Select the `claude/portable-task-manager-01XVp7icr9AfjzAu4m7EVAUo` branch

#### 4. Configure the Backend

1. **Add Root Directory:**
   - Click on your service
   - Go to Settings
   - Set Root Directory: `task-manager/backend`

2. **Set Environment Variables:**
   - Go to Variables tab
   - Add these variables:
     ```
     NODE_ENV=production
     AUTH_TOKEN=<generate-a-strong-random-token>
     ```

   **Generate a strong token:**
   ```bash
   # On Mac/Linux:
   openssl rand -hex 32

   # On Windows (PowerShell):
   -join ((65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

3. **Deploy:**
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - Copy your backend URL (something like `https://your-app.railway.app`)

#### 5. Configure the Frontend

1. **Create a new service** in the same project
2. **Set Root Directory:** `task-manager/frontend`
3. **Set Build Command:** `npm run build`
4. **Set Start Command:** `npx serve -s dist -l $PORT`
5. **Add Environment Variables:**
   ```
   VITE_AUTH_TOKEN=<same-token-as-backend>
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

6. **Deploy and get your frontend URL**

#### 6. Access Your App

Your app is now live! Open the frontend URL in any browser on any device:
- `https://your-frontend.railway.app`

---

## Option 2: Render

### Step-by-Step Render Deployment

#### 1. Create Render Account
- Go to https://render.com/
- Sign up with GitHub

#### 2. Deploy Backend

1. **New > Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** task-manager-backend
   - **Root Directory:** task-manager/backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   AUTH_TOKEN=<your-secure-token>
   ```

5. Click "Create Web Service"
6. Copy your backend URL

#### 3. Deploy Frontend

1. **New > Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name:** task-manager-frontend
   - **Root Directory:** task-manager/frontend
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** dist

4. **Environment Variables:**
   ```
   VITE_AUTH_TOKEN=<same-token-as-backend>
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. Click "Create Static Site"

---

## Option 3: Single Server Deployment (VPS)

If you have a VPS (DigitalOcean, AWS EC2, etc.):

### 1. Install Node.js on Server
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Upload Your Code
```bash
# On your local machine
scp -r task-manager user@your-server-ip:~/
```

### 3. Install Dependencies
```bash
ssh user@your-server-ip
cd task-manager
npm run install-all
```

### 4. Create Environment File
```bash
cd backend
nano .env
```

Add:
```
AUTH_TOKEN=your-secure-token-here
NODE_ENV=production
PORT=3001
```

### 5. Build Frontend
```bash
cd ../frontend
npm run build
```

### 6. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 7. Start the Backend
```bash
cd ../backend
pm2 start server.js --name task-manager
pm2 save
pm2 startup  # Follow the instructions
```

### 8. Install and Configure Nginx

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/task-manager
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve frontend
    root /home/user/task-manager/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Set Up SSL (Optional but Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Using Your Deployed App

### On Any Laptop:

1. **Open your browser**
2. **Go to your deployed URL:**
   - Railway: `https://your-app.railway.app`
   - Render: `https://your-app.onrender.com`
   - VPS: `https://your-domain.com`

3. **The app will authenticate automatically** using the token stored in your browser

### First Time on a New Device:

The auth token is stored in your browser's localStorage, so it persists across sessions on the same device.

If you need to manually set the token:
1. Open browser console (F12)
2. Run: `localStorage.setItem('auth_token', 'your-token-here')`
3. Refresh the page

---

## Security Considerations

### 1. Use a Strong Auth Token
```bash
# Generate a secure random token:
openssl rand -hex 32
```

### 2. Use HTTPS
All deployment platforms (Railway, Render) provide HTTPS automatically.

### 3. Never Commit Your .env Files
Make sure `.env` is in `.gitignore` (already configured).

### 4. Consider Adding IP Whitelisting
If you always use the app from known locations, you can add IP whitelisting to your server.

---

## Data Persistence

### Railway / Render
These platforms have **ephemeral file systems**, meaning your `tasks.json` file will be deleted when the server restarts.

**Solutions:**
1. **Use a database** (recommended for production)
2. **Mount a persistent volume** (available on most platforms)
3. **Use cloud storage** (AWS S3, Google Cloud Storage)

For now, I recommend **Railway's persistent volumes**:
1. Go to your service settings
2. Click "Volumes"
3. Mount to: `/app/backend`
4. This will persist your `tasks.json` file

---

## Cost Comparison

| Platform | Free Tier | Paid Plans Start At |
|----------|-----------|---------------------|
| Railway | $5 credit/month | $5/month |
| Render | 750 hours/month | $7/month |
| Fly.io | 3 VMs (256MB) | $1.94/month |
| DigitalOcean | N/A | $6/month |

**Recommendation:** Start with Railway's free tier. It's perfect for personal use.

---

## Updating Your Deployed App

### Railway/Render (Automatic)
Just push to GitHub:
```bash
git add -A
git commit -m "Update features"
git push
```

Railway/Render will automatically redeploy.

### VPS (Manual)
```bash
ssh user@your-server-ip
cd task-manager
git pull
npm run install-all
pm2 restart task-manager
```

---

## Troubleshooting

### "Unauthorized" Error
- Check that AUTH_TOKEN is set correctly in both backend and frontend
- Check browser console for auth token: `localStorage.getItem('auth_token')`

### Data Not Persisting
- Enable persistent volumes on your hosting platform
- Or switch to a database solution

### Can't Access from Other Laptops
- Make sure you're using the deployed URL, not localhost
- Check that your firewall allows HTTPS connections

---

## Next Steps

Want to add more features?
- **Email notifications** for overdue tasks
- **Real database** (PostgreSQL, MongoDB)
- **User accounts** (multiple users)
- **Mobile app** (React Native)
- **Sync with calendar** (Google Calendar integration)

Let me know what you'd like to add! 🚀
