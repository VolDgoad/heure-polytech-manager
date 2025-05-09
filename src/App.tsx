
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/Layout/AppShell';
import { ChatbotProvider } from './context/ChatbotContext';
import { DeclarationProvider } from './context/DeclarationContext';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';
import DashboardPage from './pages/DashboardPage';

function App() {
  const queryClient = new QueryClient();

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
                    <Route path="/dashboard" element={
                      <AppShell>
                        <DashboardPage />
                      </AppShell>
                    } />
                    <Route
                      path="*"
                      element={
                        <AppShell>
                          <div className="flex items-center justify-center h-full">
                            <p>Page not found</p>
                          </div>
                        </AppShell>
                      }
                    />
                  </Routes>
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
