import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import api from '../services/api';

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [storedChats, setStoredChats] = useLocalStorage('userChatSessions', []);

  const initializeChat = useCallback(() => {
    if (!sessionId) {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      
      const newSession = {
        id: newSessionId,
        status: 'active',
        createdAt: new Date().toISOString(),
        messages: []
      };
      setStoredChats([...storedChats, newSession]);
      return newSessionId;
    }
    return sessionId;
  }, [sessionId, storedChats, setStoredChats]);

  const saveMessage = useCallback((message) => {
    const updatedSessions = storedChats.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, message], lastUpdated: new Date().toISOString() }
        : session
    );
    setStoredChats(updatedSessions);
  }, [sessionId, storedChats, setStoredChats]);

  const getChatHistory = useCallback(() => {
    const session = storedChats.find(s => s.id === sessionId);
    return session?.messages || [];
  }, [sessionId, storedChats]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, sessionId, initializeChat]);

  return {
    isOpen,
    toggleChat,
    sessionId,
    initializeChat,
    saveMessage,
    getChatHistory,
    chatSessions: storedChats
  };
};