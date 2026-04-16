import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const call = useCallback(async (apiInstance, method, url, requestData = null, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        ...options,
        ...(method.toLowerCase() === 'get' 
          ? { params: requestData } 
          : { data: requestData }
        )
      };

      const response = await apiInstance[method.toLowerCase()](url, config.data || config.params, config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, call, reset };
};

// Pre-configured hooks for each system
export const useHubApi = () => {
  const api = useApi();
  return { ...api };
};

export const usePOSApi = () => {
  const api = useApi();
  return { ...api };
};

export const useStaffApi = () => {
  const api = useApi();
  return { ...api };
};

export const useFinanceApi = () => {
  const api = useApi();
  return { ...api };
};