import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import BreederDashboard from "@/pages/BreederDashboard";
import BreederProfile from "@/pages/BreederProfile";
import DogProfile from "@/pages/DogProfile";
import LitterPage from "@/pages/LitterPage";
import SearchPage from "@/pages/SearchPage";
import TrustScorePage from "@/pages/TrustScorePage";
import AddDogPage from "@/pages/AddDogPage";
import AddLitterPage from "@/pages/AddLitterPage";
import CreateLitterPage from "@/pages/CreateLitterPage";
import BrowseLittersPage from "@/pages/BrowseLittersPage";
import LitterDetailPage from "@/pages/LitterDetailPage";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'both') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/:userType" element={<SignupPage />} />
      
      <Route 
        path="/dashboard/breeder" 
        element={
          <ProtectedRoute requiredRole="breeder">
            <BreederDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dog/add" 
        element={
          <ProtectedRoute requiredRole="breeder">
            <AddDogPage />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/litter/add"
        element={
          <ProtectedRoute requiredRole="breeder">
            <AddLitterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-litter"
        element={
          <ProtectedRoute requiredRole="breeder">
            <CreateLitterPage />
          </ProtectedRoute>
        }
      />

      <Route path="/litters" element={<BrowseLittersPage />} />

      <Route path="/breeder/:breederId" element={<BreederProfile />} />
      <Route path="/dog/:dogId" element={<DogProfile />} />
      <Route path="/litter/:litterId" element={<LitterDetailPage />} />
      
      <Route path="/search" element={<SearchPage />} />
      
      <Route 
        path="/trust-score-info" 
        element={
          <ProtectedRoute>
            <TrustScorePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;
