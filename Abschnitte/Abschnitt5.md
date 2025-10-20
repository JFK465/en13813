# Marsstein Discovery Grid - Complete Design Specification

## 📋 Executive Summary

**Component Name:** MarssteinDiscoveryGrid (Content Navigation Section)
**Source:** Custom Marsstein Homepage Component (Section 5)
**Design System:** Tailwind CSS + Framer Motion + Aceternity Pointer Highlight
**File:** `components/MarssteinDiscoveryGrid.tsx`
**Purpose:** Present 6 major content areas as interactive navigation cards with pointer highlight effects and call-to-action buttons

**Key Feature:** Uses **Aceternity Pointer Highlight** component for dynamic text highlighting
- Component URL: https://ui.aceternity.com/components/pointer-highlight
- Installation: `npx shadcn@latest add @aceternity/pointer-highlight`
- Description: A React component that highlights text with a dynamic pointer and border effect

---

## 🎨 Visual Design Breakdown

### Section Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    FULL-WIDTH SECTION                           │
│  Background: Subtle gradient (gray-50 to white)                 │
│  Padding: py-20 lg:py-32 (80px mobile, 128px desktop)          │
│  Position: Relative                                             │
│  Overflow: hidden                                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         HEADER SECTION (text-center, mb-16)               │  │
│  │         Max-width: 7xl (1280px)                           │  │
│  │                                                            │  │
│  │  H2: "Entdecken Sie die Welt von Marsstein"              │  │
│  │  ────────────────────────────────────────                 │  │
│  │  - text-3xl lg:text-5xl (30px → 48px)                    │  │
│  │  - font-bold (700 weight)                                 │  │
│  │  - text-gray-900                                          │  │
│  │  - mb-6 (24px margin bottom)                              │  │
│  │  - text-center                                            │  │
│  │  - "Marsstein" wrapped in PointerHighlight                │  │
│  │                                                            │  │
│  │  P: Description paragraph                                 │  │
│  │  ────────────────────                                     │  │
│  │  "Ihr Kompass durch die Compliance-Landschaft –          │  │
│  │   von praktischen Leitfäden bis zu branchen-             │  │
│  │   spezifischen Lösungen."                                 │  │
│  │  - text-xl (20px)                                         │  │
│  │  - text-gray-600                                          │  │
│  │  - max-w-3xl mx-auto (768px max width, centered)         │  │
│  │  - text-center                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         CONTENT CARDS GRID                                │  │
│  │         Max-width: 6xl (1152px)                           │  │
│  │         Grid: 2 columns (desktop), 1 column (mobile)      │  │
│  │         Gap: 32px (gap-8)                                 │  │
│  │                                                            │  │
│  │  ┌──────────────────────────┬──────────────────────────┐ │  │
│  │  │ ┌──────────────────────┐ │ ┌──────────────────────┐ │ │  │
│  │  │ │ Card 1:              │ │ │ Card 2:              │ │ │  │
│  │  │ │ Compliance           │ │ │ DSGVO Meisterkurs    │ │ │  │
│  │  │ │ Frameworks           │ │ │                      │ │ │  │
│  │  │ │                      │ │ │                      │ │ │  │
│  │  │ │ • Pointer highlight  │ │ │ • Pointer highlight  │ │ │  │
│  │  │ │ • Subtitle           │ │ │ • Subtitle           │ │ │  │
│  │  │ │ • Description        │ │ │ • Description        │ │ │  │
│  │  │ │ • 3 Tags (bullets)   │ │ │ • 3 Tags (bullets)   │ │ │  │
│  │  │ │ • CTA with arrow →   │ │ │ • CTA with arrow →   │ │ │  │
│  │  │ └──────────────────────┘ │ └──────────────────────┘ │ │  │
│  │  └──────────────────────────┴──────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌──────────────────────────┬──────────────────────────┐ │  │
│  │  │ ┌──────────────────────┐ │ ┌──────────────────────┐ │ │  │
│  │  │ │ Card 3:              │ │ │ Card 4:              │ │ │  │
│  │  │ │ Branchenlösungen     │ │ │ Unsere Mission       │ │ │  │
│  │  │ │                      │ │ │                      │ │ │  │
│  │  │ │ (Same structure)     │ │ │ (Same structure)     │ │ │  │
│  │  │ └──────────────────────┘ │ └──────────────────────┘ │ │  │
│  │  └──────────────────────────┴──────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌──────────────────────────┬──────────────────────────┐ │  │
│  │  │ ┌──────────────────────┐ │ ┌──────────────────────┐ │ │  │
│  │  │ │ Card 5:              │ │ │ Card 6:              │ │ │  │
│  │  │ │ Wissenszentrum       │ │ │ Kontakt aufnehmen    │ │ │  │
│  │  │ │                      │ │ │                      │ │ │  │
│  │  │ │ (Same structure)     │ │ │ (Same structure)     │ │ │  │
│  │  │ └──────────────────────┘ │ └──────────────────────┘ │ │  │
│  │  └──────────────────────────┴──────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Layout Architecture

### Container System

```css
/* Section Container */
.section {
  max-width: 1280px;        /* max-w-7xl */
  margin: 0 auto;           /* mx-auto */
  padding-left: 16px;       /* px-4 */
  padding-right: 16px;
}

/* Small screens (640px+) */
@media (min-width: 640px) {
  .section {
    padding-left: 24px;     /* sm:px-6 */
    padding-right: 24px;
  }
}

/* Large screens (1024px+) */
@media (min-width: 1024px) {
  .section {
    padding-left: 32px;     /* lg:px-8 */
    padding-right: 32px;
  }
}

/* Grid Container (narrower than section) */
.grid-container {
  max-width: 1152px;        /* max-w-6xl */
  margin: 0 auto;           /* mx-auto */
}
```

### Grid Configuration

```css
/* Mobile First (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;    /* Single column */
  gap: 32px;                     /* gap-8 */
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 equal columns */
    gap: 32px;                              /* Maintains 32px gap */
  }
}
```

**Responsive Behavior:**
- **Mobile (< 1024px):** 1 column, cards stack vertically
- **Desktop (≥ 1024px):** 2 columns, 3 rows, 6 cards total

**Gap System:**
- Horizontal gap: 32px between columns
- Vertical gap: 32px between rows
- Consistent spacing on all breakpoints

---

## 🎴 Individual Content Card Design

### Card Anatomy (Detailed Breakdown)

