# NutriSnap AI - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your API Keys

1. **Supabase** (Database)

   - Visit https://supabase.com/dashboard
   - Create new project or select existing
   - Go to **Settings → API**
   - Copy `URL` and `anon public` key

2. **Silicon Flow** (AI)
   - You already have this key from previous projects
   - If not, visit https://siliconflow.cn/

### Step 2: Configure Environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SILICON_FLOW_API_KEY=sk-xxx
```

### Step 3: Set Up Database

1. Open Supabase SQL Editor
2. Copy & paste contents of `supabase-schema.sql`
3. Click **Run**
4. Go to **Storage** → Create bucket `food-images` → Make it **PUBLIC**

### Step 4: Run the App

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your phone browser (or desktop for testing).

## 📱 Testing on Mobile

### Option 1: Local Network

- Your dev server is accessible at `http://198.18.0.1:3000`
- Use your phone on the same WiFi network

### Option 2: Deploy to Vercel (Production)

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# Then deploy to Vercel
# 1. Visit vercel.com
# 2. Import your GitHub repo
# 3. Add environment variables (same as .env.local)
# 4. Deploy!
```

After deployment, you'll get a URL like `https://nutrisnap.vercel.app`

## 🎯 First Test Flow

1. **Open app** → See main dashboard with calorie counter
2. **Select scenario** → Tap "🏪 便利店"
3. **Take photo** → Tap "📷 拍摄食物"
   - Use camera or upload from album
   - Take a photo of any food
4. **View results** → See recognized foods with macros
5. **Adjust portion** → Drag the slider to change weight
6. **Save** → Tap "吃进肚里" button
7. **Check stats** → Navigate to "📊 统计" to see your data

## 🧪 Test the AI Advisor

1. Go to "💬 AI 顾问" page
2. Select "便利店" scenario
3. Ask: "推荐高蛋白的夜宵"
4. AI should recommend specific items like "泰森鸡胸肉条" or "茶叶蛋"

## ⚠️ Troubleshooting

### Camera not working

- Make sure you're using **HTTPS** or **localhost**
- Browsers block camera on HTTP

### AI recognition fails

- Check `SILICON_FLOW_API_KEY` is correct
- Check console for errors
- Try a clearer food photo

### Database errors

- Verify Supabase URL/key are correct
- Make sure `food-images` bucket exists and is PUBLIC
- Check SQL schema was run successfully

## 📊 What to Check

✅ Camera opens when you click "拍摄食物"  
✅ AI returns food names and calories  
✅ Slider updates numbers in real-time  
✅ Data appears in "统计" page after saving  
✅ Chat responds to your questions  
✅ PWA "Add to Home Screen" prompt appears on mobile

## 🚢 Ready for Production?

Once everything works locally:

1. Deploy to Vercel (see above)
2. Test on real phone (not computer)
3. Go to actual convenience store
4. Scan multiple products
5. Evaluate AI accuracy

---

**Need Help?** Check the walkthrough.md for detailed documentation.

**Dev Server Running?** Visit http://localhost:3000 now! 🎉
