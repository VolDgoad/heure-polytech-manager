import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/Layout/AppShell';
import { ChatbotProvider } from './context/ChatbotContext';
import { DeclarationProvider } from './context/DeclarationContext';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import ChatbotButton from './components/chatbot/ChatbotButton';
import ChatbotPanel from './components/chatbot/ChatbotPanel';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const queryClient = new QueryClient();

  const openChatbot = () => {
    setIsChatbotOpen(true);
  };

  const closeChatbot = () => {
    setIsChatbotOpen(false);
  };

  return (
    <Router>
      <ThemeProvider defaultTheme="light" attribute="class">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <ChatbotProvider>
                <DeclarationProvider>
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                      path="*"
                      element={
                        <AppShell>
                          {/* Child routes will be rendered inside AppShell via Outlet */}
                        </AppShell>
                      }
                    />
                  </Routes>
                  <ChatbotButton onClick={openChatbot} />
                  <ChatbotPanel isOpen={isChatbotOpen} onClose={closeChatbot} />
                </DeclarationProvider>
              </ChatbotProvider>
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
