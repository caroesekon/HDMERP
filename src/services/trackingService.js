import api from './api';

export const trackVisit = async (type, itemId, itemName, itemType = 'builtin') => {
  try {
    if (!itemId) return null;
    
    const response = await api.post('/analytics/track', {
      type,
      itemId,
      itemName,
      itemType,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    // Silently fail - don't disrupt user experience
    return null;
  }
};

export const trackPageView = (pageName) => {
  return trackVisit('page', pageName, pageName, 'page');
};

export const trackAppLaunch = (appId, appName, isBuiltIn = false) => {
  return trackVisit(
    isBuiltIn ? 'system' : 'app',
    appId,
    appName,
    isBuiltIn ? 'builtin' : 'external'
  );
};

export const trackSystemAccess = (systemId, systemName) => {
  return trackVisit('system', systemId, systemName, 'builtin');
};

export const trackEvent = async (eventName, eventData = {}) => {
  try {
    const response = await api.post('/analytics/event', {
      eventName,
      eventData,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const trackInteraction = (elementName, elementType, additionalData = {}) => {
  return trackEvent('user_interaction', {
    elementName,
    elementType,
    ...additionalData
  });
};

let pageEnterTime = null;

export const startPageTimer = () => {
  pageEnterTime = Date.now();
};

export const endPageTimer = (pageName) => {
  if (pageEnterTime) {
    const timeSpent = Math.floor((Date.now() - pageEnterTime) / 1000);
    trackEvent('page_duration', {
      pageName,
      durationSeconds: timeSpent
    });
    pageEnterTime = null;
  }
};

export const trackSearch = (searchTerm, resultsCount) => {
  return trackEvent('search', {
    term: searchTerm,
    resultsCount,
    timestamp: new Date().toISOString()
  });
};

export const trackError = (errorMessage, errorSource, errorDetails = {}) => {
  return trackEvent('error', {
    message: errorMessage,
    source: errorSource,
    details: errorDetails,
    url: window.location.href,
    userAgent: navigator.userAgent
  });
};

export const trackFeatureUsage = (featureName, systemName, success = true) => {
  return trackEvent('feature_usage', {
    feature: featureName,
    system: systemName,
    success,
    timestamp: new Date().toISOString()
  });
};

export default {
  trackVisit,
  trackPageView,
  trackAppLaunch,
  trackSystemAccess,
  trackEvent,
  trackInteraction,
  startPageTimer,
  endPageTimer,
  trackSearch,
  trackError,
  trackFeatureUsage
};