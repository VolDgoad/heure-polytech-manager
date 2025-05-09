import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/Layout/AppShell';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Declarations from './pages/Declarations';
import DeclarationDetails from './pages/DeclarationDetails';
import NewDeclaration from './pages/NewDeclaration';
import EditDeclaration from './pages/EditDeclaration';
import { ChatbotProvider } from './context/ChatbotContext';
import { DeclarationProvider } from './context/DeclarationContext';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import ChatbotButton from './components/chatbot/ChatbotButton';
import ChatbotPanel from './components/chatbot/ChatbotPanel';

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
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/declarations" element={<Declarations />} />
                      <Route path="/declarations/:id" element={<DeclarationDetails />} />
                      <Route path="/declarations/new" element={<NewDeclaration />} />
                      <Route path="/declarations/edit/:id" element={<EditDeclaration />} />
                    </Routes>
                  </AppShell>
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
