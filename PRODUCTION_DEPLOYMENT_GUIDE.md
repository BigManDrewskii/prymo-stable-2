# 🚀 PRYMO Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Required Setup**
- [ ] **Tally Form Configuration**
  - Form ID: `nWWvgN` (already configured)
  - Form fields include email capture
  - Success message configured
  - Test form submission works

- [ ] **Domain & Hosting**
  - Domain purchased and configured
  - SSL certificate ready (automatic with most hosts)
  - DNS records pointing to hosting provider

- [ ] **Environment Variables**
  - Copy `.env.example` to `.env.production`
  - Update `VITE_APP_URL` with your domain
  - Configure analytics IDs (optional)
  - Set contact email addresses

### ✅ **Optional Enhancements**
- [ ] Google Analytics setup
- [ ] Error monitoring (Sentry)
- [ ] Social media image (og-image.png)
- [ ] Custom favicon files

## 🎯 Quick Deployment Options

### **Option 1: Vercel (Recommended - Easiest)**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd prymo-stable-2
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variables from `.env.production`
   - Redeploy if needed

**✅ Done! Your app is live with automatic HTTPS and global CDN.**

### **Option 2: Netlify**

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd prymo-stable-2
   npm run build
   netlify deploy --prod --dir=dist
   ```

**✅ Done! Netlify handles everything automatically.**

### **Option 3: Traditional Hosting (cPanel, etc.)**

1. **Build the Application**
   ```bash
   cd prymo-stable-2
   npm install
   npm run build
   ```

2. **Upload Files**
   - Upload everything from the `dist/` folder to your web root
   - Ensure `.htaccess` or server config handles SPA routing

3. **Server Configuration**
   - All routes should serve `index.html`
   - Enable gzip compression
   - Set proper cache headers

## 🔧 Detailed Deployment Instructions

### **Step 1: Prepare Your Environment**

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/prymo-stable-2.git
   cd prymo-stable-2
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your settings
   ```

3. **Update Configuration**
   ```bash
   # Edit .env.production
   VITE_APP_URL=https://your-domain.com
   VITE_SUPPORT_EMAIL=support@your-domain.com
   VITE_CONTACT_EMAIL=hello@your-domain.com
   ```

### **Step 2: Test Locally**

```bash
# Build and test production version
npm run build
npm run preview

# Test at http://localhost:4173
# Verify Tally form works
# Test authentication flow
```

### **Step 3: Deploy Using Automated Script**

```bash
# Deploy to Vercel
./scripts/deploy.sh --platform vercel

# Deploy to Netlify
./scripts/deploy.sh --platform netlify

# Build Docker image
./scripts/deploy.sh --platform docker

# Deploy to static hosting
./scripts/deploy.sh --platform static --target-dir /var/www/html
```

## 🌐 Platform-Specific Instructions

### **Vercel Deployment**

1. **Automatic Deployment (Recommended)**
   - Connect your GitHub repository to Vercel
   - Vercel auto-deploys on every push to main branch
   - Environment variables managed in dashboard

2. **Manual Deployment**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   ```
   VITE_APP_URL=https://your-domain.vercel.app
   VITE_TALLY_FORM_ID=nWWvgN
   VITE_ENABLE_ANALYTICS=true
   ```

### **Netlify Deployment**

1. **Automatic Deployment**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Manual Deployment**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configuration**
   - `netlify.toml` is already configured
   - Environment variables in site settings

### **Docker Deployment**

1. **Build Image**
   ```bash
   docker build -t prymo:latest .
   ```

2. **Run Container**
   ```bash
   docker run -p 80:80 prymo:latest
   ```

3. **Docker Compose (Optional)**
   ```yaml
   version: '3.8'
   services:
     prymo:
       build: .
       ports:
         - "80:80"
       environment:
         - VITE_APP_URL=https://your-domain.com
   ```

### **Traditional Hosting (cPanel, etc.)**

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload all files from `dist/` folder to public_html/
   - Ensure proper file permissions (644 for files, 755 for directories)

3. **Server Configuration**
   
   **Apache (.htaccess)**
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   
   # Security headers
   Header always set X-Frame-Options "DENY"
   Header always set X-XSS-Protection "1; mode=block"
   Header always set X-Content-Type-Options "nosniff"
   
   # Cache static assets
   <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
     ExpiresActive On
     ExpiresDefault "access plus 1 year"
   </FilesMatch>
   ```

   **Nginx**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## 🔒 Security Configuration

### **Environment Variables (Production)**
```bash
# Required
VITE_APP_URL=https://your-domain.com
VITE_TALLY_FORM_ID=nWWvgN

# Optional but Recommended
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SUPPORT_EMAIL=support@your-domain.com
```

### **Security Headers**
All deployment configurations include:
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content Security Policy (CSP)

### **HTTPS Configuration**
- **Vercel/Netlify**: Automatic HTTPS
- **Traditional Hosting**: Configure SSL certificate
- **Docker**: Use reverse proxy (nginx, Cloudflare)

## 📊 Post-Deployment Verification

### **✅ Functionality Tests**
1. **Landing Page**
   - [ ] Page loads correctly
   - [ ] All buttons work
   - [ ] Tally form opens on click
   - [ ] Responsive design works

2. **Authentication Flow**
   - [ ] Visit `/app` directly → Shows access denied
   - [ ] Complete Tally form → Redirects to `/app`
   - [ ] Refresh `/app` → Remains authenticated
   - [ ] Clear localStorage → Requires re-authentication

3. **Main Application**
   - [ ] Text enhancement works
   - [ ] API settings modal opens
   - [ ] Theme toggle works
   - [ ] All UI components function

4. **Performance**
   - [ ] Page load time < 3 seconds
   - [ ] Lighthouse score > 90
   - [ ] Mobile performance good

### **🔍 Monitoring Setup**

1. **Health Check**
   - Visit: `https://your-domain.com/health`
   - Should show: Status OK, Version, Environment

2. **Analytics (Optional)**
   - Google Analytics tracking
   - Error monitoring with Sentry
   - Performance monitoring

3. **Uptime Monitoring**
   - Set up monitoring service (UptimeRobot, Pingdom)
   - Monitor main domain and `/health` endpoint

## 🚨 Troubleshooting

### **Common Issues**

1. **Tally Form Not Working**
   - Check form ID is correct: `nWWvgN`
   - Verify Tally script loads
   - Check browser console for errors

2. **Authentication Not Persisting**
   - Ensure HTTPS is enabled
   - Check localStorage in browser dev tools
   - Verify no console errors

3. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

4. **Routing Issues**
   - Ensure server redirects all routes to index.html
   - Check .htaccess or nginx configuration
   - Verify base URL configuration

### **Debug Commands**
```bash
# Check build
npm run build

# Test production build locally
npm run preview

# Check for errors
npm run lint

# View build analysis
npm run build -- --analyze
```

## 📞 Support

### **Getting Help**
- Check browser console for errors
- Verify environment variables
- Test locally first
- Check server logs

### **Contact**
- Technical issues: Check troubleshooting section
- Deployment help: Review platform-specific guides
- Custom modifications: Refer to code documentation

---

## 🎉 **You're Ready to Deploy!**

Choose your preferred deployment method above and follow the step-by-step instructions. The application is production-ready with all optimizations, security measures, and monitoring in place.

**Recommended for beginners:** Start with Vercel - it's the easiest and most reliable option.

**For advanced users:** Docker or traditional hosting gives you more control.

Good luck with your deployment! 🚀