# Settings Page - Design & Implementation Guide

**Last updated:** February 13, 2026  
**Purpose:** Comprehensive Settings page for BusinessPro app-wide configurations

---

## 📋 Overview

The Settings page focuses on **app-wide configurations, subscriptions, and advanced features** while the Profile page handles **personal account settings**. This separation provides better UX and logical grouping.

### Design Principles
- **Mobile-first responsive** (breakpoints: base, sm, md, lg, xl)
- **Consistent with existing UI** (Purple/Violet theme, card-based layout)
- **Reuse Mantine components** (Paper, Stack, Group, Switch, Select, etc.)
- **Smooth animations** (Framer Motion with staggered delays)
- **Clear visual hierarchy** (Icons, section headers, descriptive text)

---

## 🎨 Layout Structure

### Page Header
```tsx
<Stack gap={4} mb="xl">
  <Text size="xl" fw={700}>Settings</Text>
  <Text size="sm" c="dimmed">
    Manage app preferences, billing, and integrations
  </Text>
</Stack>
```

### Section Grid (Desktop: 2 cols | Mobile: 1 col)
```tsx
<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
  {/* Settings cards here */}
</SimpleGrid>
```

---

## 📦 Settings Sections

### 1. **Subscription & Billing** 
**Priority: HIGH** | **Card Style: Highlighted with gradient**

```
┌─────────────────────────────────────────┐
│ 💳 Subscription & Billing               │
├─────────────────────────────────────────┤
│ Current Plan                             │
│ ┌─────────────────────────────────────┐ │
│ │ 🎯 Pro Plan                          │ │
│ │ ₹999/month • Next billing: Feb 28   │ │
│ │ [Manage Subscription]                │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Usage This Month                         │
│ • Posts: 45/100                          │
│ • AI Generations: 230/∞                  │
│                                          │
│ [View Billing History]                   │
│ [Update Payment Method]                  │
│ [Download Invoice]                       │
└─────────────────────────────────────────┘
```

**Features:**
- Current plan display with badge (Free/Starter/Pro)
- Usage progress bars with limits
- Quick actions: Upgrade, Manage, Cancel
- Billing history link
- Payment method management
- Invoice downloads

**Components:**
```tsx
<Paper className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950">
  <Group gap="xs" mb="lg">
    <IconCreditCard size={20} className="text-primary" />
    <Text fw={600} size="lg">Subscription & Billing</Text>
  </Group>
  {/* Content */}
</Paper>
```

---

### 2. **AI & Content Settings**
**Priority: HIGH** | **Full Width on Large Screens**

```
┌─────────────────────────────────────────┐
│ ✨ AI & Content Settings                │
├─────────────────────────────────────────┤
│ AI Model Preferences                     │
│ □ Speed      ○ Balanced   ○ Quality    │
│                                          │
│ Content Generation                       │
│ [x] Auto-enhance captions                │
│ [x] Smart hashtag suggestions            │
│ [x] Content idea notifications           │
│ [ ] Experimental features                │
│                                          │
│ Default Settings                         │
│ Visual Style: [Clean ▼]                  │
│ Caption Length: [Medium ▼]               │
│ Emoji Usage: [Moderate ▼]                │
└─────────────────────────────────────────┘
```

**Features:**
- AI model preference (Speed/Balanced/Quality)
- Auto-enhancement toggles
- Default content style preferences
- Caption length preference
- Emoji usage level
- Experimental features opt-in

---

### 3. **Auto-Scheduling & Posting**
**Priority: HIGH**

```
┌─────────────────────────────────────────┐
│ 📅 Auto-Scheduling Settings             │
├─────────────────────────────────────────┤
│ Smart Scheduling                         │
│ [x] Enable auto-scheduling               │
│ [x] Optimize for best posting times      │
│                                          │
│ Posting Schedule                         │
│ Mon-Fri: 9:00 AM, 2:00 PM, 7:00 PM     │
│ Sat-Sun: 11:00 AM, 5:00 PM             │
│ [Edit Schedule]                          │
│                                          │
│ Content Queue                            │
│ Minimum buffer: [2 days ▼]              │
│ Maximum posts per day: [3 ▼]            │
└─────────────────────────────────────────┘
```

