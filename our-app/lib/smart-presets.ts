import type { BusinessType, Platform, ContentGoal, Tone, Language, VisualStyle } from './store'

export interface SmartPreset {
  platforms: Platform[]
  contentGoal: ContentGoal
  tone: Tone
  language: Language
  visualStyle: VisualStyle
  reason?: string
}

/**
 * Smart presets based on business type
 * These are AI-powered recommendations that auto-fill settings
 */
export const BUSINESS_PRESETS: Record<BusinessType, SmartPreset> = {
  cafe: {
    platforms: ['instagram', 'facebook'],
    contentGoal: 'engagement',
    tone: 'friendly',
    language: 'hinglish',
    visualStyle: 'festive',
    reason: 'Cafes thrive on visual content and friendly engagement'
  },
  restaurant: {
    platforms: ['instagram', 'google-business'],
    contentGoal: 'promotion',
    tone: 'friendly',
    language: 'hinglish',
    visualStyle: 'festive',
    reason: 'Restaurants benefit from food visuals and local discovery'
  },
  'tea-shop': {
    platforms: ['instagram', 'whatsapp'],
    contentGoal: 'engagement',
    tone: 'friendly',
    language: 'hinglish',
    visualStyle: 'festive',
    reason: 'Tea shops connect with local community through engaging content'
  },
  kirana: {
    platforms: ['whatsapp', 'google-business'],
    contentGoal: 'offer',
    tone: 'friendly',
    language: 'hindi',
    visualStyle: 'bold',
    reason: 'Kirana stores reach local customers with offers and announcements'
  },
  salon: {
    platforms: ['instagram', 'facebook'],
    contentGoal: 'promotion',
    tone: 'professional',
    language: 'english',
    visualStyle: 'modern',
    reason: 'Salons showcase transformations and professional expertise'
  },
  gym: {
    platforms: ['instagram', 'facebook'],
    contentGoal: 'awareness',
    tone: 'professional',
    language: 'english',
    visualStyle: 'bold',
    reason: 'Fitness centers inspire with bold, motivational content'
  },
  clinic: {
    platforms: ['google-business', 'facebook'],
    contentGoal: 'awareness',
    tone: 'professional',
    language: 'hinglish',
    visualStyle: 'clean',
    reason: 'Healthcare providers build trust through professional, clean content'
  },
  boutique: {
    platforms: ['instagram', 'facebook'],
    contentGoal: 'promotion',
    tone: 'fun',
    language: 'english',
    visualStyle: 'modern',
    reason: 'Fashion boutiques showcase style with trendy, modern aesthetics'
  },
}

/**
 * Get smart preset for a business type
 */
export function getSmartPreset(businessType: BusinessType): SmartPreset {
  return BUSINESS_PRESETS[businessType]
}

/**
 * Check if current settings match the smart preset
 */
export function isUsingSmartPreset(
  businessType: BusinessType,
  currentSettings: {
    platforms: Platform[]
    contentGoal: ContentGoal | null
    tone: Tone | null
    language: Language | null
    visualStyle: VisualStyle | null
  }
): boolean {
  const preset = BUSINESS_PRESETS[businessType]
  
  return (
    JSON.stringify(currentSettings.platforms.sort()) === JSON.stringify(preset.platforms.sort()) &&
    currentSettings.contentGoal === preset.contentGoal &&
    currentSettings.tone === preset.tone &&
    currentSettings.language === preset.language &&
    currentSettings.visualStyle === preset.visualStyle
  )
}

/**
 * Quick action templates
 */
export interface QuickTemplate {
  id: string
  name: string
  description: string
  icon: string
  preset: Partial<{
    contentGoal: ContentGoal
    tone: Tone
    visualStyle: VisualStyle
  }>
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'festival',
    name: 'Festival Post',
    description: 'Celebrate festivals with engaging content',
    icon: '🎉',
    preset: {
      contentGoal: 'festival',
      tone: 'fun',
      visualStyle: 'festive',
    }
  },
  {
    id: 'sale',
    name: 'Sale Announcement',
    description: 'Promote offers and discounts',
    icon: '🏷️',
    preset: {
      contentGoal: 'offer',
      tone: 'friendly',
      visualStyle: 'bold',
    }
  },
  {
    id: 'daily',
    name: 'Daily Update',
    description: 'Regular engagement post',
    icon: '📱',
    preset: {
      contentGoal: 'engagement',
      tone: 'friendly',
      visualStyle: 'clean',
    }
  },
  {
    id: 'promotion',
    name: 'Product Showcase',
    description: 'Highlight your products/services',
    icon: '✨',
    preset: {
      contentGoal: 'promotion',
      tone: 'professional',
      visualStyle: 'modern',
    }
  },
]
