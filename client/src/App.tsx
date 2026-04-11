import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Placeholder — sẽ thêm dần các trang sau */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center text-gray-500">
              Home page — coming in FE-3
            </div>
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