```
┌─────────────────────────────────────────────────────────────┐
│  CARD CONTAINER                                             │
│  ────────────────────────────────────────────────────────   │
│  • Element: <a> tag (entire card is clickable)              │
│  • Display: block, height: 100%                             │
│  • Background: bg-white (#FFFFFF)                           │
│  • Border Radius: rounded-2xl (16px)                        │
│  • Padding: p-8 (32px all sides) → lg:p-10 (40px desktop)  │
│  • Border: 1px solid border-gray-200 (#E5E7EB)              │
│  • Shadow: none default, shadow-lg on hover                 │
│  • Transition: all properties 300ms                         │
│  • Cursor: pointer                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. TITLE SECTION (mb-4)                                │ │
│  │ ────────────────────────────────────────────────────   │ │
│  │                                                         │ │
│  │ <h3> Element with PointerHighlight wrapper             │ │
│  │                                                         │ │
│  │ ┌─────────────────────────────────────────┐           │ │
│  │ │ [PointerHighlight Component]            │           │ │
│  │ │ ┌───────────────────────────────────┐   │           │ │
│  │ │ │ Compliance Frameworks              │   │           │ │
│  │ │ └───────────────────────────────────┘   │           │ │
│  │ │ • Rectangle background appears on view  │           │ │
│  │ │ • Pointer dot appears near text         │           │ │
│  │ │ • Smooth fade-in animation (~400ms)     │           │ │
│  │ └─────────────────────────────────────────┘           │ │
│  │                                                         │ │
│  │ Typography:                                            │ │
│  │ • text-2xl (24px)                                      │ │
│  │ • font-bold (700 weight)                               │ │
│  │ • text-gray-900 (#111827)                              │ │
│  │ • margin-bottom: 16px (mb-4)                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 2. SUBTITLE SECTION (mb-6)                             │ │
│  │ ────────────────────────────────────────────────────   │ │
│  │                                                         │ │
│  │ <p> "Alle Rahmenwerke im Überblick"                   │ │
│  │                                                         │ │
│  │ Typography:                                            │ │
│  │ • text-lg (18px)                                       │ │
│  │ • font-semibold (600 weight)                           │ │
│  │ • text-gray-700 (#374151)                              │ │
│  │ • margin-bottom: 24px (mb-6)                           │ │
│  │ • line-height: normal                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 3. DESCRIPTION SECTION (mb-6)                          │ │
│  │ ────────────────────────────────────────────────────   │ │
│  │                                                         │ │
│  │ <p> "Von DSGVO über ISO 27001 bis zu branchen-        │ │
│  │      spezifischen Standards – verstehen und            │ │
│  │      implementieren Sie jedes Framework mit            │ │
│  │      Leichtigkeit."                                    │ │
│  │                                                         │ │
│  │ Typography:                                            │ │
│  │ • text-base (16px)                                     │ │
│  │ • font-normal (400 weight)                             │ │
│  │ • text-gray-600 (#4B5563)                              │ │
│  │ • leading-relaxed (1.625 line height)                  │ │
│  │ • margin-bottom: 24px (mb-6)                           │ │
│  │ • Max 2-3 lines recommended for visual balance         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 4. TAGS SECTION (mb-8)                                 │ │
│  │ ────────────────────────────────────────────────────   │ │
│  │                                                         │ │
│  │ <div className="flex flex-wrap gap-2">                │ │
│  │   DSGVO • ISO 27001 • SOC2                            │ │
│  │ </div>                                                 │ │
│  │                                                         │ │
│  │ Structure:                                             │ │
│  │ • Container: flex with flex-wrap                       │ │
│  │ • Gap: 8px (gap-2) between items                       │ │
│  │ • Tags are inline <span> elements                      │ │
│  │ • Bullet separators (•) between tags                   │ │
│  │                                                         │ │
│  │ Tag Typography:                                        │ │
│  │ • text-sm (14px)                                       │ │
│  │ • font-medium (500 weight)                             │ │
│  │ • Color: matches highlightColor variant                │ │
│  │   - Red cards: text-[#e24e1b]                          │ │
│  │   - Blue cards: text-blue-600                          │ │
│  │   - Green cards: text-green-600                        │ │
│  │                                                         │ │
│  │ Bullet Separator:                                      │ │
│  │ • text-gray-400                                        │ │
│  │ • Appears between tags only (not after last)           │ │
│  │ • margin-bottom: 32px (mb-8)                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 5. CTA BUTTON SECTION                                  │ │
│  │ ────────────────────────────────────────────────────   │ │
│  │                                                         │ │
│  │ <div className="flex items-center gap-2">             │ │
│  │   <span>Mehr erfahren</span>                           │ │
│  │   <IconArrowRight className="w-5 h-5" />              │ │
│  │ </div>                                                 │ │
│  │                                                         │ │
│  │ Layout:                                                │ │
│  │ • flex with items-center (vertical center)             │ │
│  │ • gap-2 (8px gap between text and arrow)               │ │
│  │ • Color: matches card's highlightColor                 │ │
│  │                                                         │ │
│  │ Text Typography:                                       │ │
│  │ • font-semibold (600 weight)                           │ │
│  │ • text-base (16px)                                     │ │
│  │ • Color: text-[#e24e1b] / text-blue-600 / etc.        │ │
│  │                                                         │ │
│  │ Arrow Icon:                                            │ │
│  │ • w-5 h-5 (20px × 20px)                                │ │
│  │ • Same color as text                                   │ │
│  │ • transition-transform duration-300                    │ │
│  │ • group-hover:translate-x-1 (slides right 4px)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

DIMENSIONS:
────────────
Width: 100% of grid column (50% of container minus gap on desktop)
Height: Auto (h-full for equal height cards)
Padding: 32px (mobile) → 40px (desktop) all sides
Border: 1px solid
Border Radius: 16px
```

---

## 🎯 Aceternity Pointer Highlight - Deep Dive

### What is Pointer Highlight?

**Official Source:** https://ui.aceternity.com/components/pointer-highlight

**Description:** 
A React component from Aceternity UI that creates an animated highlight effect around text. When the text enters the viewport or is hovered, a subtle rectangle background and a small pointer/dot appear around the text with smooth animations.

**Visual Characteristics:**
- Rectangle border appears around highlighted text
- Small circular pointer/dot near the text
- Smooth fade-in animation (~400ms)
- Customizable colors and styling
- Works in both light and dark modes

### Installation

```bash
# Using Aceternity CLI (recommended)
npx shadcn@latest add @aceternity/pointer-highlight

# This will:
# 1. Install required dependencies
# 2. Add the component to your components/ui directory
# 3. Set up necessary Tailwind configurations
```

**Manual Installation:**
If the CLI doesn't work, manually install:
```bash
npm install framer-motion clsx tailwind-merge
```

Then create the component file at `components/ui/pointer-highlight.tsx` with the Aceternity code.

### Component API

```tsx
interface PointerHighlightProps {
  // The text/content to highlight
  children: React.ReactNode;
  
  // Classname for the background rectangle
  // Example: "bg-[#e24e1b]/10" (10% opacity brand color)
  rectangleClassName?: string;
  
  // Classname for the pointer dot
  // Example: "text-[#e24e1b]" (solid brand color)
  pointerClassName?: string;
  
  // Optional container wrapper classname
  containerClassName?: string;
}
```

### Usage Example 1: Section Header

```tsx
<h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 text-center">
  Entdecken Sie die Welt von{" "}
  <PointerHighlight
    rectangleClassName="bg-[#e24e1b]/10"
    pointerClassName="text-[#e24e1b]"
  >
    <span className="text-[#e24e1b]">Marsstein</span>
  </PointerHighlight>
</h2>
```

**Breakdown:**
- `{" "}` adds a space before the highlighted word
- `rectangleClassName`: 10% opacity red background for the rectangle
- `pointerClassName`: Solid red for the pointer dot
- Inner `<span>` applies red color to the text itself
- Combined effect: Red text with red highlight rectangle and pointer

### Usage Example 2: Card Title

```tsx
<h3 className="text-2xl font-bold text-gray-900 mb-4">
  <PointerHighlight
    rectangleClassName="bg-blue-50"
    pointerClassName="text-blue-500"
  >
    <span>Compliance Frameworks</span>
  </PointerHighlight>
</h3>
```

**Breakdown:**
- `rectangleClassName`: Light blue background (blue-50)
- `pointerClassName`: Medium blue pointer (blue-500)
- Text color remains gray-900 (from parent h3)
- Creates subtle blue accent without changing text color

### Color Configuration Guide

**Marsstein Red Theme (Primary Brand):**
```tsx
<PointerHighlight
  rectangleClassName="bg-[#e24e1b]/10"    // 10% opacity background
  pointerClassName="text-[#e24e1b]"       // Solid color pointer
>
  <span className="text-[#e24e1b]">Text</span>  // Optional: color the text
</PointerHighlight>
```

**Blue Accent Theme:**
```tsx
<PointerHighlight
  rectangleClassName="bg-blue-50"         // Tailwind blue background
  pointerClassName="text-blue-500"        // Tailwind blue pointer
>
  <span>Text</span>
</PointerHighlight>
```

**Green Accent Theme:**
```tsx
<PointerHighlight
  rectangleClassName="bg-green-50"
  pointerClassName="text-green-500"
>
  <span>Text</span>
</PointerHighlight>
```

