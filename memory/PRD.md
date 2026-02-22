# BluBloodz — Product Requirements Document

## Original Problem Statement
Build a trust-verification and breeding match platform for premium dog breeders and puppy buyers called "BluBloodz". The platform should have a premium feel with a dark navy/royal blue and gold color scheme.

## Tech Stack
- **Frontend:** React + Tailwind CSS + React Router + Shadcn UI
- **Backend/DB:** Supabase (PostgreSQL + PostgREST REST API + Auth)
- **Authentication:** Supabase Auth (JWT-based, email+password)
- **Note:** FastAPI backend exists in /app/backend but is NOT used — all API calls go directly from frontend to Supabase.

## Supabase Config
- URL: https://wtldddwmceirjdbhtrve.supabase.co
- Anon key: stored in /app/frontend/.env as REACT_APP_SUPABASE_ANON_KEY
- **IMPORTANT**: Email confirmation must be disabled in Supabase Dashboard → Authentication → Providers → Email → Toggle "Confirm email" OFF

## Pages Built
1. **Landing Page** (`/`) — Hero, value props, CTAs for Breeders/Buyers
2. **Signup Page** (`/signup/:userType`) — Breeder/Buyer registration
3. **Login Page** (`/login`) — Email+password login
4. **Breeder Dashboard** (`/dashboard/breeder`) — Protected (role=breeder). Shows dogs, litters, inquiries, trust score
5. **Add Dog Page** (`/dog/add`) — Protected (role=breeder). Form to add dogs to Supabase `dogs` table
6. **Breeder Profile** (`/breeder/:breederId`) — Public breeder profile, dogs, litters
7. **Dog Profile** (`/dog/:dogId`) — Dog details, health records, pedigree
8. **Litter Page** (`/litter/:litterId`) — Litter details
9. **Search/Browse Page** (`/search`) — Protected (role=buyer). Filter breeders/dogs/litters
10. **Trust Score Info** (`/trust-score-info`) — Static info about trust score

## DB Schema (Supabase)
- **users** (public): `id` (FK auth.users), `full_name`, `kennel_name`, `location`, `role`, `trust_score`, `ofa_verified`, `dna_tested`, `pedigree_confirmed`, `bio`
- **dogs**: `id`, `owner_id` (FK → auth.users.id), `registered_name`, `call_name`, `breed`, `sex`, `dob`, `color`, `weight`, `height`, `registration_number`, `trust_score`, `image_url`, `available_for_breeding`
- **health_records**: `id`, `dog_id`, `test_type`, `result`, `test_date`, `verified`
- **pedigrees**: `id`, `dog_id`, `sire_name`, `sire_registration`, `dam_name`, `dam_registration`
- **litters**: `id`, `breeder_id`, `sire_id`, `dam_id`, `breed`, `status`, `birth_date`, `expected_date`, `puppy_count`, `available_count`, `price_range`
- **inquiries**: `id`, `breeder_id`, `buyer_name`, `message`, `status`, `created_at`

## What's Been Implemented

### Session 1 (Initial Build)
- All 9 pages built with premium dark navy/gold design
- Mock data for all pages
- Build configuration for Node 20.x

### Session 2 (Supabase Integration + Bug Fixes) — Feb 22, 2026
- Installed @supabase/supabase-js v2.97.0
- Created `/app/frontend/src/lib/supabaseClient.js`
- Created `/app/frontend/src/contexts/AuthContext.jsx` with signUp, signIn, signOut
- Fixed `signUp()`: Changed `users.update()` → `users.upsert()` with `id` field
- Fixed `fetchProfile()`: Changed `.single()` → `.maybeSingle()` with fallback profile creation from auth metadata
- Fixed `SignupPage`: Role-based redirects (breeders → /dashboard/breeder, buyers → /search)
- Fixed `AddDogPage`: Clean `supabase.from('dogs').insert()` with toast errors
- Fixed error messages: handle "body stream already read" bug in supabase-js v2.97.0

### Session 3 (Public Search/Browse Page) — Feb 22, 2026
- **SearchPage.jsx**: Full rewrite with 3 tabs (Breeders, Dogs, Litters)
  - Breeders: query `users` where role=breeder, shows avatar/name/location/trust badge
  - Dogs: query with `users!owner_id` join, filters: breed dropdown + available_for_breeding toggle
  - Litters: query with `users!breeder_id` join, filters: breed + status dropdowns
  - Live Supabase data (4 breeders, 3 dogs confirmed in DB)
  - EmptyState component for 0 results
- **App.js**: `/search` made fully public (no ProtectedRoute). Also `/breeder/:id`, `/dog/:id`, `/litter/:id` made public
- **Layout.jsx**: Browse link always visible in nav; Login button shown for unauthenticated users
- **LandingPage.jsx**: Browse link added to standalone header
- All pages already connected to Supabase (BreederDashboard, SearchPage, DogProfile, BreederProfile, LitterPage)

## Known Issues / Blockers

### ACTIVE BLOCKER: Email Confirmation Still Enabled
- **Status**: Supabase email confirmation is still enabled despite user claiming to disable it
- **Evidence**: New signups return `confirmation_sent_at` but no `access_token`
- **Fix**: Supabase Dashboard → Authentication → Providers → Email → Toggle "Confirm email" OFF
- **Impact**: Users created during testing are unconfirmed; the 3/hour email rate limit has been hit

### RESOLVED Issues
- ✅ Signup 400 error (was: `update` instead of `upsert` on users table)
- ✅ Add Dog 400 error (was: raw fetch debug code without valid session; now using proper Supabase client)
- ✅ "body stream already read" error message (was: supabase-js v2.97.0 bug; now: friendly fallback messages)
- ✅ Wrong redirect after signup (was: always to /login; now: role-based)

## Prioritized Backlog

### P0 — Blocking
- [ ] User to confirm: disable email confirmation in Supabase Dashboard
- [ ] E2E test after email confirmation is disabled

### P1 — Core Functionality
- [ ] Full e2e test: signup → dashboard → add dog → see dog in dashboard
- [ ] Buyer signup → search page flow test
- [ ] Verify all page data loads correctly with real Supabase data

### P2 — Feature Completions
- [ ] "Add Litter" functionality (button exists, no form yet)
- [ ] Inquiry system (UI exists, no send functionality)
- [ ] Dog image upload
- [ ] Trust score calculation (currently reads from DB but no calculation logic)

### Future/Backlog
- [ ] Automated health record scraping from OFA.org
- [ ] Stripe integration for breeder subscription tiers
- [ ] Breed compatibility matching algorithm
- [ ] Messaging system between breeders and buyers
- [ ] Mobile app version

## Files of Reference
- `/app/frontend/src/contexts/AuthContext.jsx` — Auth logic
- `/app/frontend/src/lib/supabaseClient.js` — Supabase client init
- `/app/frontend/src/pages/AddDogPage.jsx` — Add dog form
- `/app/frontend/src/pages/SignupPage.jsx` — Signup form
- `/app/frontend/src/pages/LoginPage.jsx` — Login form
- `/app/frontend/src/pages/BreederDashboard.jsx` — Main dashboard
- `/app/frontend/src/App.js` — Routes and ProtectedRoute
- `/app/frontend/.env` — Supabase credentials

## Known Users in DB
- `shericejonescc@gmail.com` — breeder, full_name="Sherice Jones", CONFIRMED (can login)
- `testdiag@blubl.com` — no role, empty profile, UNCONFIRMED
