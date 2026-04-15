# Mastermaq Assistencia Tecnica - PRD

## Problem Statement
Complete institutional website for Mastermaq Assistencia Tecnica - premium appliance repair service in BH, Brazil. Multi-page application with interactive scheduling, customer portal, blog. Premium UI/UX redesign breaking "AI generic" patterns.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT (httpOnly cookies) with bcrypt password hashing
- **Fonts**: Outfit (headings) + Manrope (body)
- **Colors**: Navy (#1E3A8A), Cobalt (#2563EB), Red (#DC2626), White (#FFFFFF)

## What's Been Implemented

### April 14, 2026 (MVP)
- [x] Complete homepage with all sections
- [x] Interactive scheduling modal
- [x] JWT authentication (login, register, logout, refresh)
- [x] Customer portal with OS tracking
- [x] Services, About, Contact, Blog pages
- [x] Admin seeding, brute force protection, ViaCEP proxy

### April 15, 2026 (Iteration 1 - Premium Redesign)
- [x] Asymmetric layouts throughout (7/5, 5/7, 4/8 grids)
- [x] Transparent header with scroll transition
- [x] Brand marquee with grayscale->color hover
- [x] Dark-themed sections with dot-grid textures
- [x] Featured testimonial design with Quote icon
- [x] Stats grid in final CTA section
- [x] Visual connectivity between sections

### April 15, 2026 (Iteration 2 - Feature Additions)
- [x] **Header Bug Fix**: Semi-transparent dark bg on homepage (bg-slate-950/90)
- [x] **Real Google Reviews**: 6 reviews from Google My Business (4.1 stars, 134 total)
- [x] **Google Maps**: Iframe embed on contact page with exact business location
- [x] **Services Page Images**: Product images for geladeiras/trituradores
- [x] **Modal Brand Logos**: Replaced text with official brand logos in scheduling modal
- [x] **Step Progress Indicator**: Visual 3-step progress in modal
- [x] **Service Detail Pages**: Dark hero, asymmetric problems grid, CTA buttons
- [x] **Confirmation Screen**: "Acompanhar OS" CTA after order creation

## Prioritized Backlog
### P1 (High)
- Admin panel for OS management + blog CRUD
- Marcas Atendidas dedicated page
- Email notifications for OS status changes

### P2 (Medium)
- Password reset flow
- Photo upload for defect description
- More product images for remaining equipment types
- SEO meta tags per page

### P3 (Low)
- Google Analytics integration
- Schema Markup (JSON-LD)
- Sitemap XML
- Push notifications
