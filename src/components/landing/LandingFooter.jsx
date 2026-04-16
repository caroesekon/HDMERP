import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiSparkles, HiMail, HiPhone, HiLocationMarker, HiGlobe
} from 'react-icons/hi';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import systemService from '../../services/systemService';
import LegalModal from '../common/LegalModal';

export default function LandingFooter() {
  const [settings, setSettings] = useState({
    general: { appName: 'ERP Hub', logo: null, website: 'www.erphub.com' },
    branding: { 
      footerDescription: 'All-in-one business management platform for modern companies. Streamline your operations with integrated POS, Staff, and Finance tools.' 
    },
    contact: { email: '', phone: '', address: '' },
    footer: { 
      copyright: '© {year} ERP Hub. All rights reserved.',
      links: [
        {
          title: 'Systems',
          icon: '🛒',
          description: 'Access our integrated business tools',
          items: [
            { label: 'POS System', url: '/pos/login', icon: '💳' },
            { label: 'Staff Manager', url: '/staff/login', icon: '👥' },
            { label: 'Finance Manager', url: '/finance/login', icon: '💰' }
          ]
        },
        {
          title: 'Resources',
          icon: '📚',
          description: 'Helpful guides and documentation',
          items: [
            { label: 'Documentation', url: '#', icon: '📖' },
            { label: 'API Reference', url: '#', icon: '🔧' },
            { label: 'Support Center', url: '#', icon: '🎧' }
          ]
        },
        {
          title: 'Company',
          icon: '🏢',
          description: 'Learn more about us',
          items: [
            { label: 'About Us', url: '#', icon: 'ℹ️' },
            { label: 'Contact', url: '#', icon: '📞' },
            { label: 'Careers', url: '#', icon: '💼' }
          ]
        },
        {
          title: 'Legal',
          icon: '⚖️',
          description: 'Policies and terms',
          items: [
            { label: 'Privacy Policy', url: '#', icon: '🔒' },
            { label: 'Terms of Service', url: '#', icon: '📜' },
            { label: 'Cookie Policy', url: '#', icon: '🍪' }
          ]
        }
      ]
    },
    social: { facebook: '', twitter: '', linkedin: '', instagram: '', whatsapp: '' },
    legal: { privacyPolicy: '', termsOfService: '', cookiePolicy: '' }
  });

  const [legalModal, setLegalModal] = useState({ open: false, title: '', content: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await systemService.getSettings();
      if (res.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data,
          general: { ...prev.general, ...res.data.general },
          branding: { ...prev.branding, ...res.data.branding },
          contact: { ...prev.contact, ...res.data.contact },
          footer: { 
            ...prev.footer, 
            ...res.data.footer,
            links: res.data.footer?.links?.length ? res.data.footer.links : prev.footer.links 
          },
          social: { ...prev.social, ...res.data.social },
          legal: { ...prev.legal, ...res.data.legal }
        }));
      }
    } catch (error) {
      console.log('Using default footer settings');
    }
  };

  const openLegalModal = (title, content) => {
    setLegalModal({ open: true, title, content });
  };

  const currentYear = new Date().getFullYear();
  const copyrightText = settings.footer?.copyright?.replace('{year}', currentYear) || 
    `© ${currentYear} ${settings.general?.appName || 'ERP Hub'}. All rights reserved.`;
  const websiteUrl = settings.general?.website || 'www.erphub.com';
  const appName = settings.general?.appName || 'ERP Hub';
  const logo = settings.general?.logo || null;
  const footerDescription = settings.branding?.footerDescription || 
    'All-in-one business management platform for modern companies. Streamline your operations with integrated POS, Staff, and Finance tools.';

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebookF, url: settings.social?.facebook, color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: FaTwitter, url: settings.social?.twitter, color: 'hover:text-sky-500' },
    { name: 'LinkedIn', icon: FaLinkedinIn, url: settings.social?.linkedin, color: 'hover:text-blue-700' },
    { name: 'Instagram', icon: FaInstagram, url: settings.social?.instagram, color: 'hover:text-pink-600' },
    { name: 'WhatsApp', icon: FaWhatsapp, url: settings.social?.whatsapp, color: 'hover:text-green-600' }
  ].filter(s => s.url);

  const contactInfo = [
    { icon: HiMail, value: settings.contact?.email, href: settings.contact?.email ? `mailto:${settings.contact.email}` : null },
    { icon: HiPhone, value: settings.contact?.phone, href: settings.contact?.phone ? `tel:${settings.contact.phone}` : null },
    { icon: HiLocationMarker, value: settings.contact?.address, href: null },
    { icon: HiGlobe, value: websiteUrl, href: `https://${websiteUrl}` }
  ].filter(c => c.value);

  const handleFooterLinkClick = (item) => {
    if (item.label === 'Privacy Policy') {
      openLegalModal('Privacy Policy', settings.legal?.privacyPolicy);
    } else if (item.label === 'Terms of Service') {
      openLegalModal('Terms & Conditions', settings.legal?.termsOfService);
    } else if (item.label === 'Cookie Policy') {
      openLegalModal('Cookie Policy', settings.legal?.cookiePolicy);
    } else if (item.url) {
      if (item.url.startsWith('/')) {
        // Internal link - handled by Link component
      } else if (item.url.startsWith('#')) {
        const element = document.getElementById(item.url.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(item.url, '_blank');
      }
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                {logo ? (
                  <img src={logo} alt={appName} className="h-8 w-auto flex-shrink-0" />
                ) : (
                  <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-2 rounded-lg flex-shrink-0">
                    <HiSparkles className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="text-lg font-bold truncate">{appName}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed break-words max-w-full">
                {footerDescription}
              </p>
              
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex space-x-3 mt-5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-200 ${social.color}`}
                      title={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Links Sections */}
            {settings.footer?.links?.map((section, idx) => (
              <div key={idx} className="min-w-0">
                <h5 className="font-semibold text-white text-base mb-2 truncate">
                  {section.icon && <span className="mr-2">{section.icon}</span>}
                  {section.title}
                </h5>
                {section.description && (
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed break-words">{section.description}</p>
                )}
                <ul className="space-y-2">
                  {section.items?.map((item, i) => (
                    <li key={i}>
                      {section.title === 'Legal' ? (
                        <button
                          onClick={() => handleFooterLinkClick(item)}
                          className="text-gray-400 hover:text-white text-sm transition duration-200 truncate block max-w-full text-left"
                        >
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.label}
                        </button>
                      ) : item.url?.startsWith('/') ? (
                        <Link 
                          to={item.url} 
                          className="text-gray-400 hover:text-white text-sm transition duration-200 truncate block max-w-full"
                        >
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.label}
                        </Link>
                      ) : item.url?.startsWith('#') ? (
                        <button
                          onClick={() => handleFooterLinkClick(item)}
                          className="text-gray-400 hover:text-white text-sm transition duration-200 truncate block max-w-full text-left"
                        >
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.label}
                        </button>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white text-sm transition duration-200 truncate block max-w-full"
                        >
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Bar */}
          {contactInfo.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-x-8">
                {contactInfo.map((item, idx) => (
                  <div key={idx} className="flex items-center text-gray-400 text-sm">
                    <item.icon className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                    {item.href ? (
                      <a 
                        href={item.href} 
                        className="hover:text-white transition duration-200 truncate max-w-[200px] sm:max-w-none"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="truncate max-w-[200px] sm:max-w-none">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-3">
              <p className="text-center md:text-left">{copyrightText}</p>
              <div className="flex space-x-6">
                <button 
                  onClick={() => openLegalModal('Privacy Policy', settings.legal?.privacyPolicy)} 
                  className="hover:text-white transition duration-200"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => openLegalModal('Terms & Conditions', settings.legal?.termsOfService)} 
                  className="hover:text-white transition duration-200"
                >
                  Terms
                </button>
                <button 
                  onClick={() => openLegalModal('Cookie Policy', settings.legal?.cookiePolicy)} 
                  className="hover:text-white transition duration-200"
                >
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModal.open}
        onClose={() => setLegalModal({ open: false, title: '', content: '' })}
        title={legalModal.title}
        content={legalModal.content}
      />
    </>
  );
}