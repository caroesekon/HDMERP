import { useState, useEffect } from 'react';
import systemService from '../services/systemService';

export const useAppSettings = (defaultName = 'ERP System') => {
  const [appName, setAppName] = useState(defaultName);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await systemService.getSettings();
        if (res.data?.general?.appName) {
          setAppName(res.data.general.appName);
        }
        setSettings(res.data);
      } catch (error) {
        console.log('Using default app name');
      }
    };
    fetchSettings();
  }, []);

  return { appName, settings };
};