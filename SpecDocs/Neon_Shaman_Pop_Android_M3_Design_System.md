# 🎤 Neon Shaman Pop

## Android (Material 3) UI Brand & Design System v2.0

------------------------------------------------------------------------

# 0. Design Foundation

Platform: **Android (Material 3 -- M3)**\
Reference: https://m3.material.io/\
Mode: **Dark Mode Only**\
Form Factor: Mobile only

Design Philosophy: - Follow **Material 3 layout, motion, elevation, and
accessibility rules** - Inject Neon Shaman Pop identity only through
**color accents + symbolic elements** - Maintain **modern minimal
structure** - Avoid decorative overload

------------------------------------------------------------------------

# 1. Material 3 Layout System

## 1.1 Grid System (Mobile)

Material 3 mobile layout grid:

-   Column Count: **4 columns**
-   Margin: **16dp**
-   Gutter: **16dp**
-   Max Content Width: Full width minus margins

------------------------------------------------------------------------

# 2. Spacing System (8dp Base Unit)

Base Unit: **8dp**

  Token   Value
  ------- -------
  XS      4dp
  S       8dp
  M       16dp
  L       24dp
  XL      32dp
  XXL     40dp

Rules: - Minimum touch target: **48dp height** - Button height:
**48dp** - Card padding: **16dp** - Section spacing: **24dp** - Page top
padding: **16dp**

------------------------------------------------------------------------

# 3. Shape System (Material 3)

  Component      Radius
  -------------- --------
  Card           16dp
  Bottom Sheet   24dp
  Dialog         28dp
  Button         24dp
  Small Chips    12dp

Avoid sharp corners.

------------------------------------------------------------------------

# 4. Elevation (Dark Mode Adjusted)

Use M3 tonal elevation instead of heavy shadows.

  Level     Use Case
  --------- ------------------
  Level 0   Background
  Level 1   Cards
  Level 2   Floating Buttons
  Level 3   Bottom Sheet

Neon glow must NOT replace elevation. Glow is decorative, not
structural.

------------------------------------------------------------------------

# 5. Color System (M3 Adaptive Dark)

## 5.1 Base Surfaces

  Token               Color
  ------------------- ------------------------
  Surface             #0B0F14
  Surface Variant     #121722
  Surface Container   #161C26
  Outline             rgba(255,255,255,0.08)

------------------------------------------------------------------------

## 5.2 Accent Integration (Mapped to M3 Roles)

Primary → Neon Pink `#FF2F92`\
Secondary → Neon Violet `#8A5CFF`\
Tertiary → Neon Cyan `#00F0FF`

Use as: - Selected state - Focus indicator - Active tab underline - Fan
level badge

Never use neon as background fill except primary CTA.

------------------------------------------------------------------------

# 6. Component Specifications

## 6.1 Main Feed (TikTok Style)

Layout: - Full height composable - Edge-to-edge video - Right vertical
action column (56dp width zone) - Bottom info container (padding 16dp)

Right Action Buttons: - Icon size: 24dp - Touch container: 48dp -
Vertical spacing: 16dp

------------------------------------------------------------------------

## 6.2 Top Navigation (Swipe Sections)

Tabs: - Indicator thickness: 2dp neon line - Horizontal padding: 16dp -
Height: 48dp

Typography: - Label Medium (M3)

------------------------------------------------------------------------

## 6.3 Character Creation Screen

Card layout: - Full width card - Margin: 16dp - Padding: 16dp - Option
chip height: 40dp

Selected state: - Outline neon (2dp) - No heavy glow

Primary CTA: - Height: 48dp - Corner radius: 24dp - Solid Neon Pink
background

------------------------------------------------------------------------

## 6.4 Ranking Screen

List Item: - Height: 72dp - Padding horizontal: 16dp - Padding vertical:
12dp

Top 3: - Badge size: 28dp - Neon glow allowed (subtle)

------------------------------------------------------------------------

## 6.5 Character Profile

Header height: 240dp\
Overlay gradient top to bottom (black 60% → transparent)

Follow Button: - Outlined style - Border 1.5dp neon - Height 48dp

------------------------------------------------------------------------

# 7. Motion (Material 3 Compliant)

Standard durations:

  Type                  Duration
  --------------------- ----------
  Fade                  200ms
  Scale                 150ms
  Container transform   300ms

Easing: Standard M3 easing curves.

Glow animation allowed only for: - Fan level up - Ranking promotion

------------------------------------------------------------------------

# 8. Accessibility

-   Minimum contrast ratio: 4.5:1
-   Touch target: 48dp minimum
-   Avoid neon text on dark without sufficient contrast
-   Haptic feedback on key actions (follow, level up)

------------------------------------------------------------------------

# 9. Brand Guardrails

Do NOT: - Overuse gradients - Use neon backgrounds extensively - Break
Material spacing rules - Add decorative clutter

Do: - Keep surfaces clean - Use neon as ritual accent - Maintain
structural consistency

------------------------------------------------------------------------

# 10. Final Principle

This is a **Material 3 structured app with a Neon Shaman identity layer
--- not a fantasy UI.**

The system must feel: - Clean - Structured - Professional - With
controlled mystical energy
