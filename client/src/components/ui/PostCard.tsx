import { Link } from 'react-router-dom';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
  };

  return (
    <Link to={`/posts/${post.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        {/* Image */}
        {post.imageUrl && (
          <img
            src={`http://localhost:3000${post.imageUrl}`}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-semibold text-gray-800 text-lg leading-tight line-clamp-2">
            {post.title}
          </h2>
          {post.status !== 'APPROVED' && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColors[post.status]}`}
            >
              {post.status}
            </span>
          )}
        </div>

        {/* Content preview */}
        <p className="text-gray-500 text-sm line-clamp-3 mb-4">
          {post.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <span
                className="text-blue-600 font-semibold"
                style={{ fontSize: 9 }}
              >
                {post.author?.username[0].toUpperCase()}
              </span>
            </div>
            <span>{post.author?.username}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>❤️ {post._count?.likes ?? 0}</span>
            <span>💬 {post._count?.comments ?? 0}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
