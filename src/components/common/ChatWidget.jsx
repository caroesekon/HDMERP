import { useState, useRef, useEffect, useCallback } from 'react';
import { HiChatAlt2, HiX, HiSupport, HiMinus, HiPaperAirplane } from 'react-icons/hi';
import { chatApi } from '../../services/chatApi';
import { useHubAuth } from '../../hooks/useHubAuth';
import toast from 'react-hot-toast';
import appService from '../../services/appService';

const ChatWidget = ({ isOpen, onToggle }) => {
  const { user } = useHubAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hasAdminReplied, setHasAdminReplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allApps, setAllApps] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch all apps from backend
  const fetchApps = useCallback(async () => {
    try {
      const res = await appService.getAvailableApps();
      if (res.data && Array.isArray(res.data)) {
        setAllApps(res.data);
      }
    } catch (error) {
      console.error('Error fetching apps for chat:', error);
    }
  }, []);

  // Load chat history
  const loadChatHistory = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const response = await chatApi.getHistory(sid);
      if (response.success && response.messages) {
        setMessages(response.messages);
        const adminReplied = response.messages.some(m => m.sender === 'admin');
        if (adminReplied) {
          setHasAdminReplied(true);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      const savedSessionId = localStorage.getItem('chatSessionId');
      await fetchApps();
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
        await loadChatHistory(savedSessionId);
      } else if (isOpen && messages.length === 0) {
        const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        setSessionId(newSessionId);
        localStorage.setItem('chatSessionId', newSessionId);
        
        try {
          await chatApi.createSession(newSessionId);
        } catch (error) {
          console.error('Error creating session:', error);
        }
        
        // Build systems list from fetched apps
        const builtInSystems = allApps.filter(app => app.isBuiltIn && app.isActive);
        const externalAppsList = allApps.filter(app => !app.isBuiltIn && app.isActive);
        
        let systemsText = '';
        if (builtInSystems.length > 0) {
          systemsText = '**Available Systems:**\n';
          builtInSystems.forEach((sys, idx) => {
            systemsText += `${idx + 1}. ${sys.name} - ${sys.description || 'Business management'}\n`;
          });
        }
        
        let externalText = '';
        if (externalAppsList.length > 0) {
          externalText = '\n**Connected Apps:**\n';
          externalAppsList.forEach((app, idx) => {
            externalText += `${idx + 1}. ${app.name} - ${app.description || 'Integration tool'}\n`;
          });
        }
        
        const welcomeMessage = {
          id: Date.now(),
          text: `👋 Hello! I am **HDM**, your online assistant.\n\n${systemsText}${externalText}\n\nHow can I assist you today? You can ask about pricing, features, support, or request a demo.`,
          sender: 'bot',
          timestamp: new Date(),
          options: [
            { id: 'free_trial', text: '🎁 Want to test system for free?' },
            { id: 'pricing', text: '💰 Pricing & Packages (Ksh)' },
            { id: 'systems', text: '📱 Available Systems & Apps' },
            { id: 'billing', text: '💳 Billing & Account' },
            { id: 'feature', text: '✨ Feature Request' },
            { id: 'contact', text: '📞 Contact Support' },
            { id: 'other', text: '📝 Other' }
          ]
        };
        setMessages([welcomeMessage]);
        await chatApi.saveMessage(newSessionId, welcomeMessage);
      }
    };
    
    initChat();
  }, [isOpen, messages.length, loadChatHistory, fetchApps, allApps]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Poll for admin responses
  const pollForUpdates = useCallback(async () => {
    if (!sessionId || !isOpen) return;
    
    try {
      const response = await chatApi.getHistory(sessionId);
      if (response.success && response.messages) {
        const currentMessageIds = new Set(messages.map(m => m.id));
        const newMessages = response.messages.filter(m => !currentMessageIds.has(m.id));
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          const hasNewAdminReply = newMessages.some(m => m.sender === 'admin');
          if (hasNewAdminReply) {
            setHasAdminReplied(true);
            toast.success('New response from HDM Support Team!');
          }
        }
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  }, [sessionId, isOpen, messages]);

  // Start polling when chat is open
  useEffect(() => {
    if (sessionId && isOpen) {
      pollForUpdates();
      pollingRef.current = setInterval(pollForUpdates, 5000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [sessionId, isOpen, pollForUpdates]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendToBackend = async (message) => {
    if (!sessionId) return;
    try {
      await chatApi.saveMessage(sessionId, message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const notifyAdminWithFullHistory = async () => {
    if (!sessionId) return;
    try {
      await chatApi.notifyAdmin(sessionId, messages, {
        userAgent: navigator.userAgent,
        url: window.location.href,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        userId: user?.id || null,
        userEmail: user?.email || null,
        userName: user?.name || null
      });
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  };

  const getAutoResponse = (optionId) => {
    if (hasAdminReplied) {
      return {
        message: "Thank you for your message. Our support team is already assisting you. They will respond shortly.",
        needsAdmin: true,
        options: null
      };
    }

    const responses = {
      free_trial: {
        message: "🎁 **Free Trial Information**\n\nGreat news! You can test our systems for free. Here's how:\n\n✅ **14-day free trial** - No credit card required\n✅ **Full access** to all systems (POS, Staff, Finance)\n✅ **Email & Chat support** included\n\nTo start your free trial, please provide your email address.",
        options: [
          { id: 'provide_email_trial', text: '📧 Provide my email for trial' },
          { id: 'start_trial_now', text: '🚀 Start trial now' }
        ],
        needsAdmin: false
      },
      pricing: {
        message: "💰 **Pricing & Packages (Kenyan Shillings - Ksh)**\n\n**Individual Systems:**\n• POS System: Ksh 2,500/month\n• Staff Management: Ksh 2,000/month\n• Finance System: Ksh 3,000/month\n\n**Bundled Packages:**\n• Basic Bundle (POS + Staff): Ksh 4,000/month\n• Professional Bundle (All systems): Ksh 6,000/month\n\nWould you like more details or to speak with sales?",
        options: [
          { id: 'send_pricing', text: '📧 Send me detailed pricing' },
          { id: 'talk_to_sales', text: '💬 Talk to sales' }
        ],
        needsAdmin: true
      },
      systems: {
        message: "📱 **Available Systems & Apps**\n\n1. **POS System** - Complete sales & inventory management\n2. **Staff Management** - Employee records, attendance, payroll\n3. **Finance System** - Accounting, expenses, invoicing\n\nWhich system would you like to learn more about?",
        options: [
          { id: 'pos_details', text: '🛒 Learn about POS' },
          { id: 'staff_details', text: '👥 Learn about Staff Management' },
          { id: 'finance_details', text: '💰 Learn about Finance' },
          { id: 'all_systems', text: '📦 Tell me about all systems' }
        ],
        needsAdmin: false
      },
      pos_details: {
        message: "🛒 **POS System** - Ksh 2,500/month\n\nFeatures: Sales, Inventory, Customers, Reports, M-Pesa integration\n\nWould you like a demo?",
        options: [
          { id: 'demo_request', text: '🎥 Request Demo' },
          { id: 'start_trial_now', text: '🚀 Start Free Trial' }
        ],
        needsAdmin: true
      },
      staff_details: {
        message: "👥 **Staff Management** - Ksh 2,000/month\n\nFeatures: Employee profiles, Attendance, Leave, Payroll, Performance\n\nWould you like a demo?",
        options: [
          { id: 'demo_request', text: '🎥 Request Demo' },
          { id: 'start_trial_now', text: '🚀 Start Free Trial' }
        ],
        needsAdmin: true
      },
      finance_details: {
        message: "💰 **Finance System** - Ksh 3,000/month\n\nFeatures: Income/Expense tracking, Invoices, Reports, Budgeting\n\nWould you like a demo?",
        options: [
          { id: 'demo_request', text: '🎥 Request Demo' },
          { id: 'start_trial_now', text: '🚀 Start Free Trial' }
        ],
        needsAdmin: true
      },
      all_systems: {
        message: "📦 **Complete Business Suite**\n\nOur ERP includes:\n• **POS System** - Sales & inventory\n• **Staff Management** - HR & payroll\n• **Finance System** - Accounting & reports\n\n**Bundle Price:** Ksh 6,000/month (Save Ksh 1,500)\n\nWould you like to schedule a demo or start a free trial?",
        options: [
          { id: 'demo_request', text: '🎥 Request Demo' },
          { id: 'start_trial_now', text: '🚀 Start Free Trial' }
        ],
        needsAdmin: true
      },
      billing: {
        message: "💳 **Billing & Account**\n\nPayment Methods: M-Pesa, Bank Transfer, Card\n\nWhat billing issue can I help with?",
        options: [
          { id: 'invoice_request', text: '📄 Request invoice' },
          { id: 'update_payment', text: '💳 Update payment method' },
          { id: 'mpesa_payment', text: '📱 M-Pesa payment guide' }
        ],
        needsAdmin: true
      },
      feature: {
        message: "✨ **Feature Request**\n\nPlease describe the feature you'd like to see. Our team reviews all requests.\n\nYou can also email: davismcintyre5@gmail.com",
        options: [
          { id: 'submit_feature', text: '💡 Submit feature idea' }
        ],
        needsAdmin: true
      },
      contact: {
        message: "📞 **Contact Support**\n\n📧 Email: davismcintyre5@gmail.com\n📱 Phone: 0768784909\n\nHow can we help you?",
        options: [
          { id: 'email_support', text: '📧 Send email' },
          { id: 'call_support', text: '📱 Request call' }
        ],
        needsAdmin: false
      },
      demo_request: {
        message: "🎥 **Demo Request**\n\nPlease provide your name, email, and phone number. Our team will contact you to schedule a demo.",
        needsAdmin: true
      },
      start_trial_now: {
        message: "🚀 **Start Free Trial**\n\nClick here to register: /register\n\nGet 14 days free access to all systems!",
        options: [
          { id: 'goto_register', text: '🚀 Go to Registration' }
        ],
        needsAdmin: false
      },
      goto_register: {
        message: "Click to register: /register",
        options: null,
        needsAdmin: false,
        isLink: true
      },
      provide_email_trial: {
        message: "Please enter your email address:",
        needsAdmin: true
      },
      send_pricing: {
        message: "Please provide your email to receive pricing:",
        needsAdmin: true
      },
      talk_to_sales: {
        message: "Please provide your name, email, and phone number. Sales will contact you.",
        needsAdmin: true
      },
      invoice_request: {
        message: "Please provide your account email:",
        needsAdmin: true
      },
      update_payment: {
        message: "Please provide your account email:",
        needsAdmin: true
      },
      mpesa_payment: {
        message: "📱 **M-Pesa Payment**\n\nPaybill: 123456\nAccount: Your email or phone\n\nSend confirmation after payment.",
        needsAdmin: true
      },
      submit_feature: {
        message: "Please describe your feature idea in detail:",
        needsAdmin: true
      },
      email_support: {
        message: "📧 Email: davismcintyre5@gmail.com\n\nOur team will respond within 2-4 hours.",
        needsAdmin: false
      },
      call_support: {
        message: "📱 Call/WhatsApp: 0768784909\n\nPlease provide your number for callback:",
        needsAdmin: true
      },
      other: {
        message: "Please describe your inquiry and our team will assist you:",
        needsAdmin: true
      }
    };
    
    return responses[optionId] || {
      message: "Thank you for your message. Our support team will respond shortly.\n\nContact: davismcintyre5@gmail.com | 0768784909",
      needsAdmin: true
    };
  };

  const handleOptionClick = async (optionId, optionText) => {
    if (optionId === 'goto_register') {
      window.location.href = '/register';
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: optionText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await sendToBackend(userMessage);
    setIsTyping(true);
    
    const response = getAutoResponse(optionId);
    
    setTimeout(async () => {
      const botMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        options: response.options || null
      };
      
      setMessages(prev => [...prev, botMessage]);
      await sendToBackend(botMessage);
      
      if (response.needsAdmin) {
        setTimeout(async () => {
          const updatedMessages = [...messages, userMessage, botMessage];
          await chatApi.notifyAdmin(sessionId, updatedMessages, {
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: user?.id || null,
            userEmail: user?.email || null,
            userName: user?.name || null
          });
        }, 500);
      }
      
      setIsTyping(false);
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await sendToBackend(userMessage);
    setInputMessage('');
    setIsTyping(true);

    if (hasAdminReplied) {
      setTimeout(async () => {
        setIsTyping(false);
        await chatApi.notifyAdmin(sessionId, [...messages, userMessage], {
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName: user?.name || null
        });
      }, 500);
    } else {
      setTimeout(async () => {
        const botMessage = {
          id: Date.now() + 1,
          text: "Thank you for your message. Our HDM support team has been notified and will respond shortly.\n\n📧 davismcintyre5@gmail.com\n📱 0768784909",
          sender: 'bot',
          timestamp: new Date(),
          options: null
        };
        
        setMessages(prev => [...prev, botMessage]);
        await sendToBackend(botMessage);
        
        const allMessages = [...messages, userMessage, botMessage];
        await chatApi.notifyAdmin(sessionId, allMessages, {
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName: user?.name || null
        });
        
        setIsTyping(false);
      }, 800);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-primary-600 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        {isOpen ? (
          <HiX className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <>
            <HiChatAlt2 className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full animate-pulse"></span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-full">
                <HiSupport className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">HDM Support</h3>
                <p className="text-xs text-primary-100">
                  {hasAdminReplied ? 'Admin online' : 'Online Assistant'}
                </p>
              </div>
            </div>
            <button onClick={onToggle} className="text-white/80 hover:text-white transition">
              <HiMinus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="h-80 sm:h-96 overflow-y-auto p-3 sm:p-4 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="mb-3 sm:mb-4">
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 whitespace-pre-wrap ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white'
                        : message.sender === 'admin'
                        ? 'bg-green-100 border border-green-200 text-green-800'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}>
                      <p className="text-xs sm:text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' 
                          ? 'text-primary-100' 
                          : message.sender === 'admin'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                        {message.sender === 'admin' && ' • HDM Support'}
                        {message.sender === 'bot' && !hasAdminReplied && ' • HDM Assistant'}
                      </p>
                    </div>
                  </div>
                  
                  {message.options && message.options.length > 0 && !hasAdminReplied && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 ml-1 sm:ml-2">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(option.id, option.text)}
                          className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition border border-gray-200"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="mb-3 sm:mb-4 flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows="1"
                className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-2 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiPaperAirplane className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {hasAdminReplied 
                ? 'Connected with support • Admin will respond' 
                : 'Auto-response enabled • Type your message'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;