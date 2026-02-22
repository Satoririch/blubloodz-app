import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import BreederDashboard from "@/pages/BreederDashboard";
import BreederProfile from "@/pages/BreederProfile";
import DogProfile from "@/pages/DogProfile";
import LitterPage from "@/pages/LitterPage";
import SearchPage from "@/pages/SearchPage";
import TrustScorePage from "@/pages/TrustScorePage";

const ProtectedRoute = ({ children, requiredUserType }) => {
  const userType = localStorage.getItem('mockUser');
  
  if (!userType) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/:userType" element={<SignupPage />} />
          
          <Route 
            path="/dashboard/breeder" 
            element={
              <ProtectedRoute requiredUserType="breeder">
                <BreederDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/breeder/:breederId" 
            element={
              <ProtectedRoute>
                <BreederProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dog/:dogId" 
            element={
              <ProtectedRoute>
                <DogProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/litter/:litterId" 
            element={
              <ProtectedRoute>
                <LitterPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/search" 
            element={
              <ProtectedRoute requiredUserType="buyer">
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trust-score-info" 
            element={
              <ProtectedRoute>
                <TrustScorePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
