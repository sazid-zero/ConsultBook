# ConsultBook Design System
## Complete Style Guide & Implementation Guidelines

---

## 🎨 Color Palette

### Primary Colors
```
Blue (Primary):         #3B82F6
  Light:               #DBEAFE
  Lighter:             #EFF6FF
  Dark:                #1E40AF

Accent/Success:        #10B981
  Light:               #D1FAE5
  Lighter:             #ECFDF5

Warning:               #F59E0B
  Light:               #FEF3C7
  Lighter:             #FFFBEB

Danger:                #EF4444
  Light:               #FEE2E2
  Lighter:             #FEF2F2

Purple (Premium):      #8B5CF6
  Light:               #EDE9FE
  Lighter:             #F5F3FF
```

### Neutrals
```
Gray-50:    #F9FAFB (Lightest background)
Gray-100:   #F3F4F6
Gray-200:   #E5E7EB
Gray-300:   #D1D5DB
Gray-400:   #9CA3AF
Gray-500:   #6B7280 (Body text)
Gray-600:   #4B5563
Gray-700:   #374151
Gray-800:   #1F2937
Gray-900:   #111827 (Darkest)
```

### Usage Guidelines
```
Primary Blue:       Main CTAs, links, active states, headers
Accent Green:       Success messages, positive actions
Warning Orange:     Cautions, pending states, notifications
Danger Red:         Errors, cancellations, destructive actions
Purple:             Premium features, tier indicators
```

---

## 📐 Typography

### Font Stack
```css
/* Headings */
font-family: "Segoe UI", system-ui, -apple-system, sans-serif;

/* Body */
font-family: "Segoe UI", system-ui, -apple-system, sans-serif;

/* Monospace (code) */
font-family: "Fira Code", "Consolas", monospace;
```

### Type Scale
```
Display:           48px, 700, line-height 1.2
Heading 1 (H1):    36px, 600, line-height 1.3
Heading 2 (H2):    28px, 600, line-height 1.3
Heading 3 (H3):    24px, 600, line-height 1.3
Heading 4 (H4):    20px, 600, line-height 1.4
Heading 5 (H5):    16px, 600, line-height 1.4
Body Large:        18px, 400, line-height 1.6
Body Base:         16px, 400, line-height 1.6 ← Default
Body Small:        14px, 400, line-height 1.5
Caption:           12px, 400, line-height 1.5
Overline:          12px, 600, letter-spacing 0.5px
```

### Tailwind Classes
```
/* Use these exact classes for consistency */
h1:              text-4xl font-bold leading-tight
h2:              text-3xl font-semibold leading-snug
h3:              text-2xl font-semibold leading-snug
h4:              text-xl font-semibold leading-relaxed
p-body:          text-base font-normal leading-relaxed
p-small:         text-sm font-normal leading-relaxed
p-caption:       text-xs font-normal leading-relaxed
button-text:     text-sm font-medium
input-text:      text-base font-normal
```

---

## 🎪 Spacing System

### Base Unit: 4px
```
xs:     4px    (0.25rem)
sm:     8px    (0.5rem)
md:     12px   (0.75rem)
lg:     16px   (1rem)    ← Default
xl:     24px   (1.5rem)
2xl:    32px   (2rem)
3xl:    48px   (3rem)
4xl:    64px   (4rem)
```

### Component Spacing
```
Card padding:             16px (1rem) on mobile, 24px (1.5rem) desktop
Input padding:            12px (0.75rem) vertical, 16px (1rem) horizontal
Button padding:           12px (0.75rem) vertical, 24px (1.5rem) horizontal
Section margin-bottom:    48px (3rem)
Column gap:               16px (1rem)
Row gap:                  12px (0.75rem)
```

### Margin Collapsing Rule
```
Between major sections: Always use margin-bottom: 48px or space-y-12
Between cards in grid: Always use gap: 16px or gap-4
Between form fields: Always use gap: 12px or gap-3
```

---

## 🔲 Border Radius

