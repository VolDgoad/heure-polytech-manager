import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatbotProvider } from "./context/ChatbotContext";
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
import ApprobationPage from "./pages/ApprobationPage";
import ApprobationDetailsPage from "./pages/ApprobationDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import ProgramsPage from "./pages/admin/ProgramsPage";
import LevelsPage from "./pages/admin/LevelsPage";
import SemestersPage from "./pages/admin/SemestersPage";
import TeachingUnitsPage from "./pages/admin/TeachingUnitsPage";
import CourseElementsPage from "./pages/admin/CourseElementsPage";
import UsersPage from "./pages/admin/UsersPage";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ChatbotProvider>
            <DeclarationProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<DashboardPage />} />
                  
                  <Route 
                    path="declarations" 
                    element={
                      <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice_etudes']}>
                        <DeclarationsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="declarations/new" 
                    element={
                      <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice_etudes']}>
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
                      <ProtectedRoute allowedRoles={['enseignant', 'chef_departement', 'directrice_etudes']}>
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
                      <ProtectedRoute allowedRoles={['chef_departement']}>
                        <ValidationPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="validation/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['chef_departement']}>
                        <ValidationDetailsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="approbation" 
                    element={
                      <ProtectedRoute allowedRoles={['directrice_etudes']}>
                        <ApprobationPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="approbation/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['directrice_etudes']}>
                        <ApprobationDetailsPage />
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

                  <Route 
                    path="admin/departments" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <DepartmentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="admin/programs" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <ProgramsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="admin/levels" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <LevelsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="admin/semesters" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <SemestersPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="admin/teaching-units" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <TeachingUnitsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="admin/course-elements" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <CourseElementsPage />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="admin/users" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'directrice_etudes']}>
                        <UsersPage />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DeclarationProvider>
          </ChatbotProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
