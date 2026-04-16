import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiLogin, HiUserAdd, HiUserCircle, HiLogout, HiSparkles,
  HiMenu, HiX, HiChevronDown, HiSearch, HiPhone, HiExternalLink
} from 'react-icons/hi';
import { useHubAuth } from '../../context/HubAuthContext';
import systemService from '../../services/systemService';
import appService from '../../services/appService';
import toast from 'react-hot-toast';

export default function LandingHeader() {
  const { user, logout } = useHubAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allApps, setAllApps] = useState([]);
  const searchRef = useRef(null);
  
  const [appSettings, setAppSettings] = useState({
    appName: 'ERP Hub',
    logo: null
  });

  useEffect(() => {
    fetchSettings();
    fetchApps();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Close search results when clicking outside
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await systemService.getSettings();
      if (res.data) {
        setAppSettings({
          appName: res.data.general?.appName || 'ERP Hub',
          logo: res.data.general?.logo || null
        });
        localStorage.setItem('mainSettings', JSON.stringify(res.data));
      }
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const fetchApps = async () => {
    try {
      const res = await appService.getAvailableApps();
      if (res.data) {
        setAllApps(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch apps');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const filtered = allApps.filter(app => 
        app.name?.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase()) ||
        app.category?.toLowerCase().includes(query.toLowerCase()) ||
        app.features?.some(f => f.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleLaunchApp = (app) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    if (app.isBuiltIn) {
      navigate(app.url);
    } else {
      window.open(app.url, '_blank');
    }
    toast.success(`Launching ${app.name}...`);
  };

  const scrollToContact = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Systems', href: '#systems' },
    { name: 'Apps', href: '#apps' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'
    } border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              {appSettings.logo ? (
                <img src={appSettings.logo} alt={appSettings.appName} className="h-8 md:h-10 w-auto" />
              ) : (
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-2 rounded-xl shadow-md">
                  <HiSparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              )}
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {appSettings.appName}
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-6" ref={searchRef}>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                placeholder="Search systems, apps, features..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                  {searchResults.map((app) => (
                    <div
                      key={app._id}
                      onClick={() => handleLaunchApp(app)}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <span className="text-xl mr-3">{app.icon || '📦'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{app.name}</p>
                        <p className="text-xs text-gray-500 truncate">{app.description}</p>
                      </div>
                      <div className="flex items-center text-xs">
                        {app.isBuiltIn ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Built-in</span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center">
                            External
                            <HiExternalLink className="h-3 w-3 ml-1" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 z-50">
                  No apps found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-primary-600 transition font-medium"
              >
                {link.name}
              </a>
            ))}
            
            {/* Contact Link */}
            <button
              onClick={scrollToContact}
              className="text-gray-600 hover:text-primary-600 transition font-medium flex items-center"
            >
              <HiPhone className="h-4 w-4 mr-1" />
              Contact
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <HiChevronDown className={`h-4 w-4 text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HiUserCircle className="inline h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <HiLogout className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <HiLogin className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition shadow-md hover:shadow-lg flex items-center"
                >
                  <HiUserAdd className="h-4 w-4 mr-1" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-primary-600 transition font-medium"
              >
                {link.name}
              </a>
            ))}
            
            {/* Mobile Contact Link */}
            <button
              onClick={scrollToContact}
              className="block w-full text-left py-2 text-gray-600 hover:text-primary-600 transition font-medium"
            >
              <HiPhone className="inline h-4 w-4 mr-1" />
              Contact
            </button>
            
            <div className="pt-3 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-2 py-2">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <HiUserCircle className="inline h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <HiLogout className="inline h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <HiLogin className="inline h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg text-center"
                  >
                    <HiUserAdd className="inline h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}