**Features:**
- Enable/disable auto-scheduling
- Best time optimization toggle
- Custom schedule per day
- Queue management settings
- Platform-specific schedules

---

### 4. **Platform Management**
**Priority: HIGH**

```
┌─────────────────────────────────────────┐
│ 🔗 Connected Platforms                  │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐  │
│ │ 📷 Instagram     [Connected ✓]   │  │
│ │ Last sync: 2 hours ago            │  │
│ │ [Reconnect] [Settings]            │  │
│ └───────────────────────────────────┘  │
│                                          │
│ ┌───────────────────────────────────┐  │
│ │ 📘 Facebook      [Connect]        │  │
│ │ Reach more audience               │  │
│ └───────────────────────────────────┘  │
│                                          │
│ Platform Preferences                     │
│ [x] Auto-crosspost to all platforms      │
│ [x] Platform-specific optimizations      │
│ [ ] Tag business location                │
└─────────────────────────────────────────┘
```

**Features:**
- Connection status for all 4 platforms
- Last sync time
- Reconnect/Configure actions
- Auto-crosspost settings
- Platform-specific optimizations
- Location tagging preferences

---

### 5. **Analytics & Insights**
**Priority: MEDIUM**

```
┌─────────────────────────────────────────┐
│ 📊 Analytics & Insights                 │
├─────────────────────────────────────────┤
│ Report Settings                          │
│ Weekly Report: [Monday 9 AM ▼]          │
│ Include: [x] Reach  [x] Engagement       │
│          [x] Growth [x] Top Posts        │
│                                          │
│ Data Tracking                            │
│ [x] Track link clicks                    │
│ [x] Track profile visits                 │
│ [x] Track follower demographics          │
│                                          │
│ Export Options                           │
│ [Download This Month's Report]           │
│ [Export All Data (CSV)]                  │
└─────────────────────────────────────────┘
```

**Features:**
- Weekly report schedule
- Report content preferences
- Data tracking toggles
- Export capabilities
- Historical data access

---

### 6. **Workspace & Team** *(Coming Soon)*
**Priority: MEDIUM** | **Show "Coming Soon" badge**

```
┌─────────────────────────────────────────┐
│ 👥 Workspace & Team [Coming Soon]       │
├─────────────────────────────────────────┤
│ Team Members                             │
│ [+] Invite team members                  │
│                                          │
│ Roles & Permissions                      │
│ • Owner (You)                            │
│ • Admin - Full access                    │
│ • Editor - Create & edit                 │
│ • Viewer - View only                     │
│                                          │
│ Collaboration                            │
│ [ ] Enable content approval workflow     │
│ [ ] Comment on drafts                    │
└─────────────────────────────────────────┘
```

**Features:**
- Team member management
- Role-based permissions
- Approval workflows
- Commenting system

---

### 7. **Integrations** *(Future)*
**Priority: MEDIUM**

```
┌─────────────────────────────────────────┐
│ 🔌 Integrations                         │
├─────────────────────────────────────────┤
│ Third-Party Tools                        │
│ ┌───────────────────────────────────┐  │
│ │ Canva        [Connect]             │  │
│ │ Design posts directly              │  │
│ └───────────────────────────────────┘  │
│                                          │
│ ┌───────────────────────────────────┐  │
│ │ Google Analytics [Not Connected]  │  │
│ │ Track website traffic              │  │
│ └───────────────────────────────────┘  │
│                                          │
│ API Access (Pro Plan)                    │
│ [Generate API Key]                       │
│ [View Documentation]                     │
└─────────────────────────────────────────┘
```

**Features:**
- Third-party integrations (Canva, GA, etc.)
- API key management
- Webhook configuration
- Developer documentation link

---

### 8. **Data & Privacy**
**Priority: HIGH**

