/**
 * Common Enums - Shared across all modules
 */

export enum BusinessType {
  CAFE = 'cafe',
  KIRANA = 'kirana',
  SALON = 'salon',
  GYM = 'gym',
  CLINIC = 'clinic',
  RESTAURANT = 'restaurant',
  BOUTIQUE = 'boutique',
  TEA_SHOP = 'tea-shop',
}

export enum Platform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WHATSAPP = 'whatsapp',
  GOOGLE_BUSINESS = 'google-business',
}

export enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export enum ContentGoal {
  PROMOTION = 'promotion',
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
  FESTIVAL = 'festival',
  OFFER = 'offer',
}

export enum Tone {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  FUN = 'fun',
  MINIMAL = 'minimal',
}

export enum Language {
  ENGLISH = 'english',
  HINDI = 'hindi',
  HINGLISH = 'hinglish',
}

export enum VisualStyle {
  CLEAN = 'clean',
  FESTIVE = 'festive',
  MODERN = 'modern',
  BOLD = 'bold',
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PublishStatus {
  QUEUED = 'queued',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
}