**Neutral/Gray Theme:**
```tsx
<PointerHighlight
  rectangleClassName="bg-gray-100"
  pointerClassName="text-gray-500"
>
  <span>Text</span>
</PointerHighlight>
```

### Animation Behavior

**Trigger Conditions:**
1. **On Scroll:** When element enters viewport (using Intersection Observer)
2. **On Hover:** When user hovers over the highlighted text
3. **On Focus:** When element receives keyboard focus (accessibility)

**Animation Timeline:**
```
Time 0ms:   Element enters viewport
            ↓
Time 0-100ms:  Fade in begins (opacity 0 → 1)
            ↓
Time 100-200ms: Rectangle scales in (scale 0.95 → 1)
            ↓
Time 200-300ms: Pointer dot appears with slight bounce
            ↓
Time 300-400ms: All animations complete, highlight visible
```

**CSS Transitions:**
```css
.pointer-highlight-rectangle {
  transition: opacity 400ms ease-out,
              transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pointer-highlight-pointer {
  transition: opacity 300ms ease-out 100ms,  /* 100ms delay */
              transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Visual Examples

**Default State (not in viewport):**
```
Entdecken Sie die Welt von Marsstein
                              ^^^^^^^^
                              (no highlight visible)
```

**Active State (in viewport/hover):**
```
Entdecken Sie die Welt von ┌─────────────┐
                            │  Marsstein  │ ●  ← Pointer dot
                            └─────────────┘
                            └─ Rectangle background
```

### Dark Mode Support

```tsx
<PointerHighlight
  rectangleClassName="bg-[#e24e1b]/10 dark:bg-[#e24e1b]/20"
  pointerClassName="text-[#e24e1b] dark:text-[#ff6b3d]"
>
  <span>Text</span>
