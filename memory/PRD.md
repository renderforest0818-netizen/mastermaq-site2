# Mastermaq Assistencia Tecnica - PRD

## Problem Statement
Build a complete institutional website for Mastermaq Assistencia Tecnica - premium appliance repair service in Belo Horizonte, Brazil. Multi-page application with interactive scheduling flow, customer portal, and blog.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT (httpOnly cookies) with bcrypt password hashing
- **Fonts**: Outfit (headings) + Manrope (body)
- **Colors**: Navy Blue (#1E3A8A), Cobalt (#2563EB), Red (#DC2626), White (#FFFFFF)

## User Personas
1. **Customer**: Homeowner needing appliance repair, seeks quick scheduling and OS tracking
2. **Admin**: Company staff managing service orders, blog content, customer data

## Core Requirements
- Homepage with scrollytelling: Hero, Brand Marquee, Equipment Carousel, How It Works, Differentials, Testimonials, CTA
- Interactive scheduling modal: Equipment -> Brand -> Service Type -> Repair Form -> Auto OS generation
- Business rules: Installation disabled for Geladeiras, AC Portatil, Lava e Seca, Lavadoras
- Customer Portal: JWT auth, OS tracking, profile management
- Internal pages: Services (with subpages), About, Contact, Blog
- ViaCEP integration for address auto-fill on registration

## What's Been Implemented (April 14, 2026)
- [x] Complete homepage with all 7 sections
- [x] Interactive equipment carousel (9 equipment types)
- [x] Multi-step scheduling modal with brand selection, service type, repair form
- [x] Automatic OS generation with unique OS number
- [x] JWT authentication (login, register with 2-step flow, logout, refresh)
- [x] Customer portal with tabs (Active OS, History, Profile)
- [x] Services page with 9 service detail subpages
- [x] About page with company info, mission, values, stats
- [x] Contact page with form and info
- [x] Blog page with 3 seeded articles + search
- [x] Blog article detail page
- [x] Complete responsive footer
- [x] Admin seeding on startup
- [x] Brute force protection on login
- [x] ViaCEP proxy for CEP lookup

## Prioritized Backlog
### P0 (Critical)
- None remaining for MVP

### P1 (High)
- Admin panel for managing service orders (status updates)
- Admin panel for blog article CRUD
- WhatsApp integration for quick contact
- Email notifications for OS status changes

### P2 (Medium)
- Google Maps embed on Contact page
- Google My Business reviews integration
- Password reset flow (forgot password)
- Photo upload for defect description
- Service order status pipeline (drag & drop)

### P3 (Low)
- Google Analytics integration
- Schema Markup (JSON-LD) for SEO
- Sitemap XML generation
- Push notifications for OS updates
- Multi-language support

## Next Tasks
1. Build admin panel for OS management
2. Implement WhatsApp quick contact button
3. Add email notifications
4. Google Maps integration on contact page
5. Password reset flow
