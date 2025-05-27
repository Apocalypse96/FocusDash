# FocusDot Dashboard - Supabase Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Create new project:
   - **Name**: `focusdot-dashboard`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location

### 2. Get Project Credentials
1. Go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xyzcompany.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Environment Variables
1. Open `focus-dashboard/.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

### 4. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create:
   - ✅ `profiles` table for user information
   - ✅ `sessions` table for pomodoro sessions
   - ✅ `goals` table for user goals
   - ✅ `user_settings` table for preferences
   - ✅ Row Level Security policies
   - ✅ Indexes for performance

### 5. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### 6. Enable OAuth Providers (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google** and/or **GitHub**:
   - Follow Supabase docs for OAuth setup
   - Add your OAuth app credentials

## 🎯 What You Get

### ✅ User Authentication
- Email/password signup and login
- OAuth with Google and GitHub
- Secure session management
- Automatic user profile creation

### ✅ User-Specific Data
- Each user sees only their own data
- Secure Row Level Security policies
- Real-time data synchronization

### ✅ Database Tables
- **profiles**: User information and preferences
- **sessions**: Pomodoro session history
- **goals**: Personal productivity goals
- **user_settings**: Timer and app preferences

### ✅ Security Features
- Row Level Security (RLS) enabled
- JWT-based authentication
- Secure API endpoints
- Data isolation between users

## 🔧 Development

### Start the Dashboard
```bash
cd focus-dashboard
npm run dev
```

### Test Authentication
1. Visit `http://localhost:3000`
2. You'll be redirected to `/auth`
3. Sign up with email or OAuth
4. After login, you'll see the dashboard with your data

### Database Management
- Use Supabase dashboard for data management
- Real-time updates across all connected clients
- Automatic backups and scaling

## 🚀 Production Deployment

### Update Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Update Supabase Settings
1. **Site URL**: `https://yourdomain.com`
2. **Redirect URLs**: `https://yourdomain.com/auth/callback`

## 🔗 Next Steps

1. **Test the authentication flow**
2. **Create some sample sessions and goals**
3. **Connect the extension to sync data**
4. **Deploy to production**

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

🎉 **Your FocusDot Dashboard is now ready with user authentication and database backend!**
