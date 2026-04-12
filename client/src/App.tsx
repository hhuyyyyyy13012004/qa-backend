import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/posts/HomePage';
import PostDetailPage from './pages/posts/PostDetailPage';
import QuestionsPage from './pages/questions/QuestionsPage';
import QuestionDetailPage from './pages/questions/QuestionDetailPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />

        {/* Protected routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <div className="text-center py-20 text-gray-400">
                Create post — coming in FE-6
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions/create"
          element={
            <ProtectedRoute>
              <div className="text-center py-20 text-gray-400">
                Create question — coming in FE-6
              </div>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