### Standard Radii
```
None (square):           0px (for specific edge elements)
Small:                   4px  (form inputs, badges)
Medium:                  8px  (small cards, buttons)
Large:                   12px (dialog overlays, modals)
X-Large (XL):            16px (consultantcards)
2X-Large (2XL):          20px (primary cards, major sections)

/* Tailwind classes */
rounded-sm:     4px
rounded:        8px
rounded-lg:     12px
rounded-xl:     16px
rounded-2xl:    20px (DEFAULT FOR MAJOR ELEMENTS)
```

### Rounded Corner Usage
```
✅ Primary consultant cards:      rounded-2xl (20px)
✅ Major section containers:       rounded-2xl (20px)
✅ Stat cards:                     rounded-2xl (20px)
✅ Modals/Dialogs:                 rounded-2xl (20px)
✅ Form inputs:                    rounded-lg (12px)
✅ Buttons:                        rounded-lg (12px)
✅ Small badges/pills:             rounded-full (50%)
✅ Images in cards:                rounded-xl (16px) OR rounded-t-2xl
```

---

## 🎬 Animations & Transitions

### Transition Speeds
```
Fast:       150ms (micro-interactions)
Base:       300ms (default)
Slow:       500ms (important alerts)
```

### Common Animation Patterns

#### 1. Hover Lift (Card Hover)
```css
transition: all 300ms ease-out;
hover:translate-y-[-4px]          /* -1 in Tailwind = -0.25rem = -4px */
hover:shadow-lg
```

**Tailwind**: `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`

#### 2. Border Highlight (Form Focus)
```css
transition: border-color 300ms ease-out, box-shadow 300ms ease-out;
focus:border-blue-400
focus:ring-2
focus:ring-blue-100
```

**Tailwind**: `transition-colors duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100`

#### 3. Smooth Color Change (Button State)
```css
transition: background-color 300ms ease-out, color 300ms ease-out;
hover:bg-blue-600
```

**Tailwind**: `transition-colors duration-300 hover:bg-blue-600`

#### 4. Fade In (Page Load)
```css
animation: fadeIn 400ms ease-out;
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Tailwind**: `animate-in fade-in duration-400`

#### 5. Slide Up (Modal Entry)
```css
animation: slideUp 300ms ease-out;
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Tailwind**: `animate-in slide-in-from-bottom-2 duration-300`

### What NOT to Animate
```
❌ Do NOT animate:
   - Opacity on hover for critical elements (readability)
   - Font changes (janky)
   - Layout shifts (Cumulative Layout Shift violation)
   - Multiple properties with different timings
   - Animations faster than 150ms or slower than 600ms

✅ Safe to animate:
   - Transform (translate, scale, rotate)
   - Colors
   - Shadows
   - Border styles
   - Opacity for non-critical elements
```

---

## 🎭 Shadow System

### Shadow Depths
```
No Shadow:                      shadow-none
Subtle (inputs, hovers):        shadow-sm (0 1px 2px rgba(0,0,0,0.05))
Light (cards):                  shadow (0 1px 3px rgba(0,0,0,0.1))
Medium (hovered cards):         shadow-md (0 4px 6px rgba(0,0,0,0.1))
Strong (modals, dropdowns):     shadow-lg (0 10px 15px rgba(0,0,0,0.1))
Extra Strong (depth elements):  shadow-xl (0 20px 25px rgba(0,0,0,0.1))
```

### Usage Rules
```
Card at rest:              shadow-sm or shadow
Card on hover:             shadow-md
Card on active/pressed:    shadow-lg
Modal backdrop:            shadow-xl
Dropdown menu:             shadow-lg
Form input:                shadow-sm
Sticky header:             shadow-md (subtle, below content)
Notification alert:        shadow-lg
```

---

## 🔘 Button Styles

### Button Types

#### Primary CTA (Main Action)
```jsx
<button className="
  px-6 py-3
  bg-blue-500 text-white font-medium
  rounded-lg
  transition-colors duration-300
  hover:bg-blue-600
  active:bg-blue-700
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Book Consultation
</button>
```

**Size Options**:
```
Large:     px-6 py-3 text-base
Base:      px-4 py-2.5 text-sm
Small:     px-3 py-1.5 text-xs
```

