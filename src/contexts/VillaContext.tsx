import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/supabase'
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  type VillaCheckTimes,
} from '../lib/villa-check-times'
import { defaultVillaSettings, normalizeVillaSettings, type VillaSettings } from '../lib/villa-settings'

interface VillaContextValue {
  settings: VillaSettings
  checkTimes: VillaCheckTimes
  loading: boolean
  displayName: string
  refreshVillaSettings: () => Promise<void>
}

const VillaContext = createContext<VillaContextValue | undefined>(undefined)

export const VillaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VillaSettings>(defaultVillaSettings())
  const [checkTimes, setCheckTimes] = useState<VillaCheckTimes>({
    check_in_time: DEFAULT_CHECK_IN_TIME,
    check_out_time: DEFAULT_CHECK_OUT_TIME,
  })
  const [loading, setLoading] = useState(true)

  const refreshVillaSettings = useCallback(async () => {
    try {
      const [data, times] = await Promise.all([api.getVillaSettings(), api.getVillaCheckTimes()])
      setSettings(normalizeVillaSettings(data))
      setCheckTimes(times)
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
    <VillaContext.Provider value={{ settings, checkTimes, loading, displayName, refreshVillaSettings }}>
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
