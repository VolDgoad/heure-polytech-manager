
import { useAuth } from '@/context/AuthContext';
import { useChatbot } from '@/context/ChatbotContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import ChatbotButton from '../chatbot/ChatbotButton';
import ChatbotPanel from '../chatbot/ChatbotPanel';

const AppShell = ({ children }) => {
  const { user } = useAuth();
  const { isChatbotOpen, openChatbot, closeChatbot } = useChatbot();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            {children || <Outlet />}
          </div>
        </main>
        
        {/* Chatbot */}
        <ChatbotButton onClick={openChatbot} />
        <ChatbotPanel isOpen={isChatbotOpen} onClose={closeChatbot} />
      </div>
    </div>
  );
};

export default AppShell;
