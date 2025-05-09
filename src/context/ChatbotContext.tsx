
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isChatbotOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
}

const ChatbotContext = createContext<ChatbotContextType>({
  isChatbotOpen: false,
  openChatbot: () => {},
  closeChatbot: () => {},
  toggleChatbot: () => {}
});

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);
  const toggleChatbot = () => setIsChatbotOpen(prev => !prev);

  return (
    <ChatbotContext.Provider value={{
      isChatbotOpen,
      openChatbot,
      closeChatbot,
      toggleChatbot
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};
