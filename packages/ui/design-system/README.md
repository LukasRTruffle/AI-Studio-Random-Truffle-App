# Random Truffle Design System

A comprehensive, best-in-class design system built with Tailwind CSS v3.4+ and React.

---

## Design Philosophy

### Principles

1. **Clarity**: Clear, intuitive interfaces that guide users
2. **Efficiency**: Fast, responsive interactions with minimal friction
3. **Consistency**: Unified visual language across all touchpoints
4. **Accessibility**: WCAG 2.1 AA compliant, keyboard-navigable
5. **Trust**: Professional, data-driven aesthetic for enterprise users

### Visual Language

- **Modern & Professional**: Clean lines, subtle shadows, purposeful color
- **Data-First**: Optimized for analytics, charts, and complex workflows
- **Marketing Intelligence**: Sophisticated palette reflecting AI and data science

---

## Foundation

### Color System

Our color palette is designed for:

- **Marketing Intelligence**: Blues and purples for AI/data
- **Clear Hierarchy**: Semantic colors for states and actions
- **Accessibility**: AAA contrast ratios for text
- **Dark Mode Ready**: All colors work in light and dark themes

#### Primary Colors (Brand)

```
Indigo (Primary)
- 50:  #EEF2FF (Lightest background)
- 100: #E0E7FF
- 200: #C7D2FE
- 300: #A5B4FC
- 400: #818CF8
- 500: #6366F1 (Brand primary)
- 600: #4F46E5 (Hover state)
- 700: #4338CA
- 800: #3730A3
- 900: #312E81 (Darkest text)
- 950: #1E1B4B
```

#### Semantic Colors

```
Success (Green)
- 50:  #F0FDF4
- 500: #22C55E (Success state)
- 600: #16A34A (Hover)
- 700: #15803D (Active)

Warning (Amber)
- 50:  #FFFBEB
- 500: #F59E0B (Warning state)
- 600: #D97706 (Hover)
- 700: #B45309 (Active)

Error (Red)
- 50:  #FEF2F2
- 500: #EF4444 (Error state)
- 600: #DC2626 (Hover)
- 700: #B91C1C (Active)

Info (Blue)
- 50:  #EFF6FF
- 500: #3B82F6 (Info state)
- 600: #2563EB (Hover)
- 700: #1D4ED8 (Active)
```

#### Neutral Colors (Grayscale)

```
Slate (Neutral)
- 50:  #F8FAFC (Backgrounds)
- 100: #F1F5F9
- 200: #E2E8F0 (Borders)
- 300: #CBD5E1
- 400: #94A3B8 (Disabled)
- 500: #64748B (Secondary text)
- 600: #475569 (Body text)
- 700: #334155 (Headings)
- 800: #1E293B
- 900: #0F172A (Primary text)
- 950: #020617 (Black)
```

### Typography

#### Font Families

```
Sans-serif (Primary): Inter
- Headings, body text, UI elements
- Modern, highly legible, great for data

Mono (Code/Data): JetBrains Mono
- Code blocks, data tables, monospaced numbers
- Excellent for technical content
```

#### Type Scale

```
text-xs:    12px / 16px (0.75rem)    - Captions, labels
text-sm:    14px / 20px (0.875rem)   - Small body text
text-base:  16px / 24px (1rem)       - Body text
text-lg:    18px / 28px (1.125rem)   - Large body
text-xl:    20px / 28px (1.25rem)    - Subheadings
text-2xl:   24px / 32px (1.5rem)     - H3
text-3xl:   30px / 36px (1.875rem)   - H2
text-4xl:   36px / 40px (2.25rem)    - H1
text-5xl:   48px / 1 (3rem)          - Display
text-6xl:   60px / 1 (3.75rem)       - Hero
```

#### Font Weights

```
font-light:     300 - Subtle emphasis
font-normal:    400 - Body text
font-medium:    500 - UI elements, buttons
font-semibold:  600 - Subheadings, emphasis
font-bold:      700 - Headings
font-extrabold: 800 - Display text
```

