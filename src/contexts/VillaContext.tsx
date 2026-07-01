import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/supabase'
import { defaultVillaSettings, normalizeVillaSettings, type VillaSettings } from '../lib/villa-settings'

interface VillaContextValue {
  settings: VillaSettings
  loading: boolean
  displayName: string
  refreshVillaSettings: () => Promise<void>
}

const VillaContext = createContext<VillaContextValue | undefined>(undefined)

export const VillaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VillaSettings>(defaultVillaSettings())
  const [loading, setLoading] = useState(true)

  const refreshVillaSettings = useCallback(async () => {
    try {
      const data = await api.getVillaSettings()
      setSettings(normalizeVillaSettings(data))
    } catch {
      setSettings(defaultVillaSettings())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshVillaSettings()
  }, [refreshVillaSettings])

  const displayName = settings.villa_name.trim() || 'Resort Booking System'

  return (
    <VillaContext.Provider value={{ settings, loading, displayName, refreshVillaSettings }}>
      {children}
    </VillaContext.Provider>
  )
}

export function useVilla() {
  const ctx = useContext(VillaContext)
  if (!ctx) {
    throw new Error('useVilla must be used within VillaProvider')
  }
  return ctx
}

export function useVillaOptional() {
  return useContext(VillaContext)
}