```
┌─────────────────────────────────────────┐
│ 🔒 Data & Privacy                       │
├─────────────────────────────────────────┤
│ Data Management                          │
│ [x] Store content drafts                 │
│ [x] Cache generated content              │
│ [x] Analytics data collection            │
│                                          │
│ Privacy Settings                         │
│ Profile visibility: [Public ▼]           │
│ Share analytics: [Team only ▼]          │
│                                          │
│ Data Export & Deletion                   │
│ [Export My Data]                         │
│ [Delete All Content]                     │
│ [Request Account Deletion]               │
│                                          │
│ Compliance                               │
│ [View Privacy Policy]                    │
│ [View Terms of Service]                  │
└─────────────────────────────────────────┘
```

**Features:**
- Data storage preferences
- Privacy controls
- GDPR compliance (data export/deletion)
- Policy links

---

### 9. **Advanced Settings**
**Priority: LOW** | **Collapsed by default**

```
┌─────────────────────────────────────────┐
│ ⚙️ Advanced Settings [Expand ▼]        │
├─────────────────────────────────────────┤
│ Developer Options                        │
│ [ ] Enable debug mode                    │
│ [ ] Show API request logs                │
│                                          │
│ Experimental Features                    │
│ [ ] Beta features access                 │
│ [ ] AI model testing                     │
│                                          │
│ Performance                              │
│ Image quality: [High ▼]                  │
│ Cache duration: [7 days ▼]               │
│                                          │
│ Danger Zone                              │
│ [Reset All Settings]                     │
│ [Clear Cache]                            │
└─────────────────────────────────────────┘
```

**Features:**
- Debug options
- Beta features
- Performance tuning
- Cache management
- Settings reset

---

### 10. **Notifications Center** *(Link to Profile)*
**Priority: LOW** | **Info Card**

```
┌─────────────────────────────────────────┐
│ 🔔 Notification Preferences             │
├─────────────────────────────────────────┤
│ Manage how you receive updates about    │
│ posts, analytics, and account activity. │
│                                          │
│ [Go to Profile → Notifications]          │
└─────────────────────────────────────────┘
```

---

## 🎯 Implementation Order

### Phase 1 (MVP - Week 1)
1. ✅ Subscription & Billing display
2. ✅ Platform Management (connect/disconnect)
3. ✅ AI & Content Settings
4. ✅ Data & Privacy basics

### Phase 2 (Week 2)
5. ✅ Auto-Scheduling Settings
6. ✅ Analytics & Insights
7. ✅ Advanced Settings

### Phase 3 (Future)
8. 🔄 Workspace & Team
9. 🔄 Integrations
10. 🔄 Calling Agent Settings (from upcoming features)

---

## 💻 Code Structure

### File Organization
```
our-app/
├── app/(dashboard)/settings/
│   └── page.tsx (Main settings page)
├── components/settings/
│   ├── subscription-card.tsx
│   ├── ai-settings-card.tsx
│   ├── platform-settings-card.tsx
│   ├── scheduling-card.tsx
│   ├── analytics-settings-card.tsx
│   ├── data-privacy-card.tsx
│   └── advanced-settings-card.tsx
└── lib/
    └── settings-utils.ts (Helper functions)
```

### Component Pattern (Reusable)

```tsx
// components/settings/settings-section-card.tsx
import { Paper, Group, Text, Stack } from '@mantine/core'
import { motion } from 'framer-motion'
import type { TablerIcon } from '@tabler/icons-react'

interface SettingsSectionCardProps {
  title: string
  description?: string
  icon: TablerIcon
  children: React.ReactNode
  highlight?: boolean
  badge?: string
}

export function SettingsSectionCard({
  title,
  description,
  icon: Icon,
  children,
  highlight,
  badge
}: SettingsSectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        className={`p-5 bg-card border border-border ${
          highlight ? 'ring-2 ring-primary/50' : ''
        }`}
        withBorder={false}
      >
        <Group gap="xs" mb="lg" justify="space-between">
          <Group gap="xs">
            <Icon size={20} className="text-primary" />
            <Text fw={600} size="lg" className="text-foreground">
              {title}
            </Text>
          </Group>
          {badge && (
            <Badge size="sm" variant="light" color="violet">
              {badge}
            </Badge>
          )}
        </Group>
        
        {description && (
          <Text size="sm" c="dimmed" mb="md">
            {description}
          </Text>
        )}
        
        <Stack gap="md">
          {children}
        </Stack>
      </Paper>
    </motion.div>
  )
}
```