#### Secondary Button
```jsx
<button className="
  px-6 py-3
  border-2 border-blue-500 text-blue-500 font-medium
  rounded-lg
  transition-all duration-300
  hover:bg-blue-50 hover:border-blue-600
">
  Learn More
</button>
```

#### Ghost Button (Minimal)
```jsx
<button className="
  px-4 py-2
  text-gray-700 font-medium
  rounded-lg
  transition-colors duration-300
  hover:bg-gray-100
">
  Cancel
</button>
```

#### Danger Button
```jsx
<button className="
  px-6 py-3
  bg-red-500 text-white font-medium
  rounded-lg
  transition-colors duration-300
  hover:bg-red-600
">
  Delete
</button>
```

---

## 📝 Form Components

### Input Field
```jsx
<input
  type="text"
  placeholder="Enter your name"
  className="
    w-full
    px-4 py-2.5
    border-2 border-gray-200
    rounded-lg
    font-normal text-base
    placeholder:text-gray-400
    transition-colors duration-300
    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    hover:border-gray-300
  "
/>
```

### Textarea
```jsx
<textarea
  placeholder="Tell us about yourself..."
  rows={4}
  className="
    w-full
    px-4 py-3
    border-2 border-gray-200
    rounded-lg
    font-normal text-base
    placeholder:text-gray-400
    transition-colors duration-300
    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    hover:border-gray-300
    resize-none
  "
/>
```

### Label
```jsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
  <span className="text-red-500 ml-1">*</span>
</label>
```

### Error State
```jsx
<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-sm text-red-700">Please enter a valid email</p>
</div>
```

---

## 🎴 Card Components

### Basic Card
```jsx
<div className="
  p-6
  bg-white
  border border-gray-200
  rounded-2xl
  shadow-sm
  transition-all duration-300
  hover:shadow-md hover:-translate-y-1
">
  {/* Content */}
</div>
```

### Consultant Card (with Image)
```jsx
<div className="
  bg-white
  rounded-2xl
  overflow-hidden
  border border-gray-200
  shadow-sm
  transition-all duration-300
  hover:shadow-lg hover:-translate-y-1
">
  {/* Image section */}
  <img 
    src={imageUrl}
    alt={name}
    className="w-full h-48 object-cover rounded-t-2xl"
  />
  
  {/* Content section */}
  <div className="p-6">
    {/* Consultant details */}
  </div>
</div>
```

---

## 💬 Modal & Dialog

### Modal Overlay
```jsx
{/* Backdrop */}
<div className="
  fixed inset-0
  bg-black bg-opacity-50
  transition-opacity duration-300
  flex items-center justify-center
  z-50
">
  {/* Modal Container */}
  <div className="
    bg-white
    rounded-2xl
    shadow-xl
    max-w-2xl w-full mx-4
    max-h-[90vh]
    overflow-y-auto
    animate-in fade-in slide-in-from-bottom-4 duration-300
  ">
    {/* Modal Header */}
    <div className="
      p-6 border-b border-gray-200
      flex justify-between items-center
    ">
      <h2 className="text-2xl font-semibold">Modal Title</h2>
      <button className="
        p-2 hover:bg-gray-100 rounded-lg transition-colors
      ">
        ✕
      </button>
    </div>
    
    {/* Modal Body */}
    <div className="p-6">
      {/* Content */}
    </div>
    
    {/* Modal Footer */}
    <div className="
      p-6 border-t border-gray-200
      flex gap-3 justify-end
    ">
      <button className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50">
        Cancel
      </button>
      <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 🏆 Badge & Pill Components

### Badge (Small Label)
```jsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-blue-100 text-blue-800
">
  Verified
</span>
```

### Badge Variants
```
bg-blue-100 text-blue-800      /* Default - Blue */
bg-green-100 text-green-800    /* Success */
bg-yellow-100 text-yellow-800  /* Warning */
bg-red-100 text-red-800        /* Danger */
bg-purple-100 text-purple-800  /* Premium */
bg-gray-100 text-gray-800      /* Neutral */
```

---

## 🔔 Alert & Notification

### Alert Box
```jsx
<div className="
  p-4 rounded-lg
  border border-blue-200 bg-blue-50
  flex gap-3 items-start
