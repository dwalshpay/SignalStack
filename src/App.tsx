import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Calculator } from '@/pages/Calculator';
import { Implementation } from '@/pages/Implementation';
import { Validation } from '@/pages/Validation';
import { Monitoring } from '@/pages/Monitoring';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Invite } from '@/pages/Invite';
import { ProtectedRoute } from '@/components/auth';
import { ToastProvider, ErrorBoundary } from '@/components/common';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:token" element={<Invite />} />

        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/calculator" replace />} />
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/implementation"
          element={
            <ProtectedRoute>
              <Implementation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/implementation/:tool"
          element={
            <ProtectedRoute>
              <Implementation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/validation"
          element={
            <ProtectedRoute>
              <Validation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/validation/:tool"
          element={
            <ProtectedRoute>
              <Validation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring"
          element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
