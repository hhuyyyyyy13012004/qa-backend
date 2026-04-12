import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/posts/HomePage';
import PostDetailPage from './pages/posts/PostDetailPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import EditPostPage from './pages/posts/EditPostPage';
import MyPostsPage from './pages/posts/MyPostsPage';
import QuestionsPage from './pages/questions/QuestionsPage';
import QuestionDetailPage from './pages/questions/QuestionDetailPage';
import CreateQuestionPage from './pages/questions/CreateQuestionPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main layout */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />

        {/* Protected */}
        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/edit/:id"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions/create"
          element={
            <ProtectedRoute>
              <CreateQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
