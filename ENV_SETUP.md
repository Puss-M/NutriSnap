# Environment Setup

Create a `.env.local` file in the root directory with these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Silicon Flow API (for AI Vision)
SILICON_FLOW_API_KEY=your_silicon_flow_api_key_here
```

## Getting Your Keys

### Supabase

1. Go to https://supabase.com/dashboard
2. Create new project (or use existing)
3. Go to Settings → API
4. Copy `URL` and `anon public` key

### Silicon Flow

1. You should already have this from previous projects
2. If not, visit https://siliconflow.cn/

After setting up `.env.local`, run the Supabase schema (see `supabase-schema.sql`).