</PointerHighlight>
```

- Light mode: 10% opacity background
- Dark mode: 20% opacity background (more visible on dark backgrounds)
- Pointer can also have different dark mode color

---

## 🎨 Color System

### Section Background

```css
/* Gradient Background */
background: linear-gradient(to bottom, #F9FAFB, #FFFFFF);
/* Tailwind: bg-gradient-to-b from-gray-50 to-white */

/* Color Values */
from-gray-50: #F9FAFB  /* Top of gradient */
to-white: #FFFFFF      /* Bottom of gradient */
```

**Purpose:** Creates subtle depth and visual separation from other sections

### Card Colors

```css
/* Card Background */
background: #FFFFFF;
/* Tailwind: bg-white */

/* Card Border - Default State */
border: 1px solid #E5E7EB;
/* Tailwind: border border-gray-200 */

/* Card Border - Hover State */
border: 1px solid #D1D5DB;
/* Tailwind: hover:border-gray-300 */

/* Card Shadow - Default */
box-shadow: none;
/* No shadow in default state */

/* Card Shadow - Hover State */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
/* Tailwind: hover:shadow-lg */
```

### Text Colors

```css
/* H2 Section Title */
color: #111827;
/* Tailwind: text-gray-900 */

/* Section Description */
color: #4B5563;
/* Tailwind: text-gray-600 */

/* Card Title (H3) */
color: #111827;
/* Tailwind: text-gray-900 */

/* Card Subtitle */
color: #374151;
/* Tailwind: text-gray-700 */

/* Card Description */
color: #4B5563;
/* Tailwind: text-gray-600 */
```

### Pointer Highlight Colors (3 Variants)

**Variant 1: Red (Marsstein Brand)**
```css
/* Rectangle Background */
background: rgba(226, 78, 27, 0.1);  /* 10% opacity */
/* Tailwind: bg-[#e24e1b]/10 */

/* Pointer Dot */
color: #e24e1b;
/* Tailwind: text-[#e24e1b] */

/* Text Color (optional) */
color: #e24e1b;
/* Tailwind: text-[#e24e1b] */

/* Tag Color */
color: #e24e1b;
/* Tailwind: text-[#e24e1b] */

/* CTA Color */
color: #e24e1b;
/* Tailwind: text-[#e24e1b] */
```

**Variant 2: Blue**
```css
/* Rectangle Background */
background: #EFF6FF;  /* blue-50 */
/* Tailwind: bg-blue-50 */

/* Pointer Dot */
color: #3B82F6;  /* blue-500 */
/* Tailwind: text-blue-500 */

/* Tag Color */
color: #2563EB;  /* blue-600 */
/* Tailwind: text-blue-600 */

/* CTA Color */
color: #2563EB;
/* Tailwind: text-blue-600 */
```

**Variant 3: Green**
```css
/* Rectangle Background */
background: #F0FDF4;  /* green-50 */
/* Tailwind: bg-green-50 */

/* Pointer Dot */
color: #22C55E;  /* green-500 */
/* Tailwind: text-green-500 */

/* Tag Color */
color: #16A34A;  /* green-600 */
/* Tailwind: text-green-600 */

/* CTA Color */
color: #16A34A;
/* Tailwind: text-green-600 */
```

### Tag Separator Color

```css
/* Bullet (•) between tags */
color: #9CA3AF;  /* gray-400 */
/* Tailwind: text-gray-400 */
```

### Color Assignment by Card

| Card # | Title | Highlight Variant |
|--------|-------|------------------|
| 1 | Compliance Frameworks | Red (Marsstein) |
| 2 | DSGVO Meisterkurs | Blue |
| 3 | Branchenlösungen | Green |
| 4 | Unsere Mission | Red (Marsstein) |
| 5 | Wissenszentrum | Blue |
| 6 | Kontakt aufnehmen | Green |

**Pattern:** Alternates Red → Blue → Green → Red → Blue → Green

---

## ✨ Interactive States & Animations

### Card Hover Effects (4 Simultaneous Animations)

```tsx
// Tailwind group wrapper enables child hover effects
className="group"
```

#### Animation 1: Shadow Elevation

```css
/* Default State */
box-shadow: none;

/* Hover State */
.group:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Tailwind Classes */
shadow-none  /* default (or omit for no shadow) */
hover:shadow-lg
transition-all duration-300
```

**Details:**
- **Effect:** Card appears to lift off the page
- **Shadow Size:** Large, soft shadow beneath card
- **Shadow Color:** Black with 10% opacity (top layer) + 5% opacity (bottom layer)
- **Transition:** All properties animate smoothly over 300ms

#### Animation 2: Border Color Shift

```css
/* Default State */
border: 1px solid #E5E7EB;  /* gray-200 */

/* Hover State */
.group:hover {
  border-color: #D1D5DB;  /* gray-300 */
}

/* Tailwind Classes */
border border-gray-200
hover:border-gray-300
transition-all duration-300
```

**Details:**
- **Effect:** Border becomes slightly darker/more defined
- **Change:** gray-200 → gray-300 (subtle darkening)
- **Purpose:** Adds definition without being jarring
- **Transition:** Smooth color transition over 300ms

#### Animation 3: CTA Arrow Slide

```css
/* Default State */
.cta-arrow {
  transform: translateX(0);
}

/* Hover State (parent card hovered) */
.group:hover .cta-arrow {
  transform: translateX(4px);  /* 0.25rem */
}

/* Tailwind Classes on Arrow */
transition-transform duration-300
group-hover:translate-x-1
```

**Details:**
- **Effect:** Arrow slides right, suggesting forward motion
- **Movement:** 4px to the right (0.25rem / translate-x-1)
- **Target:** IconArrowRight component inside CTA
- **Timing:** 300ms smooth transition
- **Purpose:** Reinforces the clickable nature of the card

#### Animation 4: Pointer Highlight Appearance

**Trigger:** Card enters viewport (via Framer Motion whileInView)

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
```

**Timeline:**
```
Time 0ms: Card starts to enter viewport (50px before fully visible)
          ↓
Time 0-500ms: Card fades in and slides up
              • opacity: 0 → 1
              • translateY: 30px → 0px
          ↓
Time 100-500ms: PointerHighlight activates
                • Rectangle fades in
                • Pointer dot appears
          ↓
Time 500ms: All animations complete
```

**Stagger Effect:**
- Each card has a delay based on its index
- Delay formula: `index * 0.1` seconds
- Card 1: 0ms delay
- Card 2: 100ms delay
- Card 3: 200ms delay
- Card 4: 300ms delay
- Card 5: 400ms delay
- Card 6: 500ms delay
- **Result:** Cards appear sequentially like a waterfall

### Transition Configuration Summary

| Animation | Property | Duration | Easing | Trigger |
|-----------|----------|----------|--------|---------|
| Card Fade In | opacity, translateY | 500ms | ease-out | Viewport entry |
| Shadow Elevation | box-shadow | 300ms | ease-out | Hover |
| Border Color | border-color | 300ms | ease-out | Hover |
| Arrow Slide | translateX | 300ms | ease-out | Hover |
| Pointer Highlight | opacity, transform | 400ms | ease-out | Viewport entry |

---

## 📝 Content Structure (6 Cards)

### Card 1: Compliance Frameworks

```tsx
{
  title: "Compliance Frameworks",
  subtitle: "Alle Rahmenwerke im Überblick",
  description: "Von DSGVO über ISO 27001 bis zu branchenspezifischen Standards – verstehen und implementieren Sie jedes Framework mit Leichtigkeit.",
  tags: ["DSGVO", "ISO 27001", "SOC2"],
  ctaText: "Mehr erfahren",
  ctaLink: "/compliance-frameworks",
  highlightColor: "red"
}
```

**Content Breakdown:**
- **Title:** 2 words, describes broad category
- **Subtitle:** 4 words, benefit statement ("all frameworks at a glance")
- **Description:** 22 words, explains value proposition with specific examples
- **Tags:** 3 framework acronyms, separated by bullets
- **CTA:** Standard "Learn more" action
- **Color:** Red (primary Marsstein brand)

**Character Counts:**
- Title: 21 characters
- Subtitle: 30 characters
- Description: 148 characters
- Total card text: ~200 characters

---

### Card 2: DSGVO Meisterkurs

```tsx
{
  title: "DSGVO Meisterkurs",
  subtitle: "Datenschutz verständlich gemacht",
  description: "Praktische Leitfäden, Checklisten und Schritt-für-Schritt Anleitungen die Ihre DSGVO-Compliance zum Kinderspiel machen.",
  tags: ["Leitfäden", "Vorlagen", "Praxis"],
  ctaText: "Mehr erfahren",
  ctaLink: "/dsgvo-meisterkurs",
  highlightColor: "blue"
}
```

**Content Breakdown:**
- **Title:** 2 words, product name with "masterclass" connotation
- **Subtitle:** 3 words, simplification promise ("data protection made understandable")
- **Description:** 17 words, lists specific deliverables (guides, checklists, step-by-step)
- **Tags:** 3 resource types, German terms
- **CTA:** Standard "Learn more"
- **Color:** Blue (differentiates from adjacent red card)

**Character Counts:**
- Title: 17 characters
- Subtitle: 32 characters
- Description: 127 characters

---

### Card 3: Branchenlösungen

```tsx
{
  title: "Branchenlösungen",
  subtitle: "Maßgeschneidert für Sie",
  description: "Ob E-Commerce, SaaS oder Gesundheitswesen – entdecken Sie spezifische Compliance-Lösungen für Ihre Branche.",
  tags: ["E-Commerce", "SaaS", "Healthcare"],
  ctaText: "Mehr erfahren",
  ctaLink: "/branchen",
  highlightColor: "green"
}
```

**Content Breakdown:**
- **Title:** 1 word compound, "Industry Solutions"
- **Subtitle:** 3 words, customization promise ("tailored for you")
- **Description:** 17 words, gives 3 example industries then invites discovery
- **Tags:** 3 industry names, mix of German (E-Commerce, SaaS) and English (Healthcare)
- **CTA:** Standard "Learn more"
- **Color:** Green (third color in rotation)

**Character Counts:**
- Title: 16 characters
- Subtitle: 24 characters
- Description: 112 characters

---

### Card 4: Unsere Mission

```tsx
{
  title: "Unsere Mission",
  subtitle: "Das Team hinter Marsstein",
  description: "Erfahren Sie, warum wir Marsstein entwickelt haben und wie unsere Vision Compliance für immer verändern wird.",
  tags: ["Team", "Vision", "Werte"],
  ctaText: "Mehr erfahren",
  ctaLink: "/ueber-uns",
  highlightColor: "red"
}
```

**Content Breakdown:**
- **Title:** 2 words, "Our Mission" (About Us page)
- **Subtitle:** 4 words, "The team behind Marsstein"
- **Description:** 18 words, invites learning about the why and vision
- **Tags:** 3 abstract concepts (Team, Vision, Values)
- **CTA:** Standard "Learn more"
- **Color:** Red (returns to brand color, creates visual balance)

**Character Counts:**
- Title: 14 characters
- Subtitle: 27 characters
- Description: 115 characters

---

### Card 5: Wissenszentrum

```tsx
{
  title: "Wissenszentrum",
  subtitle: "Ihr Compliance-Kompass",
  description: "Aktuelle Rechtsprechung, Best Practices und alles was Sie für erfolgreiche Compliance-Implementierung brauchen.",
  tags: ["Guides", "Updates", "Ressourcen"],
  ctaText: "Mehr erfahren",
  ctaLink: "/wissen",
  highlightColor: "blue"
}
```

**Content Breakdown:**
- **Title:** 1 word compound, "Knowledge Center"
- **Subtitle:** 3 words, "Your Compliance Compass" (navigation metaphor)
- **Description:** 16 words, lists content types (case law, best practices, resources)
- **Tags:** 3 content categories, mix of English (Guides, Updates) and German (Ressourcen)
- **CTA:** Standard "Learn more"
- **Color:** Blue (second rotation of blue)

**Character Counts:**
- Title: 14 characters
- Subtitle: 23 characters
- Description: 115 characters

---

### Card 6: Kontakt aufnehmen

```tsx
{
  title: "Kontakt aufnehmen",
  subtitle: "Wir sind für Sie da",
  description: "Haben Sie Fragen? Unser Expertenteam hilft Ihnen gerne bei allen Compliance-Herausforderungen und findet die perfekte Lösung für Ihr Unternehmen.",
  tags: ["Support", "Beratung", "Demo"],
  ctaText: "Jetzt kontaktieren",
  ctaLink: "/kontakt",
  highlightColor: "green"
}
```

**Content Breakdown:**
- **Title:** 2 words, "Get in Touch" / "Contact"
- **Subtitle:** 5 words, "We're here for you" (reassurance)
- **Description:** 24 words, asks question then offers expert help
- **Tags:** 3 contact types (Support, Consulting, Demo)
- **CTA:** **Different!** "Contact now" (more urgent/actionable)
- **Color:** Green (completes the color rotation)

**Character Counts:**
- Title: 17 characters
- Subtitle: 21 characters
- Description: 152 characters (longest description)

---

### Content Writing Guidelines

**Title Best Practices:**
- 1-3 words maximum
- Noun phrases (not sentences)
- Clear, descriptive category names
- Can be German compound words or English terms

**Subtitle Best Practices:**
- 3-5 words maximum
- Benefit-focused or descriptive tagline
- Complements the title
- Creates emotional connection

**Description Best Practices:**
- 15-25 words (150-200 characters)
- 2-3 lines maximum when rendered
- Start with concrete examples or questions
- End with benefit or invitation
- Use em dashes (–) for emphasis

**Tags Best Practices:**
- Exactly 3 tags per card
- Single words or short phrases
- Keywords or categories
- Separated by bullet character (•)
- Mix of English/German acceptable for international appeal

**CTA Text Best Practices:**
- Usually "Mehr erfahren" (Learn more)
- Can be contextual ("Jetzt kontaktieren" for contact card)
- Keep to 2-3 words
- Action-oriented verbs

---

## 💻 Complete Code Template

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { IconArrowRight } from '@tabler/icons-react';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { cn } from '@/lib/utils';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface ContentCard {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  ctaText: string;
  ctaLink: string;
  highlightColor: "red" | "blue" | "green";
}

interface ContentCardProps extends ContentCard {
  index: number;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MarssteinDiscoveryGrid() {
  const contentCards: ContentCard[] = [
    {
      title: "Compliance Frameworks",
      subtitle: "Alle Rahmenwerke im Überblick",
      description: "Von DSGVO über ISO 27001 bis zu branchenspezifischen Standards – verstehen und implementieren Sie jedes Framework mit Leichtigkeit.",
      tags: ["DSGVO", "ISO 27001", "SOC2"],
      ctaText: "Mehr erfahren",
      ctaLink: "/compliance-frameworks",
      highlightColor: "red"
    },
    {
      title: "DSGVO Meisterkurs",
      subtitle: "Datenschutz verständlich gemacht",
      description: "Praktische Leitfäden, Checklisten und Schritt-für-Schritt Anleitungen die Ihre DSGVO-Compliance zum Kinderspiel machen.",
      tags: ["Leitfäden", "Vorlagen", "Praxis"],
      ctaText: "Mehr erfahren",
      ctaLink: "/dsgvo-meisterkurs",
      highlightColor: "blue"
    },
    {
      title: "Branchenlösungen",
      subtitle: "Maßgeschneidert für Sie",
      description: "Ob E-Commerce, SaaS oder Gesundheitswesen – entdecken Sie spezifische Compliance-Lösungen für Ihre Branche.",
      tags: ["E-Commerce", "SaaS", "Healthcare"],
      ctaText: "Mehr erfahren",
      ctaLink: "/branchen",
      highlightColor: "green"
    },
    {
      title: "Unsere Mission",
      subtitle: "Das Team hinter Marsstein",
      description: "Erfahren Sie, warum wir Marsstein entwickelt haben und wie unsere Vision Compliance für immer verändern wird.",
      tags: ["Team", "Vision", "Werte"],
      ctaText: "Mehr erfahren",
      ctaLink: "/ueber-uns",
      highlightColor: "red"
    },
    {
      title: "Wissenszentrum",
      subtitle: "Ihr Compliance-Kompass",
      description: "Aktuelle Rechtsprechung, Best Practices und alles was Sie für erfolgreiche Compliance-Implementierung brauchen.",
      tags: ["Guides", "Updates", "Ressourcen"],
      ctaText: "Mehr erfahren",
      ctaLink: "/wissen",
      highlightColor: "blue"
    },
    {
      title: "Kontakt aufnehmen",
      subtitle: "Wir sind für Sie da",
      description: "Haben Sie Fragen? Unser Expertenteam hilft Ihnen gerne bei allen Compliance-Herausforderungen und findet die perfekte Lösung für Ihr Unternehmen.",
      tags: ["Support", "Beratung", "Demo"],
      ctaText: "Jetzt kontaktieren",
      ctaLink: "/kontakt",
      highlightColor: "green"
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Heading with Pointer Highlight */}
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Entdecken Sie die Welt von{" "}
            <PointerHighlight
              rectangleClassName="bg-[#e24e1b]/10"
              pointerClassName="text-[#e24e1b]"
            >
              <span className="text-[#e24e1b]">Marsstein</span>
            </PointerHighlight>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ihr Kompass durch die Compliance-Landschaft – von praktischen
            Leitfäden bis zu branchenspezifischen Lösungen.
          </p>
        </motion.div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {contentCards.map((card, index) => (
            <ContentCard key={card.title} {...card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CONTENT CARD COMPONENT
// ============================================================

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  description,
  tags,
  ctaText,
  ctaLink,
  highlightColor,
  index,
}) => {
  // Highlight color configurations
  const highlightConfig = {
    red: {
      rectangle: "bg-[#e24e1b]/10",
      pointer: "text-[#e24e1b]",
      text: "text-[#e24e1b]",
    },
    blue: {
      rectangle: "bg-blue-50",
      pointer: "text-blue-500",
      text: "text-blue-600",
    },
    green: {
      rectangle: "bg-green-50",
      pointer: "text-green-500",
      text: "text-green-600",
    },
  };

  const config = highlightConfig[highlightColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <a
        href={ctaLink}
        className={cn(
          // Base styles
          "group block h-full",
          // Layout
          "bg-white rounded-2xl",
          "p-8 lg:p-10",
          // Border
          "border border-gray-200",
          // Transitions
          "transition-all duration-300",
          // Hover states
          "hover:shadow-lg hover:border-gray-300"
        )}
      >
        {/* 1. Title with Pointer Highlight */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          <PointerHighlight
            rectangleClassName={config.rectangle}
            pointerClassName={config.pointer}
          >
            <span>{title}</span>
          </PointerHighlight>
        </h3>

        {/* 2. Subtitle */}
        <p className="text-lg font-semibold text-gray-700 mb-6">
          {subtitle}
        </p>

        {/* 3. Description */}
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>

        {/* 4. Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <React.Fragment key={tag}>
              <span className={cn("text-sm font-medium", config.text)}>
                {tag}
              </span>
              {i < tags.length - 1 && (
                <span className="text-gray-400">•</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 5. CTA with Arrow */}
        <div className={cn("flex items-center gap-2", config.text)}>
          <span className="font-semibold">{ctaText}</span>
          <IconArrowRight
            className={cn(
              "w-5 h-5",
              "transition-transform duration-300",
              "group-hover:translate-x-1"
            )}
          />
        </div>
      </a>
    </motion.div>
  );
};
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)

```css
/* Layout */
.section {
  padding-top: 80px;        /* py-20 */
  padding-bottom: 80px;
  padding-left: 16px;       /* px-4 */
  padding-right: 16px;
}

.grid {
  grid-template-columns: 1fr;  /* Single column */
  gap: 32px;                   /* gap-8 */
}

.card {
  padding: 32px;            /* p-8 */
}

/* Typography */
h2 {
  font-size: 30px;          /* text-3xl */
  line-height: 36px;
}

p.description {
  font-size: 20px;          /* text-xl */
  line-height: 28px;
}

h3 {
  font-size: 24px;          /* text-2xl */
  line-height: 32px;
}

.subtitle {
  font-size: 18px;          /* text-lg */
  line-height: 28px;
}

.card-description {
  font-size: 16px;          /* text-base */
  line-height: 26px;        /* leading-relaxed */
}

.tags {
  font-size: 14px;          /* text-sm */
  line-height: 20px;
}
```

**Visual Characteristics:**
- Cards stack vertically
- Full-width cards with 16px side margins
- Smaller heading sizes for readability
- Comfortable touch targets (minimum 44px height for buttons)

---

### Small Tablet (640px - 1023px)

```css
/* Layout */
.section {
  padding-top: 80px;        /* py-20 (unchanged) */
  padding-bottom: 80px;
  padding-left: 24px;       /* sm:px-6 */
  padding-right: 24px;
}

.grid {
  grid-template-columns: 1fr;  /* Still single column */
  gap: 32px;                   /* gap-8 (unchanged) */
}

.card {
  padding: 32px;            /* p-8 (unchanged) */
}

/* Typography - same as mobile */
```

**Visual Characteristics:**
- Still single-column layout
- Increased side padding (16px → 24px)
- Cards have more breathing room
- Typography remains the same as mobile

---

### Desktop (1024px+)

```css
/* Layout */
.section {
  padding-top: 128px;       /* lg:py-32 */
  padding-bottom: 128px;
  padding-left: 32px;       /* lg:px-8 */
  padding-right: 32px;
}

.grid {
  grid-template-columns: repeat(2, 1fr);  /* lg:grid-cols-2 */
  gap: 32px;                              /* gap-8 (unchanged) */
}

.card {
  padding: 40px;            /* lg:p-10 */
}

/* Typography */
h2 {
  font-size: 48px;          /* lg:text-5xl */
  line-height: 1;
}

p.description {
  font-size: 20px;          /* text-xl (unchanged) */
  line-height: 28px;
}

/* Card typography unchanged from mobile */
```

**Visual Characteristics:**
- 2-column grid layout (3 rows)
- Larger vertical spacing (80px → 128px)
- Increased card padding (32px → 40px)
- Larger main heading (30px → 48px)
- Cards have equal height due to `h-full` class

---

### Responsive Behavior Summary

| Breakpoint | Columns | Section Padding Y | Section Padding X | Card Padding | Main Heading |
|------------|---------|-------------------|-------------------|--------------|--------------|
| < 640px | 1 | 80px | 16px | 32px | 30px |
| 640px - 1023px | 1 | 80px | 24px | 32px | 30px |
| ≥ 1024px | 2 | 128px | 32px | 40px | 48px |

---

## 📊 Spacing System

### Section Level Spacing

```css
/* Vertical Padding */
py-20        /* Mobile: 80px top & bottom */
lg:py-32     /* Desktop: 128px top & bottom */

/* Horizontal Padding */
px-4         /* Mobile: 16px left & right */
sm:px-6      /* Small: 24px left & right */
lg:px-8      /* Large: 32px left & right */

/* Header Bottom Margin */
mb-16        /* 64px space between header and grid */
```

### Grid Level Spacing

```css
/* Grid Gap */
gap-8        /* 32px gap between all cards (horizontal & vertical) */

/* Max Width Constraints */
max-w-7xl    /* Section container: 1280px */
max-w-6xl    /* Grid container: 1152px (narrower for better readability) */
max-w-3xl    /* Header description: 768px */
```

### Card Level Spacing

```css
/* Card Padding */
p-8          /* Mobile: 32px all sides */
lg:p-10      /* Desktop: 40px all sides */

/* Internal Card Spacing */
mb-4         /* Title bottom: 16px */
mb-6         /* Subtitle bottom: 24px */
mb-6         /* Description bottom: 24px */
mb-8         /* Tags bottom: 32px */

/* Tag Internal Spacing */
gap-2        /* 8px between tag items and bullets */
```

### Typography Spacing

```css
/* Section Header */
h2.mb-6      /* 24px below main heading */

/* Card Elements */
h3.mb-4      /* 16px below card title */
.subtitle.mb-6    /* 24px below subtitle */
.description.mb-6 /* 24px below description */
.tags.mb-8        /* 32px below tags (largest gap before CTA) */

/* CTA */
gap-2        /* 8px between text and arrow icon */
```

### Spacing Rationale

**Vertical Rhythm:**
- Uses multiples of 4px for consistency
- Larger gaps at section boundaries (64px, 128px)
- Medium gaps between card sections (24px, 32px)
- Small gaps for inline elements (8px, 16px)

**Horizontal Spacing:**
- Consistent 32px grid gap on all breakpoints
- Maintains visual balance between cards
- Allows cards to breathe without feeling disconnected

**Card Padding:**
- Increases on desktop (32px → 40px) to match larger card size
- Provides comfortable reading area
- Prevents content from feeling cramped

---

## 🔤 Typography System

### Section Header Typography

```css
/* H2 Main Heading */
.section-heading {
  font-size: 30px;              /* text-3xl mobile */
  font-size: 48px;              /* lg:text-5xl desktop */
  font-weight: 700;             /* font-bold */
  color: #111827;               /* text-gray-900 */
  line-height: 1.2;             /* tight leading */
  text-align: center;           /* text-center */
  margin-bottom: 24px;          /* mb-6 */
}

/* Section Description */
.section-description {
  font-size: 20px;              /* text-xl */
  font-weight: 400;             /* font-normal (default) */
  color: #4B5563;               /* text-gray-600 */
  line-height: 28px;            /* line-height: 1.4 */
  text-align: center;           /* text-center */
  max-width: 768px;             /* max-w-3xl */
  margin: 0 auto;               /* mx-auto */
}
```

### Card Typography

```css
/* H3 Card Title */
.card-title {
  font-size: 24px;              /* text-2xl */
  font-weight: 700;             /* font-bold */
  color: #111827;               /* text-gray-900 */
  line-height: 32px;            /* line-height: 1.33 */
  margin-bottom: 16px;          /* mb-4 */
}

/* Card Subtitle */
.card-subtitle {
  font-size: 18px;              /* text-lg */
  font-weight: 600;             /* font-semibold */
  color: #374151;               /* text-gray-700 */
  line-height: 28px;            /* line-height: 1.56 */
  margin-bottom: 24px;          /* mb-6 */
}

/* Card Description */
.card-description {
  font-size: 16px;              /* text-base */
  font-weight: 400;             /* font-normal */
  color: #4B5563;               /* text-gray-600 */
  line-height: 26px;            /* leading-relaxed (1.625) */
  margin-bottom: 24px;          /* mb-6 */
}

/* Card Tags */
.card-tag {
  font-size: 14px;              /* text-sm */
  font-weight: 500;             /* font-medium */
  color: [variant-specific];   /* text-[#e24e1b] / text-blue-600 / text-green-600 */
  line-height: 20px;            /* line-height: 1.43 */
}

.tag-separator {
  font-size: 14px;              /* text-sm */
  color: #9CA3AF;               /* text-gray-400 */
}

/* CTA Text */
.cta-text {
  font-size: 16px;              /* text-base */
  font-weight: 600;             /* font-semibold */
  color: [variant-specific];   /* matches tag color */
  line-height: 24px;            /* line-height: 1.5 */
}
```

### Font Stack

```css
/* Tailwind Default Font Stack */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
             sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
             "Segoe UI Symbol", "Noto Color Emoji";
```

### Typography Scale

| Element | Mobile | Desktop | Weight | Color |
|---------|--------|---------|--------|-------|
| Section H2 | 30px | 48px | 700 | gray-900 |
| Section P | 20px | 20px | 400 | gray-600 |
| Card H3 | 24px | 24px | 700 | gray-900 |
| Card Subtitle | 18px | 18px | 600 | gray-700 |
| Card Description | 16px | 16px | 400 | gray-600 |
| Card Tags | 14px | 14px | 500 | variant |
| CTA Text | 16px | 16px | 600 | variant |

### Line Height Ratios

| Element | Line Height | Ratio |
|---------|-------------|-------|
| Section H2 | 1.2 | Tight (for large headings) |
| Section P | 1.4 | Normal |
| Card H3 | 1.33 | Slightly tight |
| Card Subtitle | 1.56 | Comfortable |
| Card Description | 1.625 | Relaxed (leading-relaxed) |
| Card Tags | 1.43 | Normal |
| CTA Text | 1.5 | Normal |

---

## 🎯 Key Design Principles

### 1. **Content Hub Architecture**

This section serves as a **visual navigation hub** for the entire site's content structure.

**Characteristics:**
- Each card represents a major content pillar
- Clear visual hierarchy guides exploration
- Balanced 2-column grid creates scannable layout
- Cards act as entry points to different sections

**Purpose:**
- Help users discover all major content areas
- Provide context for each section (subtitle + description)
- Encourage exploration through interactive design
- Maintain visual consistency across diverse content types

---

### 2. **Pointer Highlight as Visual Hook**

The Aceternity Pointer Highlight component creates a **premium, modern aesthetic**.

**Why it works:**
- **Draws attention** to key terms without being overwhelming
- **Animated appearance** creates moment of delight
- **Color-coded highlights** help users associate content with visual cues
- **Subtle effect** doesn't distract from content

**Strategic placement:**
- Section title: Highlights brand name "Marsstein"
- Card titles: Highlights the entire title to draw eye
- Uses 3 color variants to create visual variety

---

### 3. **Progressive Disclosure Through Animation**

Cards appear sequentially using **stagger animation** (100ms delay between each).

**Benefits:**
- **Waterfall effect** creates sense of flow
- **Guides eye movement** from top to bottom, left to right
- **Reduces cognitive overload** by introducing content gradually
- **Creates narrative** as cards appear in order

**Implementation:**
```tsx
transition={{ duration: 0.5, delay: index * 0.1 }}
```

---

### 4. **Hover Feedback Loop**

Multiple simultaneous hover effects create **rich interactive feedback**.

**4 Simultaneous Effects:**
1. Shadow elevation (card lifts)
2. Border color shift (definition increases)
3. Arrow slide (suggests forward motion)
4. Pointer highlight reinforcement (optional)

**Why multiple effects:**
- **Confirms interactivity** clearly
- **Provides smooth feedback** across all elements
- **Creates cohesive interaction** (everything moves together)
- **Feels premium** with subtle, coordinated animations

---

### 5. **Consistent Content Structure**

Every card follows the **same 5-element structure**:

```
1. Title (with Pointer Highlight)
2. Subtitle (benefit/tagline)
3. Description (2-3 lines)
4. Tags (3 bullet-separated keywords)
5. CTA (text + arrow)
```

**Benefits:**
- **Predictable layout** helps users scan quickly
- **Equal visual weight** across all cards
- **Easy to maintain** and add new cards
- **Flexible content** within fixed structure

---

### 6. **Color-Coded Information Architecture**

Uses **3-color rotation** to create visual variety while maintaining consistency.

**Color Meanings:**
- **Red (Marsstein):** Brand-related content (Frameworks, Mission)
- **Blue:** Educational content (DSGVO Course, Knowledge Center)
- **Green:** Interactive/Action content (Industry Solutions, Contact)

**Pattern:** Red → Blue → Green → Red → Blue → Green

**Purpose:**
- Creates visual rhythm
- Helps users remember content categories
- Prevents monotony of single color
- Maintains brand presence with red

---

### 7. **Equal Height Cards**

Uses `h-full` class to ensure all cards in a row have **equal height**.

**Benefits:**
- **Visual alignment** looks professional
- **Grid integrity** maintained even with varying content lengths
- **Prevents jagged rows** on desktop 2-column layout
- **Maintains balance** between left and right columns

**Implementation:**
```tsx
<motion.div>
  <a href={ctaLink} className="block h-full">
    {/* Card content */}
  </a>
</motion.div>
```

---

## 🔧 Customization Guide

### To Adapt for Your Brand

#### 1. Change Brand Colors

```tsx
// Update the highlightConfig object:
const highlightConfig = {
  red: {
    rectangle: "bg-[YOUR_PRIMARY_COLOR]/10",  // 10% opacity
    pointer: "text-[YOUR_PRIMARY_COLOR]",      // Solid color
    text: "text-[YOUR_PRIMARY_COLOR]",         // Tag/CTA color
  },
  // Keep or modify blue and green variants
};
```

**Example for Purple Brand:**
```tsx
const highlightConfig = {
  purple: {
    rectangle: "bg-purple-50",           // Or bg-[#YOUR_HEX]/10
    pointer: "text-purple-500",
    text: "text-purple-600",
  },
  // ... other variants
};
```

---

#### 2. Adjust Grid Layout

**For 3 Columns:**
```tsx
// Change grid class:
className="grid grid-cols-1 lg:grid-cols-3 gap-8"

// Adjust contentCards array to have 6 or 9 cards
// (multiples of 3 for even rows)
```

**For 1 Column (Stacked):**
```tsx
// Remove lg breakpoint:
className="grid grid-cols-1 gap-8"

// Works well for mobile-first designs or very detailed cards
```

---

#### 3. Modify Card Spacing

**Larger Gaps:**
```tsx
// Change gap-8 to gap-12:
className="grid grid-cols-1 lg:grid-cols-2 gap-12"
// Result: 48px gaps instead of 32px
```

**More Card Padding:**
```tsx
// Change p-8 lg:p-10 to p-10 lg:p-12:
className="bg-white rounded-2xl p-10 lg:p-12"
// Result: 40px → 48px padding
```

---

#### 4. Customize Typography Scale

**Larger Headings:**
```tsx
// Section heading:
className="text-4xl lg:text-6xl font-bold"
// 36px → 60px (was 30px → 48px)

// Card titles:
className="text-3xl font-bold"
// 30px (was 24px)
```

**Smaller Descriptions:**
```tsx
// Card descriptions:
className="text-sm leading-relaxed"
// 14px (was 16px)
```

---

#### 5. Change Animation Timings

**Faster Stagger:**
```tsx
transition={{ duration: 0.5, delay: index * 0.05 }}
// 50ms delay between cards (was 100ms)
```

**Slower Hover Transitions:**
```tsx
className="transition-all duration-500"
// 500ms (was 300ms)
```

**Disable Stagger:**
```tsx
transition={{ duration: 0.5, delay: 0 }}
// All cards appear simultaneously
```

---

#### 6. Add More/Fewer Cards

**8 Cards (4×2 Grid):**
```tsx
const contentCards = [
  // ... 6 existing cards
  {
    title: "Card 7",
    // ... card 7 data
  },
  {
    title: "Card 8",
    // ... card 8 data
  },
];
```

**4 Cards (2×2 Grid):**
```tsx
// Remove 2 cards from array
// Ensure even number for balanced 2-column layout
```

---

#### 7. Customize Pointer Highlight

**Different Highlight Styles:**
```tsx
// Stronger background:
rectangleClassName="bg-[#e24e1b]/20"  // 20% opacity (was 10%)

// Different pointer position:
// (requires modifying the PointerHighlight component internals)

// No pointer dot, just rectangle:
pointerClassName="text-transparent"
```

---

## 🐛 Common Pitfalls & Solutions

### 1. Pointer Highlight Not Appearing

**Problem:** Highlight rectangle and pointer don't show up.

**Solutions:**
```bash
# Ensure Aceternity component is installed:
npx shadcn@latest add @aceternity/pointer-highlight

# Check import path:
import { PointerHighlight } from '@/components/ui/pointer-highlight';

# Verify Framer Motion is installed:
npm install framer-motion

# Check Tailwind arbitrary values are working:
# bg-[#e24e1b]/10 requires Tailwind 3.0+
```

---

### 2. Cards Have Different Heights

**Problem:** Cards in the same row have unequal heights.

**Solution:**
```tsx
// Ensure <a> tag has h-full:
<a href={ctaLink} className="block h-full">

// Parent motion.div should NOT have height constraints
<motion.div> {/* No h-full here */}
  <a className="h-full">
```

---

### 3. Arrow Doesn't Slide on Hover

**Problem:** Arrow icon doesn't move when card is hovered.

**Solution:**
```tsx
// Parent must have "group" class:
<a className="group block h-full">

// Arrow must have group-hover:
<IconArrowRight className="group-hover:translate-x-1" />

// Ensure transition is added:
className="transition-transform duration-300 group-hover:translate-x-1"
```

---

### 4. Stagger Animation Not Working

**Problem:** All cards appear at once instead of sequentially.

**Solution:**
```tsx
// Check delay calculation:
transition={{ duration: 0.5, delay: index * 0.1 }}

// Ensure index is passed correctly:
{contentCards.map((card, index) => (
  <ContentCard key={card.title} {...card} index={index} />
//                                                 ^^^^^ Must pass index
))}

// Verify viewport settings:
viewport={{ once: true, margin: "-50px" }}
```

---

### 5. Tags Overflow on Small Screens

**Problem:** Long tag text wraps awkwardly or overflows.

**Solution:**
```tsx
// Ensure flex-wrap is present:
<div className="flex flex-wrap gap-2">

// Shorten tag text for mobile:
{isMobile ? "DSGVO" : "Datenschutz-Grundverordnung"}

// Or use text-ellipsis:
<span className="text-sm truncate max-w-[120px]">
  {tag}
</span>
```

---

### 6. Colors Don't Match

**Problem:** Highlight colors look different from brand colors.

**Solution:**
```tsx
// Use exact hex values:
bg-[#e24e1b]/10  // ← Exact Marsstein red

// OR define in Tailwind config:
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'marsstein': '#e24e1b',
      },
    },
  },
}

// Then use:
bg-marsstein/10
text-marsstein
```

---

### 7. Grid Breaks on Tablet

**Problem:** Layout looks wrong at 768px-1023px.

**Solution:**
```tsx
// Check breakpoint:
className="grid grid-cols-1 lg:grid-cols-2"
//                           ^^ lg = 1024px+

// If you want 2 columns at tablet size (768px):
className="grid grid-cols-1 md:grid-cols-2"
//                           ^^ md = 768px+

// Current design intentionally keeps single column until 1024px
// for better readability on tablets in portrait mode
```

---

## ✅ Implementation Checklist

### Prerequisites
- [ ] Node.js 16+ installed
- [ ] React 18+ project set up
- [ ] Tailwind CSS 3+ configured
- [ ] TypeScript (recommended but not required)

### Dependencies
- [ ] Install Tabler Icons: `npm install @tabler/icons-react`
- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Install Aceternity Pointer Highlight: `npx shadcn@latest add @aceternity/pointer-highlight`
- [ ] Verify `clsx` and `tailwind-merge` for cn() utility

### Component Setup
- [ ] Create `components/MarssteinDiscoveryGrid.tsx`
- [ ] Copy complete code template from this spec
- [ ] Verify import paths (`@/components/ui/...`, `@/lib/utils`)
- [ ] Add component to your page/layout

### Content Customization
- [ ] Update 6 card objects with your content
- [ ] Verify all ctaLink paths match your routing
- [ ] Adjust titles (keep 1-3 words)
- [ ] Adjust subtitles (keep 3-5 words)
- [ ] Adjust descriptions (keep 15-25 words)
- [ ] Update tags (exactly 3 per card)

### Brand Customization
- [ ] Replace #e24e1b with your brand color in highlightConfig
- [ ] Test Pointer Highlight with your colors
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Update color variant names if needed

### Layout Testing
- [ ] Test on mobile (< 640px): single column
- [ ] Test on tablet (640px-1023px): single column
- [ ] Test on desktop (1024px+): 2 columns
- [ ] Verify 32px gaps between cards
- [ ] Confirm cards have equal heights

### Animation Testing
- [ ] Scroll to section, verify stagger animation (100ms delays)
- [ ] Hover over each card, verify 4 effects:
  - [ ] Shadow appears (shadow-lg)
  - [ ] Border darkens (gray-200 → gray-300)
  - [ ] Arrow slides right (4px)
  - [ ] Pointer Highlight remains visible
- [ ] Test animations on different browsers
- [ ] Verify animations respect prefers-reduced-motion

### Pointer Highlight Testing
- [ ] Section title "Marsstein" highlights with red
- [ ] Each card title highlights with correct variant color
- [ ] Rectangle background appears smoothly
- [ ] Pointer dot appears near text
- [ ] Animation completes in ~400ms

### Interactive Testing
- [ ] Click each card, verify navigation works
- [ ] Test keyboard navigation (Tab through cards)
- [ ] Verify focus states are visible
- [ ] Test screen reader accessibility
- [ ] Verify all links have correct href attributes

### Performance Testing
- [ ] Check Lighthouse score (target: 90+)
- [ ] Verify no layout shift (CLS < 0.1)
- [ ] Test with slow network (animations still smooth)
- [ ] Check for memory leaks (Framer Motion cleanup)

### Browser Compatibility
- [ ] Chrome 90+ (desktop & mobile)
- [ ] Firefox 88+
- [ ] Safari 14+ (desktop & iOS)
- [ ] Edge 90+
- [ ] Test on actual devices if possible

### Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader announces card titles and CTAs
- [ ] Reduced motion respected (prefers-reduced-motion)

### Final Checks
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] All content is spell-checked
- [ ] Links open correct pages
- [ ] Component matches design specification
- [ ] Code is clean and commented where necessary

---

## 📚 Dependencies

### Required Packages

```json
{
  "dependencies": {
    "@tabler/icons-react": "^3.0.0",
    "framer-motion": "^11.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Installation Commands

```bash
# Core dependencies
npm install @tabler/icons-react framer-motion clsx tailwind-merge

# Aceternity Pointer Highlight (includes component + dependencies)
npx shadcn@latest add @aceternity/pointer-highlight

# If TypeScript (recommended)
npm install --save-dev @types/react typescript
```

### Utility Function (lib/utils.ts)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Purpose:** Combines multiple class names intelligently, merging Tailwind classes to prevent conflicts.

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support (iOS 14.5+) |
| Edge | 90+ | Full support |
| Opera | 76+ | Full support |
| Samsung Internet | 14+ | Full support |

### CSS Features Used

```css
/* Modern CSS features that require support: */
- CSS Grid (all modern browsers)
- Flexbox (all modern browsers)
- CSS Transitions (all modern browsers)
- CSS Transforms (translateY, translateX, scale)
- CSS Custom Properties / Variables (for Tailwind)
- calc() function
- rgba() colors with alpha
- Gradient backgrounds (linear-gradient)
- Border-radius
- Box-shadow with multiple layers
```

### JavaScript Features Used

```javascript
// Modern JS features that require support:
- ES6+ syntax (arrow functions, destructuring, etc.)
- Optional chaining (?.)
- Nullish coalescing (??)
- Array.map(), Array.forEach()
- Template literals
- Spread operator
- React Hooks (useState, useEffect, etc.)
- Framer Motion (uses Web Animations API)
```

### Polyfills

**Not Required** for modern browsers (Chrome 90+, Firefox 88+, Safari 14+).

**If supporting older browsers:**
```bash
# Install polyfills
npm install intersection-observer
npm install web-animations-js

# Import in your entry file
import 'intersection-observer';
import 'web-animations-js';
```

---

## 🎯 Final Notes

### Design Philosophy

This component embodies **"Progressive Disclosure Through Delight"**:

1. **Content is King:** Clear hierarchy ensures users understand each section's purpose
2. **Animation Enhances:** Stagger animation and pointer highlights add polish without distraction
3. **Interaction Rewards:** Hover effects provide satisfying feedback that encourages exploration
4. **Consistency Guides:** Repeated structure across cards helps users scan quickly

### When to Use This Pattern

**✅ Perfect For:**
- Homepage content navigation
- Resource libraries with multiple categories
- Service/product portfolio showcases
- Content hubs with 4-9 major sections
- Sites where exploration is encouraged

**❌ Avoid For:**
- Single call-to-action pages (use hero instead)
- E-commerce product grids (use product cards)
- Blog post listings (use article previews)
- Data-heavy dashboards (use tables/charts)

### Performance Considerations

**Optimization Tips:**
1. **Lazy load component** if below the fold:
   ```tsx
   const MarssteinDiscoveryGrid = lazy(() => import('./MarssteinDiscoveryGrid'));
   ```

2. **Reduce animation complexity** for low-end devices:
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   // Conditionally disable stagger animation
   ```

3. **Optimize images** if you add card icons later:
   - Use WebP format
   - Lazy load images
   - Provide width/height to prevent layout shift

4. **Minimize bundle size**:
   - Tree-shake unused Tabler icons
   - Use production build of Framer Motion
   - Enable Tailwind CSS purging

### Maintenance Notes

**Easy to Update:**
- Adding new cards: Push new object to `contentCards` array
- Changing colors: Update `highlightConfig` object
- Adjusting spacing: Modify gap-X and p-X classes
- Swapping icons: Change IconArrowRight import

**Test After Changes:**
- Mobile layout (single column)
- Desktop layout (2 columns, equal heights)
- All hover effects still work
- Pointer Highlight still appears
- Links navigate correctly

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-11  
**Author:** Based on Marsstein Design + Aceternity UI  
**License:** Custom  
**Component LOC:** ~200 lines  
**Specification LOC:** 1700+ lines  

---

**End of Ultra-Detailed Specification Document**