### Spacing Scale

```
0:    0px
px:   1px
0.5:  2px
1:    4px
1.5:  6px
2:    8px
2.5:  10px
3:    12px
3.5:  14px
4:    16px
5:    20px
6:    24px
7:    28px
8:    32px
9:    36px
10:   40px
11:   44px
12:   48px
14:   56px
16:   64px
20:   80px
24:   96px
28:   112px
32:   128px
```

### Border Radius

```
rounded-none:   0px
rounded-sm:     2px
rounded:        4px
rounded-md:     6px
rounded-lg:     8px
rounded-xl:     12px
rounded-2xl:    16px
rounded-3xl:    24px
rounded-full:   9999px
```

### Shadows

```
shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)
```

### Animation & Transitions

```
transition-none:     0ms
transition-fast:     150ms
transition-base:     200ms
transition-slow:     300ms
transition-slower:   500ms

Easing:
ease-linear:    linear
ease-in:        cubic-bezier(0.4, 0, 1, 1)
ease-out:       cubic-bezier(0, 0, 0.2, 1)
ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Components

### Component Categories

1. **Primitives**: Button, Input, Select, Checkbox, Radio, Switch
2. **Layout**: Container, Grid, Stack, Divider, Spacer
3. **Navigation**: Navbar, Sidebar, Breadcrumbs, Tabs, Pagination
4. **Data Display**: Table, Card, Badge, Avatar, Tooltip
5. **Feedback**: Alert, Toast, Modal, Progress, Spinner
6. **Forms**: FormGroup, Label, Error, Helper Text
7. **Charts**: Line, Bar, Pie, Area (via Recharts)

### Component Principles

- **Accessible by Default**: ARIA labels, keyboard navigation
- **Composable**: Small, focused components that combine
- **Consistent API**: Props follow naming conventions
- **Type-Safe**: Full TypeScript support
- **Themeable**: Support for light/dark modes

---

## Usage

### Installation

```bash
# The design system is part of @random-truffle/ui package
pnpm add @random-truffle/ui
```

### Import Components

```tsx
import { Button, Input, Card } from '@random-truffle/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### Using Design Tokens

```tsx
// Use Tailwind classes directly
<div className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md">
  Hello World
</div>

// Or use CSS variables
<div style={{
  backgroundColor: 'var(--color-primary-500)',
  color: 'var(--color-white)'
}}>
  Hello World
</div>
```

---

## Best Practices

### Layout

- Use consistent spacing (multiples of 4px)
- Maintain 8px baseline grid
- Use max-width for readability (65-75 characters)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Typography

- Line height: 1.5 for body text, 1.2 for headings
- Max line length: 65-75 characters (prose-lg)
- Hierarchy: Use size + weight to establish hierarchy
- Consistency: Stick to type scale, don't use arbitrary sizes

### Color

- Use semantic colors (success, error, warning) consistently
- Maintain AAA contrast for text (4.5:1 minimum)
- Use primary color sparingly (CTAs, key actions)
- Gray for most UI elements

### Interaction

- Hover states for all interactive elements
- Focus states with visible outlines (2px indigo ring)
- Disabled states at 50% opacity
- Loading states for async actions

---

## Accessibility

### WCAG 2.1 AA Compliance

- ✅ Color contrast ratios meet AAA standards
- ✅ Keyboard navigation for all interactive elements
- ✅ Screen reader support with ARIA labels
- ✅ Focus indicators visible and clear
- ✅ Text resizable to 200% without loss of functionality
- ✅ Touch targets minimum 44x44px

### Testing Tools

- **axe DevTools**: Browser extension for automated testing
- **WAVE**: Web accessibility evaluation tool
- **Keyboard Testing**: Tab through all interactive elements
- **Screen Reader**: Test with NVDA (Windows) or VoiceOver (macOS)

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version:** 1.0.0
**Last Updated:** 2025-10-26
**Maintained By:** Random Truffle Engineering