### Usage Example

```tsx
<SettingsSectionCard
  title="Subscription & Billing"
  description="Manage your plan and payment details"
  icon={IconCreditCard}
  highlight
>
  {/* Card content */}
  <SubscriptionOverview />
  <UsageStats />
  <BillingActions />
</SettingsSectionCard>
```

---

## 📱 Mobile Responsiveness

### Breakpoints Strategy
```tsx
// Mobile (base): Stack everything vertically
<SimpleGrid cols={{ base: 1 }} spacing="lg">

// Tablet (md): 2 columns for compatible cards
<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">

// Desktop (lg): Full 2-column layout
<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
```

### Mobile-Specific Adjustments
- Reduce padding: `p-4 lg:p-5`
- Smaller text: `size="sm" lg:size="md"`
- Stack buttons: `<Stack gap="xs">` instead of `<Group>`
- Collapse advanced sections by default
- Bottom sheet for actions on mobile

---

## 🎨 Visual Design Elements

### Color Scheme (Consistent with App)
- **Primary:** Violet/Purple (`color="violet"`)
- **Success:** Green (`color="green"`)
- **Warning:** Orange (`color="orange"`)
- **Danger:** Red (`color="red"`)
- **Neutral:** Gray (`c="dimmed"`)

### Icons (Tabler Icons)
- 💳 Billing: `IconCreditCard`
- ✨ AI: `IconSparkles`
- 📅 Schedule: `IconCalendarEvent`
- 🔗 Platforms: `IconBrandInstagram`, etc.
- 📊 Analytics: `IconChartLine`
- 👥 Team: `IconUsers`
- 🔌 Integrations: `IconPlug`
- 🔒 Privacy: `IconLock`
- ⚙️ Advanced: `IconSettings`

### Animation Patterns
```tsx
// Staggered card appearance
transition={{ duration: 0.3, delay: index * 0.1 }}

// Hover effects
whileHover={{ scale: 1.02 }}

// Button press
whileTap={{ scale: 0.98 }}
```

---

## ✅ Best Practices

1. **Progressive Disclosure**
   - Show common settings first
   - Collapse advanced/dangerous options
   - Use "Show more" patterns

2. **Immediate Feedback**
   - Real-time toggle updates (like notifications)
   - Success/error toasts
   - Loading states for async actions

3. **Clear Labels**
   - Setting title + description
   - Help text for complex options
   - Tooltips for technical terms

4. **Confirmation Dialogs**
   - Destructive actions (delete, disconnect)
   - Plan downgrades
   - Data exports

5. **Accessibility**
   - Keyboard navigation
   - Screen reader labels
   - Focus management
   - ARIA attributes

---

## 🚀 Quick Start Template

```tsx
// app/(dashboard)/settings/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Text, Stack, SimpleGrid } from '@mantine/core'
import { 
  IconCreditCard, 
  IconSparkles, 
  IconCalendarEvent,
  // ... other icons
} from '@tabler/icons-react'
import { SettingsSectionCard } from '@/components/settings/settings-section-card'

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap={4} mb="xl">
          <Text size="xl" fw={700} className="text-foreground">
            Settings
          </Text>
          <Text size="sm" c="dimmed">
            Manage app preferences, billing, and integrations
          </Text>
        </Stack>
      </motion.div>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Subscription Card */}
        <SettingsSectionCard
          title="Subscription & Billing"
          icon={IconCreditCard}
          highlight
        >
          {/* Implementation */}
        </SettingsSectionCard>

        {/* AI Settings Card */}
        <SettingsSectionCard
          title="AI & Content Settings"
          icon={IconSparkles}
        >
          {/* Implementation */}
        </SettingsSectionCard>

        {/* More cards... */}
      </SimpleGrid>
    </div>
  )
}
```

---

## 📚 References

- **Design System:** Mantine UI v7.x
- **Animation:** Framer Motion
- **Icons:** Tabler Icons
- **Theme:** Custom Purple/Violet with light/dark modes
- **Font:** Poppins (Primary), Geist Mono (Code)

---

*This document should be updated as new settings are added or requirements change.*
