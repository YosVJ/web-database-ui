# DESIGN SYSTEM: SPACESHELL ERP (FUTURISTIC)

## Core Identity
A futuristic, space-inspired ERP UI combining:
- Web3 dashboard aesthetics
- Enterprise usability
- Realistic tech interface

Inspired by:
- Nexa Web3 UI (reference image)
- Lumina UI structure (your file)
- https://jeo-portfolio-08.vercel.app (SpaceShell / SkyShell)
- https://synercore.vercel.app

---

## Visual Concept
- Deep space background (dark blue / black gradients)
- Subtle starfield / particle effect (SpaceShell)
- Soft glow lighting (SkyShell aura)
- Floating layered cards (glassmorphism)
- Realistic system dashboard feel

---

## UI Architecture

### Layout
- Left Sidebar (glass + glow active indicator)
- Top Navigation (blur + transparency)
- Main Panel (card-based modular UI)

### Structure
- Dashboard = command center
- Cards = modules
- Tables = data layer
- Panels = system blocks

---

## UI Components

### Cards
- Glassmorphism effect
- Blur: low-medium (performance safe)
- Border: subtle gradient edge
- Glow: soft outer shadow

### Sidebar
- Dark surface
- Active item:
  - glowing line (left)
  - neon highlight
- Icons: minimal + modern

### Topbar
- Frosted glass effect
- Search input (center-left)
- Profile + controls (right)

### KPI Cards
- Icon + metric + percentage
- Animated progress line (lightweight)
- Glow accent per status

### Tables
- Dark surface
- Row hover glow
- Status badges:
  - Pending (yellow glow)
  - Approved (green glow)
  - Rejected (red glow)

### Forms
- Carved input fields
- Glow focus effect
- Minimal borders
- Clean spacing

---

## Effects System (IMPORTANT)

### Allowed
- Soft glow (low intensity)
- Subtle hover animations
- Gradient highlights
- Depth layering

### NOT Allowed
- Heavy blur
- Laggy animation
- Overly flashy effects

---

## Color System

### Dark Mode (Primary)
- Background: deep navy / space black
- Primary: electric blue (#3D83F5 style)
- Accent: neon purple / cyan
- Surface: dark glass panels

### Light Mode (Futuristic Clean)

- Background: soft white / light gray
- Cards: frosted white glass
- Accent: soft blue glow
- Borders: light subtle lines

👉 Light mode must feel:
- clean
- futuristic
- NOT plain white

---

## Light Mode Preview Behavior

- Glow becomes softer and diffused
- Shadows replace glow intensity
- Cards remain layered
- Maintain “tech UI” feel

---

## Performance Rules

- Must run on low-end devices
- Reduce blur intensity dynamically
- Limit shadows and glow stacking
- Avoid heavy rendering effects
- Keep DOM simple

---

## Responsive Behavior

- Sidebar collapses to icon mode
- Cards stack vertically
- Tables become scrollable
- Maintain spacing consistency

---

## UX Philosophy

- Feels like a “control system”
- Fast interaction
- No confusion in navigation
- Clear hierarchy always

---

## Constraints

- Do NOT turn into landing page design
- Do NOT copy crypto UI blindly
- Keep ERP functionality priority
- Maintain readability at all times

---

## Output Goal

Generate a futuristic ERP UI system that:
- looks like a real tech platform
- feels premium and modern
- remains fast and usable
- supports enterprise workflows