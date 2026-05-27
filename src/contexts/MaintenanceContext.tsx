import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/supabase';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  toggleMaintenanceMode: () => Promise<void>;
  setMaintenanceMode: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
  refreshMaintenanceMode: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

interface MaintenanceProviderProps {
  children: React.ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  // ROOT FIX: Start with loading=true and assume maintenance mode might be on
  // This prevents any content from rendering until we know for sure
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load maintenance mode from database on component mount
  // This is called immediately and synchronously blocks rendering
  const loadMaintenanceMode = useCallback(async () => {
    try {
      // Don't set loading to false until we have the result
      const mode = await api.getMaintenanceMode();
      setIsMaintenanceMode(mode);
      setIsLoading(false);
    } catch (error: any) {
      // Only log non-network errors
      if (!error?.message?.includes('Failed to fetch') && !error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error('Error loading maintenance mode:', error);
      }
      // Fallback to false if there's an error
      setIsMaintenanceMode(false);
      setIsLoading(false);
    }
  }, []);

  // ROOT FIX: Load immediately and synchronously - don't wait for useEffect
  // This ensures maintenance mode is checked before any child components render
  useEffect(() => {
    // Load immediately on mount - this is the first thing that happens
    loadMaintenanceMode();

    // Poll the database every 30 seconds to keep maintenance mode in sync across devices
    const interval = setInterval(() => {
      loadMaintenanceMode();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadMaintenanceMode]);

  const toggleMaintenanceMode = useCallback(async () => {
    const newMode = !isMaintenanceMode;
    try {
      await api.setMaintenanceMode(newMode);
      setIsMaintenanceMode(newMode);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw error;
    }
  }, [isMaintenanceMode]);

  const setMaintenanceMode = useCallback(async (enabled: boolean) => {
    try {
      await api.setMaintenanceMode(enabled);
      setIsMaintenanceMode(enabled);
    } catch (error) {
      console.error('Error setting maintenance mode:', error);
      throw error;
    }
  }, []);

  const refreshMaintenanceMode = useCallback(async () => {
    await loadMaintenanceMode();
  }, [loadMaintenanceMode]);

  const value = {
    isMaintenanceMode,
    toggleMaintenanceMode,
    setMaintenanceMode,
    isLoading,
    refreshMaintenanceMode,
  };

  // ROOT FIX: Add/remove CSS class to html to prevent any content flash
  useEffect(() => {
    if (isLoading) {
      // Hide all content while loading maintenance mode
      document.documentElement.classList.remove('maintenance-loaded');
    } else {
      // Show content after maintenance mode is loaded
      document.documentElement.classList.add('maintenance-loaded');
    }
  }, [isLoading]);

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
