
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DeclarationProvider } from "./context/DeclarationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/Layout/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DeclarationsPage from "./pages/DeclarationsPage";
import NewDeclarationPage from "./pages/NewDeclarationPage";
import EditDeclarationPage from "./pages/EditDeclarationPage";
import ViewDeclarationPage from "./pages/ViewDeclarationPage";
import VerificationPage from "./pages/VerificationPage";
import VerificationDetailsPage from "./pages/VerificationDetailsPage";
import ValidationPage from "./pages/ValidationPage";
import ValidationDetailsPage from "./pages/ValidationDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DeclarationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                <Route 
                  path="declarations" 
                  element={
                    <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice']}>
                      <DeclarationsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="declarations/new" 
                  element={
                    <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice']}>
                      <NewDeclarationPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="declarations/:id" 
                  element={
                    <ProtectedRoute>
                      <ViewDeclarationPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="declarations/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice']}>
                      <EditDeclarationPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="verification" 
                  element={
                    <ProtectedRoute allowedRoles={['scolarite']}>
                      <VerificationPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="verification/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['scolarite']}>
                      <VerificationDetailsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="validation" 
                  element={
                    <ProtectedRoute allowedRoles={['chef_departement', 'directrice']}>
                      <ValidationPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="validation/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['chef_departement', 'directrice']}>
                      <ValidationDetailsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DeclarationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
