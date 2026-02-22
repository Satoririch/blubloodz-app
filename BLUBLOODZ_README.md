# BluBloodz - Premium Dog Breeder Verification Platform

## Overview

BluBloodz is a trust-verification and breeding match platform designed for premium dog breeders and puppy buyers. The platform creates a two-sided marketplace where verified breeders can showcase health-tested dogs and litters, while buyers can search for puppies from trusted breeders with transparent Trust Score ratings.

## Features

### For Breeders
- **Breeder Dashboard**: Manage profile, dogs, litters, and buyer inquiries
- **Trust Score System**: Transparent 0-100 rating based on verified health testing, pedigree, history, and reviews
- **Dog Profiles**: Showcase individual dogs with complete health test results and pedigree trees
- **Litter Listings**: List available and upcoming litters with detailed information
- **Profile Management**: Track profile completeness and verification status

### For Buyers
- **Search & Filter**: Find breeders by breed, location, price range, and minimum Trust Score
- **Breeder Profiles**: View detailed breeder information, dogs, litters, and reviews
- **Health Verification**: See verified health test results from official databases (OFA, DNA panels)
- **Trust Score Transparency**: Understand exactly how each breeder's score is calculated
- **Direct Inquiries**: Contact breeders about available puppies

## Tech Stack

### Frontend
- **React** with React Router for navigation
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for animations (Trust Score gauge)
- **shadcn/ui** component library
- **Lucide React** for icons

### Design System
- **Typography**: Playfair Display (headings) + Inter (body)
- **Color Palette**: 
  - Background: Dark Navy (#0A1628)
  - Cards: Royal Blue (#1E3A5F)
  - Accent: Gold (#C5A55A)
  - Verification: Emerald Green (#2ECC71)
- **Premium aesthetic** targeting serious breeders and high-value puppy buyers

## Demo Credentials

### Breeder Account
- Email: `breeder@test.com`
- Password: `password`
- Redirects to: Breeder Dashboard

### Buyer Account
- Email: `buyer@test.com`
- Password: `password`
- Redirects to: Search Page

## Key Pages

### 1. Landing Page (`/`)
- Hero section with dual CTAs (Breeder/Buyer)
- Animated Trust Score showcase
- Feature highlights (4 cards)
- "How It Works" section (3 steps)
- Premium dark aesthetic with gold accents

### 2. Breeder Dashboard (`/dashboard/breeder`)
- Profile completeness tracker (85%)
- Trust Score gauge with verification badges
- My Dogs section with quick access cards
- Active Litters overview
- Incoming buyer inquiries (2 notifications)

### 3. Public Breeder Profile (`/breeder/:id`)
- Breeder info with Trust Score prominently displayed
- Verification badges (OFA Verified, DNA Tested, Pedigree Confirmed)
- Gallery of all dogs
- Available litters
- Buyer reviews with star ratings

### 4. Dog Profile (`/dog/:id`)
- Large hero image with gallery thumbnails
- Details: age, weight, registration number
- Health Test Results cards with verified/pending/missing status
- Pedigree visualization (Sire, Dam, Dog)

### 5. Litter Listing (`/litter/:id`)
- Twin image gallery
- Litter status (Upcoming/Available)
- Price range prominently displayed
- Individual puppy listings with status badges (Available/Reserved/Sold)
- Parent links (Sire & Dam)

### 6. Buyer Search (`/search`)
- Left sidebar filters: Breed, Location, Trust Score slider
- Grid/Map view toggle
- Breeder result cards with Trust Score preview
- Active litter indicators

### 7. Trust Score Info (`/trust-score-info`)
- Educational page explaining the scoring system
- 4 categories with weight percentages:
  - Health Testing (40%)
  - Pedigree Verification (25%)
  - Breeder History (20%)
  - Community Reviews (15%)
- Score interpretation guide

## Design Features

### Animated Trust Score Gauge
- Circular progress indicator
- Animates from 0 to actual score on page load (2s duration)
- Color-coded: Green (90+), Yellow (60-89), Red (<60)
- Hover tooltip shows category breakdown
- Glow effect matching score color

### Glassmorphism Header
- Sticky navigation with backdrop blur
- Changes opacity on scroll
- Context-aware navigation (Breeder vs Buyer)

### Verified Badges
- Three states: Verified (green), Pending (yellow), Missing (red)
- Used for health tests, breeder badges, puppy status

---

**Built with Emergent** - AI-Powered Development Platform
