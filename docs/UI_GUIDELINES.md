# $yncFlow — UI Guidelines

## 1. Design Philosophy

Premium fintech aesthetic inspired by CRED and Jupiter. Clean, modern, trustworthy, and delightful.

## 2. Color Palette

### Primary Colors
```
Deep Emerald:    #0D6B4F
Forest Green:    #1A8C62
Gold:            #F5A623
```

### Neutral Colors
```
White:           #FFFFFF
Off White:       #F8F9FA
Light Gray:      #E9ECEF
Gray:            #6C757D
Dark Gray:       #343A40
Dark Slate:      #1A1D21
Near Black:      #0D0E11
```

### Semantic Colors
```
Success:         #10B981
Warning:         #F59E0B
Error:           #EF4444
Info:            #3B82F6
```

### Dark Mode Adjustments
```
Background:      #1A1D21
Surface:         #23272E
Surface 2:       #2D323A
Border:          #3A3F48
Text Primary:    #FFFFFF
Text Secondary:  #9CA3AF
```

## 3. Typography

### Font Family
- Web: Inter (headings), Inter (body)
- Mobile: Inter (system font fallback)

### Font Sizes
```
Display:  48px / 3rem (Bold)
H1:       36px / 2.25rem (Bold)
H2:       30px / 1.875rem (Bold)
H3:       24px / 1.5rem (Semibold)
H4:       20px / 1.25rem (Semibold)
Body:     16px / 1rem (Regular)
Small:    14px / 0.875rem (Regular)
XSmall:   12px / 0.75rem (Regular)
```

### Line Heights
```
Display/H1: 1.2
H2/H3/H4:   1.3
Body:       1.5
Small:      1.4
```

## 4. Spacing System (TailwindCSS defaults)
```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
3xl:  64px  (4rem)
```

## 5. Border Radius
```
sm:    6px
md:    12px
lg:    16px
xl:    24px
full:  9999px
```

## 6. Shadows
```
sm:    0 1px 3px rgba(0,0,0,0.08)
md:    0 4px 12px rgba(0,0,0,0.1)
lg:    0 8px 24px rgba(0,0,0,0.12)
xl:    0 12px 36px rgba(0,0,0,0.16)
```

## 7. Component Patterns

### Cards
- White/light gray background (or surface in dark mode)
- Rounded corners (lg)
- Subtle shadow (sm/md)
- Padding: 24px

### Buttons
- Primary: Deep Emerald background, White text
- Secondary: Outline with Deep Emerald border
- Ghost: Transparent, text color
- Border radius: md (12px)
- Padding: 12px 24px
- Hover: slight opacity/darken
- Active: scale(0.98)

### Inputs
- Background: Off White / Surface
- Border: Light Gray / Border (1px)
- Border radius: md
- Padding: 12px 16px
- Focus: Deep Emerald border ring
- Label: 14px, Gray, above input
- Error: Red border, red helper text

### Navigation
- Sidebar (Web): Dark Slate background, active item highlighted
- Bottom Nav (Mobile): Simple, icon + label
- Clean, minimal, high contrast

### Charts
- Consistent color palette
- Responsive
- Interactive (hover tooltips)
- Smooth animations
- Area charts with gradient fills

## 8. Logo & Branding

### Logo Mark
A minimalist icon combining:
- Upward arrow (growth)
- Shield outline (security)
- Circular sync arrows (synchronization)

### Color Logo
- Deep Emerald (#0D6B4F) primary
- Gold (#F5A623) accent

### Monochrome Logo
- White on dark backgrounds
- Near Black (#0D0E11) on light backgrounds

### Logo Usage
- Minimum clear space: 16px on all sides
- Never distort, rotate, or recolor arbitrarily
- Favicon: simplified logo mark

## 9. Responsive Breakpoints
```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

## 10. Accessibility

- All interactive elements focusable
- Keyboard navigation support
- ARIA labels on icons
- Color contrast ratio > 4.5:1 for text
- Focus indicators visible
- Semantic HTML
- alt text on all images

## 11. Animations

- Subtle and purposeful
- Duration: 150-300ms
- Easing: ease-in-out
- Page transitions: fade + slide
- Hover effects: lift, scale, color change
- No animation on reduced-motion preference

## 12. Dark Mode

- Automatic detection (prefers-color-scheme)
- Manual toggle in settings
- All colors adjusted
- Charts use dark mode palette
- Smooth transition between modes

## 13. Mobile (Flutter) Specifics

- Material 3 with custom theme
- Same color palette
- NavigationRail (tablets) / NavigationBar (phones)
- Bottom sheets for actions
- Pull-to-refresh
- Skeleton loading
- Haptic feedback for key actions

## 14. Empty States

All empty states should include:
- Illustration/icon
- Clear message
- Action button (where applicable)

## 15. Loading States

- Skeleton screens (preferred)
- Spinners for button actions
- Progress bar for sync operations
- Subtle shimmer effect
