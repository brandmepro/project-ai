import { create } from 'zustand'
import { getSmartPreset } from './smart-presets'

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
  context?: string
  imageUrl?: string
  videoUrl?: string
}

export interface ContentFilters {
  status: ContentStatus | 'all'
  platform: Platform | 'all'
  searchQuery: string
}

export interface UIState {
  mobileDrawerOpen: boolean
  mobileMenuOpen: boolean
  contentFilters: ContentFilters
}

interface AppState {
  // UI State
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
  
  uiState: UIState
  setMobileDrawerOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setContentFilters: (filters: Partial<ContentFilters>) => void
  resetContentFilters: () => void
  
  // Create Flow State (Temporary form data)
  createFlow: CreateFlowState
  setCreateFlowStep: (step: number) => void
  updateCreateFlow: (updates: Partial<CreateFlowState>) => void
  applySmartPreset: (businessType: BusinessType) => void
  resetCreateFlow: () => void
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

const initialUIState: UIState = {
  mobileDrawerOpen: false,
  mobileMenuOpen: false,
  contentFilters: {
    status: 'all',
    platform: 'all',
    searchQuery: '',
  },
}

export const useAppStore = create<AppState>((set) => ({
  // UI State
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  uiState: initialUIState,
  setMobileDrawerOpen: (open) => set((state) => ({
    uiState: { ...state.uiState, mobileDrawerOpen: open }
  })),
  setMobileMenuOpen: (open) => set((state) => ({
    uiState: { ...state.uiState, mobileMenuOpen: open }
  })),
  setContentFilters: (filters) => set((state) => ({
    uiState: {
      ...state.uiState,
      contentFilters: { ...state.uiState.contentFilters, ...filters }
    }
  })),
  resetContentFilters: () => set((state) => ({
    uiState: { ...state.uiState, contentFilters: initialUIState.contentFilters }
  })),
  
  // Create Flow State (Temporary form data)
  createFlow: initialCreateFlow,
  setCreateFlowStep: (step) => set((state) => ({
    createFlow: { ...state.createFlow, currentStep: step }
  })),
  updateCreateFlow: (updates) => set((state) => ({
    createFlow: { ...state.createFlow, ...updates }
  })),
  applySmartPreset: (businessType) => set((state) => {
    const preset = getSmartPreset(businessType)
    return {
      createFlow: {
        ...state.createFlow,
        businessType,
        platforms: preset.platforms,
        contentGoal: preset.contentGoal,
        tone: preset.tone,
        language: preset.language,
        visualStyle: preset.visualStyle,
      }
    }
  }),
  resetCreateFlow: () => set({ createFlow: initialCreateFlow }),
}))