">
  <div className="text-blue-600 mt-0.5">ℹ️</div>
  <div>
    <h4 className="font-semibold text-blue-900">Information</h4>
    <p className="text-sm text-blue-800 mt-1">
      This is an informational alert message.
    </p>
  </div>
</div>
```

### Alert Variants
```
Informational:   border-blue-200 bg-blue-50 text-blue-900
Success:         border-green-200 bg-green-50 text-green-900
Warning:         border-yellow-200 bg-yellow-50 text-yellow-900
Error:           border-red-200 bg-red-50 text-red-900
```

---

## 📱 Responsive Breakpoints

```
Mobile:           < 640px  (Default - write mobile-first)
Small:            640px+   (sm:)
Medium:           768px+   (md:)
Large:            1024px+  (lg:)
X-Large:          1280px+  (xl:)
2X-Large:         1536px+  (2xl:)
```

### Layout Patterns

#### Single Column to Two Columns
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Items */}
</div>
```

#### One to Three Columns
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

#### Sidebar Layout
```jsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">
    {/* Sidebar */}
  </aside>
  <main className="lg:col-span-3">
    {/* Content */}
  </main>
</div>
```

---

## 🎨 Component Library Examples

### Stat Card (Used in Dashboards)
```jsx
<div className="
  p-6 rounded-2xl
  bg-gradient-to-br from-blue-50 to-blue-100
  border border-blue-200
">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
      <p className="text-3xl font-bold text-gray-900">$12,450</p>
      <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
    </div>
    <div className="text-5xl text-blue-400">💰</div>
  </div>
</div>
```

### Feature Card (Used on Homepage)
```jsx
<div className="
  p-6 rounded-2xl
  bg-white border border-gray-200
  shadow-sm
  hover:shadow-md hover:-translate-y-1
  transition-all duration-300
  text-center
">
  <div className="text-4xl mb-4">📚</div>
  <h3 className="text-lg font-semibold mb-2">Feature Title</h3>
  <p className="text-gray-600 text-sm">
    Feature description explaining the benefit to users.
  </p>
</div>
```

### Testimonial Card
```jsx
<div className="
  p-6 rounded-2xl
  bg-white border border-gray-200
  shadow-sm
">
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <span key={i} className="text-yellow-400">★</span>
    ))}
  </div>
  <p className="text-gray-700 mb-4">
    "This platform changed my career. Amazing consultants and great experience."
  </p>
  <div className="flex items-center gap-3">
    <img 
      src={avatar}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div>
      <p className="font-semibold text-sm text-gray-900">Client Name</p>
      <p className="text-xs text-gray-500">Client Title</p>
    </div>
  </div>
</div>
```

---

## ✅ Implementation Checklist

When building new components, verify:

- [ ] Using correct rounded-2xl for major elements (not rounded-lg)
- [ ] Color scheme matches brand (blue primary, gray neutrals)
- [ ] Hover states include -translate-y-1 lift + shadow change
- [ ] Transitions are 300ms with ease-out timing
- [ ] Spacing uses 12px, 16px, 24px multiples (not arbitrary)
- [ ] Typography matches scale (h1, h2, p-body, etc.)
- [ ] Mobile responsive (grid-cols-1 md:grid-cols-2+)
- [ ] Focus states visible (for accessibility)
- [ ] Error states use red with proper contrast
- [ ] Modals have backdrop and smooth entry animation
- [ ] Forms have proper label-input grouping
- [ ] Buttons have hover + active states
- [ ] No layout shifts (test Core Web Vitals)
- [ ] Images have alt text
- [ ] Accessible color contrast (WCAG AA minimum)
- [ ] Loading states shown (spinners, skeletons)

---

## 🔗 Related Files

- **README.md** - Product vision and features
- **STRATEGIC_PLAN.md** - Implementation roadmap
- **tailwind.config.ts** - Tailwind configuration
- **components/ui/** - shadcn/ui component exports

---

## 📞 Questions?

Reference this guide when:
- Building new components
- Onboarding new designers
- Code reviewing UI changes
- Creating design assets
- Training new team members

**Last Updated**: January 19, 2026
**Version**: 1.0
