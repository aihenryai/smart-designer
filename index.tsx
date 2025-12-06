import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import App from './src/App';
import SignIn from './src/pages/SignIn';
import Pricing from './src/pages/Pricing';
import PaymentSuccess from './src/pages/PaymentSuccess';
import PaymentCancel from './src/pages/PaymentCancel';
import ProtectedRoute from './src/components/ProtectedRoute';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/pricing" 
            element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/success" 
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/cancel" 
            element={
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
