# Mastermaq Assistencia Tecnica - PRD

## Problem Statement
Complete institutional website for Mastermaq Assistencia Tecnica - authorized appliance repair service in BH, Brazil. Multi-page application with interactive scheduling, customer portal, blog. Premium UI/UX design with asymmetric layouts.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT (httpOnly cookies) with bcrypt password hashing
- **Fonts**: Outfit (headings) + Manrope (body)

## What's Been Implemented

### Iteration 1 - MVP + Premium Redesign
- [x] Homepage with scrollytelling: Hero, Brand Marquee, Equipment Carousel, How It Works, Differentials, Testimonials, CTA
- [x] Asymmetric layouts (7/5, 5/7, 4/8 grids)
- [x] Interactive scheduling modal with brand logos
- [x] JWT auth, customer portal, services, about, contact, blog pages
- [x] Dark-themed sections, visual connectivity

### Iteration 2 - Features
- [x] Header bug fix (dark semi-transparent bg)
- [x] Real Google reviews (6 reviews, 4.1 stars, 134 total)
- [x] Google Maps on contact page
- [x] Services page with product images
- [x] Modal with brand logos + step indicator

### Iteration 3 - Adjustments (April 16, 2026)
- [x] Logo original colors on dark backgrounds (removed B&W invert)
- [x] Product carousel with scroll on /servicos/geladeiras (10 brands)
- [x] Brand logos displayed in original colors below product images
- [x] Standardized product image and logo sizes
- [x] Removed "Premium" from entire site
- [x] Replaced with "Autorizada" in hero section
- [x] Updated stats: 30+ years, 28000+ clients, 8+ authorized brands
- [x] About page: workshop image instead of technician photo
- [x] Added 2 new reviews (Rodrigo G. Amaral, Juhh Costa) - total 8
- [x] ScrollToTop on page navigation
- [x] Footer text updated to "Autorizada"

## Backlog
### P1
- Admin panel for OS management + blog CRUD
- Marcas Atendidas dedicated page
- Email notifications

### P2
- Password reset flow
- Photo upload for defect description
- More product images for other equipment
- SEO meta tags per page
