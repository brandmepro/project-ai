import { create } from 'zustand'

export type BusinessType = 'cafe' | 'kirana' | 'salon' | 'gym' | 'clinic' | 'restaurant' | 'boutique' | 'tea-shop'
export type Platform = 'instagram' | 'facebook' | 'whatsapp' | 'google-business'
export type ContentGoal = 'promotion' | 'awareness' | 'engagement' | 'festival' | 'offer'
export type Tone = 'friendly' | 'professional' | 'fun' | 'minimal'
export type Language = 'english' | 'hinglish' | 'hindi'
export type VisualStyle = 'clean' | 'festive' | 'modern' | 'bold'
export type ContentStatus = 'draft' | 'scheduled' | 'posted'

export interface ContentItem {
  id: string
  imageUrl: string
  caption: string
  hashtags: string[]
  platform: Platform
  status: ContentStatus
  scheduledDate?: string
  scheduledTime?: string
  createdAt: string
  businessType: BusinessType
  goal: ContentGoal
  tone: Tone
  language: Language
  visualStyle: VisualStyle
}

export interface CreateFlowState {
  currentStep: number
  businessType: BusinessType | null
  platforms: Platform[]
  contentGoal: ContentGoal | null
  tone: Tone | null
  language: Language | null
  visualStyle: VisualStyle | null
  scheduledDate: Date | null
  scheduledTime: string | null
  generatedCaption: string
  generatedHashtags: string[]
}

interface AppState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
  
  createFlow: CreateFlowState
  setCreateFlowStep: (step: number) => void
  updateCreateFlow: (updates: Partial<CreateFlowState>) => void
  resetCreateFlow: () => void
  
  contents: ContentItem[]
  addContent: (content: ContentItem) => void
  updateContent: (id: string, updates: Partial<ContentItem>) => void
  deleteContent: (id: string) => void
  
  businessName: string
  setBusinessName: (name: string) => void
}

const initialCreateFlow: CreateFlowState = {
  currentStep: 0,
  businessType: null,
  platforms: [],
  contentGoal: null,
  tone: null,
  language: null,
  visualStyle: null,
  scheduledDate: null,
  scheduledTime: null,
  generatedCaption: '',
  generatedHashtags: [],
}

// Mock content data
const mockContents: ContentItem[] = [
  {
    id: '1',
    imageUrl: '/placeholder-content-1.jpg',
    caption: 'Start your morning right with our freshly brewed coffee! Perfect blend, perfect taste.',
    hashtags: ['coffee', 'morningvibes', 'cafe', 'freshbrew'],
    platform: 'instagram',
    status: 'scheduled',
    scheduledDate: '2026-01-29',
    scheduledTime: '09:00',
    createdAt: '2026-01-28',
    businessType: 'cafe',
    goal: 'engagement',
    tone: 'friendly',
    language: 'english',
    visualStyle: 'modern',
  },
  {
    id: '2',
    imageUrl: '/placeholder-content-2.jpg',
    caption: 'Republic Day Special! Get 26% off on all items today. Limited time offer!',
    hashtags: ['republicday', 'offer', 'sale', 'discount'],
    platform: 'facebook',
    status: 'posted',
    createdAt: '2026-01-26',
    businessType: 'kirana',
    goal: 'offer',
    tone: 'professional',
    language: 'hinglish',
    visualStyle: 'festive',
  },
  {
    id: '3',
    imageUrl: '/placeholder-content-3.jpg',
    caption: 'New hair color trends for 2026! Book your appointment today.',
    hashtags: ['haircolor', 'salon', 'trending', 'newlook'],
    platform: 'instagram',
    status: 'draft',
    createdAt: '2026-01-27',
    businessType: 'salon',
    goal: 'awareness',
    tone: 'fun',
    language: 'english',
    visualStyle: 'bold',
  },
  {
    id: '4',
    imageUrl: '/placeholder-content-4.jpg',
    caption: 'Join our new batch of yoga classes starting next week. Transform your health!',
    hashtags: ['yoga', 'fitness', 'health', 'newbatch'],
    platform: 'whatsapp',
    status: 'scheduled',
    scheduledDate: '2026-01-30',
    scheduledTime: '18:00',
    createdAt: '2026-01-28',
    businessType: 'gym',
    goal: 'promotion',
    tone: 'professional',
    language: 'english',
    visualStyle: 'clean',
  },
]

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  createFlow: initialCreateFlow,
  setCreateFlowStep: (step) => set((state) => ({
    createFlow: { ...state.createFlow, currentStep: step }
  })),
  updateCreateFlow: (updates) => set((state) => ({
    createFlow: { ...state.createFlow, ...updates }
  })),
  resetCreateFlow: () => set({ createFlow: initialCreateFlow }),
  
  contents: mockContents,
  addContent: (content) => set((state) => ({
    contents: [content, ...state.contents]
  })),
  updateContent: (id, updates) => set((state) => ({
    contents: state.contents.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),
  deleteContent: (id) => set((state) => ({
    contents: state.contents.filter((c) => c.id !== id)
  })),
  
  businessName: 'Sunrise Cafe',
  setBusinessName: (name) => set({ businessName: name }),
}))
