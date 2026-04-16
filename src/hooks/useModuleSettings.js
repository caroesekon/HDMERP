import { useState, useEffect, useCallback } from 'react';
import posSettingsService from '../services/posSettingsService';
import staffSettingsService from '../services/staffSettingsService';
import financeSettingsService from '../services/financeSettingsService';
import systemService from '../services/systemService';

const services = {
  pos: posSettingsService,
  staff: staffSettingsService,
  finance: financeSettingsService
};

const defaultNames = {
  pos: 'POS System',
  staff: 'Staff Manager',
  finance: 'Finance Manager'
};

export const useModuleSettings = (module, defaultName) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState(defaultName || defaultNames[module]);
  const [logo, setLogo] = useState(null);
  const [mainSystemName, setMainSystemName] = useState('ERP System');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Load main system name
      try {
        const mainRes = await systemService.getSettings();
        if (mainRes.data?.general?.appName) {
          setMainSystemName(mainRes.data.general.appName);
        }
      } catch (e) {
        console.error('Failed to load main system name');
      }

      // Load module settings
      const token = localStorage.getItem(`${module}Token`);
      if (!token) {
        setAppName(defaultName || defaultNames[module]);
        setLoading(false);
        return;
      }

      const service = services[module];
      if (!service) {
        setLoading(false);
        return;
      }

      // Try to get from cache first
      const cacheKey = `${module}Settings`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSettings(parsed);
          setAppName(parsed.general?.appName || defaultName || defaultNames[module]);
          setLogo(parsed.general?.logo || null);
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      // Fetch from API
      const response = await service.getSettings();
      
      if (response.data) {
        setSettings(response.data);
        setAppName(response.data.general?.appName || defaultName || defaultNames[module]);
        setLogo(response.data.general?.logo || null);
        // Cache the settings
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error(`Failed to load ${module} settings:`, error);
      // Keep cached values if API fails
    } finally {
      setLoading(false);
    }
  }, [module, defaultName]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (data) => {
    const service = services[module];
    if (!service) throw new Error(`No service for module: ${module}`);
    
    const response = await service.updateSettings(data);
    setSettings(response.data);
    setAppName(response.data.general?.appName || defaultName || defaultNames[module]);
    setLogo(response.data.general?.logo || null);
    
    // Update cache
    localStorage.setItem(`${module}Settings`, JSON.stringify(response.data));
    
    return response.data;
  };

  const uploadLogo = async (file) => {
    const service = services[module];
    if (!service) throw new Error(`No service for module: ${module}`);
    
    const response = await service.uploadLogo(file);
    setLogo(response.data.logoUrl);
    
    // Update settings with new logo
    setSettings(prev => ({
      ...prev,
      general: { ...prev?.general, logo: response.data.logoUrl }
    }));
    
    // Update cache
    if (settings) {
      const updated = { ...settings, general: { ...settings.general, logo: response.data.logoUrl } };
      localStorage.setItem(`${module}Settings`, JSON.stringify(updated));
    }
    
    return response.data;
  };

  const refreshSettings = () => {
    localStorage.removeItem(`${module}Settings`);
    loadSettings();
  };

  return {
    settings,
    loading,
    appName,
    logo,
    mainSystemName,
    updateSettings,
    uploadLogo,
    refreshSettings
  };
};