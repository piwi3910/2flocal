# 2FLocal Style Guide

This style guide defines the visual language for the 2FLocal mobile application, including colors, typography, spacing, and other design elements.

## Color Palette

### Primary Colors

| Color Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| Primary | `#006494` | `#4DA1A9` | Primary actions, navigation elements, key UI components |
| Secondary | `#4DA1A9` | `#81D4FA` | Secondary actions, supporting UI elements |
| Tertiary | `#D7263D` | `#FF6B6B` | Critical actions, alerts, important information |

### Semantic Colors

| Color Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| Success | `#2E933C` | `#4CAF50` | Success messages, completed actions, positive feedback |
| Warning | `#F9A826` | `#FFB74D` | Warning messages, actions requiring caution |
| Error | `#D7263D` | `#FF6B6B` | Error messages, failed actions, critical alerts |
| Info | `#2196F3` | `#64B5F6` | Informational messages, neutral notifications |

### Surface Colors

| Color Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| Background | `#F5F5F5` | `#121212` | Main app background |
| Surface | `#FFFFFF` | `#1E1E1E` | Cards, dialogs, elevated surfaces |
| Surface Variant | `#E7E7E7` | `#2C2C2C` | Alternative surfaces, subtle distinctions |
| Outline | `#74777F` | `#8E9193` | Borders, dividers |
| Outline Variant | `#C4C7C5` | `#444746` | Subtle borders, dividers |

### Text Colors

| Color Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| On Primary | `#FFFFFF` | `#FFFFFF` | Text on primary color |
| On Secondary | `#FFFFFF` | `#000000` | Text on secondary color |
| On Tertiary | `#FFFFFF` | `#000000` | Text on tertiary color |
| On Background | `#1A1A1A` | `#E1E1E1` | Text on background |
| On Surface | `#1A1A1A` | `#E1E1E1` | Text on surface |
| On Surface Variant | `#444444` | `#C4C7C5` | Text on surface variant |

### Accessibility

All color combinations in this style guide meet WCAG 2.1 AA accessibility standards for contrast:
- Normal text (14px): 4.5:1 contrast ratio
- Large text (18px or 14px bold): 3:1 contrast ratio
- UI components and graphical objects: 3:1 contrast ratio

## Typography

### Font Family

The 2FLocal app uses the system font for optimal performance and native feel:
- iOS: San Francisco
- Android: Roboto

### Type Scale

| Variant | Font Size | Font Weight | Line Height | Letter Spacing | Usage |
|---------|-----------|-------------|-------------|----------------|-------|
| Display Large | 32px | Bold (700) | 38.4px | 0.15px | Major features, page headers |
| Display Medium | 24px | Bold (700) | 28.8px | 0.15px | Major section headers |
| Display Small | 20px | Medium (500) | 24px | 0.1px | Section headers |
| Headline Large | 20px | Bold (700) | 24px | 0.15px | Important headings |
| Headline Medium | 18px | Bold (700) | 21.6px | 0.15px | Sub-headings |
| Headline Small | 16px | Bold (700) | 19.2px | 0.1px | Minor headings |
| Title Large | 18px | Medium (500) | 21.6px | 0.15px | Card titles, section titles |
| Title Medium | 16px | Medium (500) | 19.2px | 0.15px | Card titles, section titles |
| Title Small | 14px | Medium (500) | 16.8px | 0.1px | Small titles, labels |
| Body Large | 16px | Regular (400) | 24px | 0.15px | Primary body text |
| Body Medium | 14px | Regular (400) | 21px | 0.25px | Secondary body text |
| Body Small | 12px | Regular (400) | 18px | 0.4px | Captions, footnotes |
| Label Large | 14px | Medium (500) | 16.8px | 0.1px | Button text, important labels |
| Label Medium | 12px | Medium (500) | 14.4px | 0.5px | Form labels, secondary labels |
| Label Small | 11px | Medium (500) | 13.2px | 0.5px | Small labels, metadata |

## Spacing

The 2FLocal app uses a consistent spacing scale to maintain visual harmony and proper information hierarchy.

### Spacing Scale

