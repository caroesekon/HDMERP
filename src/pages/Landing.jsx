import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiShoppingBag, HiUserGroup, HiCash, HiExternalLink,
  HiSparkles, HiChevronRight, HiShieldCheck, HiClock, HiChartBar,
  HiGlobe, HiDeviceMobile, HiCloud, HiArrowRight, HiStar, HiLockClosed,
  HiCube
} from 'react-icons/hi';
import appService from '../services/appService';
import systemService from '../services/systemService';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import { useHubAuth } from '../context/HubAuthContext';
import ChatWidget from '../components/common/ChatWidget';
import { trackAppLaunch, trackPageView } from '../services/trackingService';

export default function Landing() {
  const { user } = useHubAuth();
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('landing');
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const allActiveApps = allApps.filter(app => app.isActive);
    if (allActiveApps.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === allActiveApps.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(timer);
  }, [allApps, loading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, settingsRes] = await Promise.all([
        appService.getAvailableApps(),
        systemService.getSettings()
      ]);
      
      if (appsRes.data && Array.isArray(appsRes.data)) {
        const sortedApps = [...appsRes.data].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
          if (a.isBuiltIn && !b.isBuiltIn) return -1;
          if (!a.isBuiltIn && b.isBuiltIn) return 1;
          return 0;
        });
        setAllApps(sortedApps);
      } else {
        setAllApps([]);
      }
      
      if (settingsRes.data) {
        const settingsData = settingsRes.data.data || settingsRes.data;
        setSettings(settingsData);
        localStorage.setItem('mainSettings', JSON.stringify(settingsData));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setAllApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchApp = (app) => {
    trackAppLaunch(app._id, app.name, app.isBuiltIn);
    
    if (app.isBuiltIn) {
      navigate(app.url);
    } else {
      window.open(app.url, '_blank');
    }
    toast.success(`Launching ${app.name}...`);
  };

  const lightenColor = (color, percent) => {
    if (!color || color === '#000000') return '#f3f4f6';
    try {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.min(255, (num >> 16) + Math.round(255 * (percent / 100)));
      const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100)));
      const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * (percent / 100)));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch {
      return '#f3f4f6';
    }
  };

  const getAppFeatures = (app) => {
    if (app.features && app.features.length > 0) {
      return app.features;
    }
    if (app.description) {
      return app.description.split('·').map(s => s.trim()).filter(s => s);
    }
    return ['Click to launch'];
  };

  const splitFeaturesIntoColumns = (features, isMobile = false) => {
    if (isMobile) {
      return { col1: features.slice(0, 3), col2: features.slice(3, 6), col3: [] };
    }
    const columnSize = Math.ceil(features.length / 3);
    return {
      col1: features.slice(0, columnSize),
      col2: features.slice(columnSize, columnSize * 2),
      col3: features.slice(columnSize * 2)
    };
  };

  const defaultFeatures = [
    { icon: HiShieldCheck, title: 'Secure & Reliable', description: 'Enterprise-grade security for your business data' },
    { icon: HiClock, title: 'Real-time Updates', description: 'Instant synchronization across all systems' },
    { icon: HiChartBar, title: 'Advanced Analytics', description: 'Make data-driven decisions with powerful insights' },
    { icon: HiGlobe, title: 'Multi-platform', description: 'Access from anywhere, on any device' },
    { icon: HiDeviceMobile, title: 'Mobile Friendly', description: 'Optimized for smartphones and tablets' },
    { icon: HiCloud, title: 'Cloud Backup', description: 'Automatic backups and data recovery' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading..." size="lg" />
      </div>
    );
  }

  const general = settings?.general || {};
  const branding = settings?.branding || {};
  const features = settings?.features || {};
  
  const appName = general?.appName || 'HDM ERP';
  const heroHeadline = branding?.heroHeadline || 'Business, Office and General Management Systems';
  const tagline = branding?.tagline || 'Streamline your entire operation with integrated POS, Staff, Finance, and custom business tools.';
  
  const featuresEnabled = {
    enablePOS: features?.enablePOS !== false,
    enableStaff: features?.enableStaff !== false,
    enableFinance: features?.enableFinance !== false,
    enableExternalApps: features?.enableExternalApps !== false
  };

  const builtInApps = allApps.filter(app => app.isBuiltIn && app.isActive);
  const externalApps = allApps.filter(app => !app.isBuiltIn && app.isActive);
  const allActiveApps = allApps.filter(app => app.isActive);

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="pt-24 md:pt-28 pb-12 md:pb-16 px-4 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-8 md:gap-12">
            
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
                <HiSparkles className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                All-in-One Business Suite
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  {heroHeadline}
                </span>
                {' '}in One Place
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0">
                {tagline}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:from-primary-700 hover:to-primary-600 transition shadow-lg hover:shadow-xl flex items-center"
                >
                  Get Started Free
                  <HiArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
                <a
                  href="#systems"
                  className="bg-white text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base border border-gray-300 hover:border-primary-300 hover:shadow-md transition flex items-center"
                >
                  Explore Systems
                </a>
              </div>
              <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:space-x-6 text-xs md:text-sm text-gray-500">
                <div className="flex items-center">
                  <HiShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <HiLockClosed className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                  Secure & Private
                </div>
              </div>
            </div>
            
            {/* Right Side - Apps Section (Shows on all screen sizes) */}
            <div className="relative">
              {/* Desktop Slider */}
              <div className="hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-400 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 overflow-hidden">
                  <div className="flex justify-center space-x-2 mb-4 overflow-x-auto py-1">
                    {allActiveApps.map((app, index) => (
                      <button
                        key={app._id}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all flex-shrink-0 ${
                          currentSlide === index 
                            ? 'w-8' 
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        style={currentSlide === index ? { backgroundColor: app.color || '#3b82f6' } : {}}
                      />
                    ))}
                  </div>
                  
                  <div className="relative overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {allActiveApps.map((app) => {
                        const appColor = app.color || '#3b82f6';
                        const lightColor = lightenColor(appColor, 90);
                        const displayFeatures = getAppFeatures(app);
                        const { col1, col2, col3 } = splitFeaturesIntoColumns(displayFeatures, false);
                        
                        return (
                          <div 
                            key={app._id} 
                            className="w-full flex-shrink-0 cursor-pointer"
                            onClick={() => handleLaunchApp(app)}
                          >
                            <div className="text-center mb-4">
                              <div 
                                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-3"
                                style={{ background: `linear-gradient(135deg, ${appColor}, ${lightenColor(appColor, -20)})` }}
                              >
                                <span className="text-4xl">{app.icon || '📦'}</span>
                              </div>
                              <h3 className="text-xl font-bold" style={{ color: appColor }}>{app.name}</h3>
                              <div className="flex items-center justify-center mt-1">
                                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: app.isBuiltIn ? '#dbeafe' : '#f3e8ff', color: app.isBuiltIn ? '#1d4ed8' : '#7e22ce' }}>
                                  {app.isBuiltIn ? 'Built-in System' : 'External App'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-3 px-4">{app.description || `${app.category || 'Application'}`}</p>
                            </div>
                            <div className="rounded-xl p-5" style={{ backgroundColor: lightColor }}>
                              <h4 className="font-medium text-gray-700 mb-3 text-center">Key Features</h4>
                              <div className="grid grid-cols-3 gap-x-3 gap-y-3">
                                <div className="space-y-3">
                                  {col1.map((feature, i) => (
                                    <div key={i} className="flex items-center">
                                      <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: appColor }}></div>
                                      <span className="text-xs text-gray-600 leading-tight">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-3">
                                  {col2.map((feature, i) => (
                                    <div key={i} className="flex items-center">
                                      <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: appColor }}></div>
                                      <span className="text-xs text-gray-600 leading-tight">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-3">
                                  {col3.map((feature, i) => (
                                    <div key={i} className="flex items-center">
                                      <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: appColor }}></div>
                                      <span className="text-xs text-gray-600 leading-tight">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-5 text-center">
                                <button className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90" style={{ backgroundColor: appColor }}>
                                  {app.isBuiltIn ? 'Access System' : 'Launch App'}
                                  {app.isBuiltIn ? <HiChevronRight className="h-4 w-4 ml-1" /> : <HiExternalLink className="h-4 w-4 ml-1" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {allActiveApps.length > 1 && (
                    <>
                      <button onClick={() => setCurrentSlide(prev => prev === 0 ? allActiveApps.length - 1 : prev - 1)} className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition">
                        <HiChevronRight className="h-5 w-5 text-gray-600 rotate-180" />
                      </button>
                      <button onClick={() => setCurrentSlide(prev => prev === allActiveApps.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition">
                        <HiChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Apps Grid - Shows on mobile/tablet */}
              <div className="lg:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allActiveApps.slice(0, 4).map((app) => {
                    const appColor = app.color || '#3b82f6';
                    const lightColor = lightenColor(appColor, 90);
                    const displayFeatures = getAppFeatures(app);
                    
                    return (
                      <div
                        key={app._id}
                        onClick={() => handleLaunchApp(app)}
                        className="cursor-pointer bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
                        style={{ borderLeftColor: appColor, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${appColor}, ${lightenColor(appColor, -20)})` }}
                          >
                            <span className="text-xl">{app.icon || '📦'}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800" style={{ color: appColor }}>{app.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {app.isBuiltIn ? 'Built-in' : 'External'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{app.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {displayFeatures.slice(0, 2).map((feature, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">✓ {feature.substring(0, 20)}</span>
                          ))}
                        </div>
                        <div className="mt-3 text-right">
                          <span className="text-xs font-medium" style={{ color: appColor }}>Tap to open →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {allActiveApps.length > 4 && (
                  <div className="text-center mt-4">
                    <a href="#apps" className="text-sm text-primary-600 font-medium">View all {allActiveApps.length} apps →</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Scale Your Business
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Powerful tools designed to streamline your operations and boost productivity
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {defaultFeatures.map((feature, i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-2 md:p-3 rounded-xl w-fit mb-3 md:mb-4 group-hover:scale-110 transition">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built-in Systems Section */}
      {builtInApps.length > 0 && (
        <section id="systems" className="py-12 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Built-in Business Systems
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Powerful integrated tools designed for modern businesses
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {builtInApps.map((app) => {
                const appColor = app.color || '#3b82f6';
                const lightColor = lightenColor(appColor, 90);
                const mediumColor = lightenColor(appColor, 70);
                const displayFeatures = getAppFeatures(app);
                
                return (
                  <div
                    key={app._id}
                    onClick={() => handleLaunchApp(app)}
                    className="group relative rounded-2xl p-4 md:p-6 border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: lightColor, borderColor: mediumColor, borderLeftColor: appColor, borderLeftWidth: '4px' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition duration-500" style={{ backgroundColor: appColor }}></div>
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-md group-hover:scale-110 transition" style={{ background: `linear-gradient(135deg, ${appColor}, ${lightenColor(appColor, -20)})` }}>
                      <span className="text-xl md:text-2xl">{app.icon || '📦'}</span>
                    </div>
                    <h3 className="relative text-lg md:text-xl font-bold mb-1 md:mb-2" style={{ color: appColor }}>{app.name}</h3>
                    <p className="relative text-gray-600 text-xs md:text-sm mb-3 md:mb-4">{app.description || 'Internal System'}</p>
                    <div className="relative space-y-2 mb-4 md:mb-6">
                      {displayFeatures.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center text-xs md:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: appColor }}></div>
                          <span className="text-xs leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium text-sm group-hover:translate-x-1 transition flex items-center" style={{ color: appColor }}>
                        Access System
                        <HiChevronRight className="h-4 w-4 ml-1" />
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full flex items-center" style={{ backgroundColor: mediumColor, color: appColor }}>
                        <HiStar className="h-3 w-3 mr-1" />
                        Built-in
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* External Apps Section */}
      {featuresEnabled.enableExternalApps && externalApps.length > 0 && (
        <section id="apps" className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Connected External Apps</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">Seamlessly integrate with your favorite third-party tools</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {externalApps.map((app) => {
                const appColor = app.color || '#3b82f6';
                const lightColor = lightenColor(appColor, 90);
                const mediumColor = lightenColor(appColor, 70);
                const displayFeatures = getAppFeatures(app);
                
                return (
                  <div
                    key={app._id}
                    onClick={() => handleLaunchApp(app)}
                    className="group relative rounded-2xl p-4 md:p-6 border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: lightColor, borderColor: mediumColor, borderLeftColor: appColor, borderLeftWidth: '4px' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition duration-500" style={{ backgroundColor: appColor }}></div>
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-md group-hover:scale-110 transition" style={{ background: `linear-gradient(135deg, ${appColor}, ${lightenColor(appColor, -20)})` }}>
                      <span className="text-xl md:text-2xl">{app.icon || '🔗'}</span>
                    </div>
                    <h3 className="relative text-lg md:text-xl font-bold mb-1 md:mb-2" style={{ color: appColor }}>{app.name}</h3>
                    <p className="relative text-gray-600 text-xs md:text-sm mb-3 md:mb-4">{app.description || `${app.category || 'External'} Application`}</p>
                    <div className="relative space-y-2 mb-4 md:mb-6">
                      {displayFeatures.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center text-xs md:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: appColor }}></div>
                          <span className="text-xs leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium text-sm group-hover:translate-x-1 transition flex items-center" style={{ color: appColor }}>
                        Launch App
                        <HiExternalLink className="h-4 w-4 ml-1" />
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: mediumColor, color: appColor }}>External</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-primary-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Ready to Transform Your Business?</h2>
            <p className="text-primary-100 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto px-4">Join thousands of businesses using {appName} to streamline operations and grow faster.</p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link to="/register" className="bg-white text-primary-700 px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-primary-50 transition shadow-lg hover:shadow-xl">Start Free Trial</Link>
              <Link to="/login" className="bg-primary-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-primary-800 transition border border-primary-400">Sign In</Link>
            </div>
 
          </div>
        </section>
      )}

      <LandingFooter />
      <ChatWidget isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}