| Name | Size | Usage |
|------|------|-------|
| xs | 4px | Minimal spacing, tight layouts |
| sm | 8px | Default spacing between related elements |
| md | 16px | Standard spacing between sections |
| lg | 24px | Large spacing for visual separation |
| xl | 32px | Extra large spacing for major sections |
| xxl | 48px | Maximum spacing for major layout divisions |

### Layout Guidelines

- Use consistent spacing throughout the application
- Maintain proper spacing between related elements
- Use larger spacing to separate unrelated elements
- Ensure adequate touch targets (minimum 44x44px)
- Maintain consistent margins and padding

## Elevation and Shadows

Elevation helps establish hierarchy and focus by lifting elements above others.

### Elevation Scale

| Level | Elevation | Usage |
|-------|-----------|-------|
| 0 | No elevation | Flat elements, backgrounds |
| 1 | 2dp | Subtle elevation, cards, buttons |
| 2 | 3dp | Moderate elevation, active cards |
| 3 | 6dp | Higher elevation, dialogs, bottom sheets |
| 4 | 8dp | Significant elevation, navigation drawers |
| 5 | 12dp | Maximum elevation, modals |

## Border Radius

Consistent border radius helps maintain visual harmony.

| Component | Border Radius | Usage |
|-----------|---------------|-------|
| Small | 4px | Small elements, chips, badges |
| Medium | 8px | Cards, buttons, inputs |
| Large | 16px | Floating action buttons, modals |
| Circular | 50% | Avatar, circular buttons |

## Icons

The 2FLocal app uses Material Design icons for consistency and familiarity.

### Icon Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| Small | 16x16px | Inline icons, dense UIs |
| Medium | 24x24px | Standard icons, navigation |
| Large | 32x32px | Feature icons, empty states |
| Extra Large | 48x48px | Hero icons, onboarding |

### Icon Colors

- Use the appropriate on-color for icons (e.g., onPrimary for icons on primary background)
- Maintain sufficient contrast for accessibility
- Use semantic colors for status icons (success, warning, error, info)

## Motion and Animation

Animations should be subtle, purposeful, and enhance the user experience without being distracting.

### Duration Guidelines

| Type | Duration | Usage |
|------|----------|-------|
| Instant | 100ms | Micro-interactions, button presses |
| Quick | 200ms | Standard transitions, reveals |
| Moderate | 300ms | Complex transitions, page changes |
| Slow | 400ms+ | Elaborate animations, onboarding |

### Easing

- Standard easing: Cubic-bezier(0.4, 0.0, 0.2, 1)
- Deceleration: Cubic-bezier(0.0, 0.0, 0.2, 1)
- Acceleration: Cubic-bezier(0.4, 0.0, 1, 1)

## Responsive Design

The 2FLocal app is designed to work on various screen sizes and orientations.

### Breakpoints

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| Small | < 360dp | Small phones |
| Medium | 360dp - 400dp | Average phones |
| Large | > 400dp | Large phones, small tablets |
| Extra Large | > 600dp | Tablets |

### Orientation Support

- All screens should support both portrait and landscape orientations
- Layouts should adapt appropriately to orientation changes
- Critical actions should remain accessible in all orientations

## Accessibility Guidelines

The 2FLocal app is designed to be accessible to all users, including those with disabilities.

### Color and Contrast

- Maintain minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information
- Provide sufficient contrast between foreground and background elements

### Touch Targets

- Ensure touch targets are at least 44x44px
- Provide adequate spacing between interactive elements
- Make sure interactive elements are clearly identifiable

### Text and Typography

- Use appropriate text sizes (minimum 12px for body text)
- Maintain proper line spacing for readability
- Support dynamic text sizes for users with visual impairments

### Screen Readers

- Provide meaningful labels for all UI elements
- Use semantic HTML elements
- Ensure proper focus order for keyboard navigation
- Test with screen readers on both iOS and Android

## Implementation Notes

This style guide is implemented using React Native Paper and custom components. The theme configuration can be found in `app/src/theme/theme.ts` and the components are in `app/src/components/common/`.