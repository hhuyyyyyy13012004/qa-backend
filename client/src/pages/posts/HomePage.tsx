import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import PostCard from '../../components/ui/PostCard';

export default function HomePage() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postsApi.getAll().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load posts. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Latest Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {posts?.length ?? 0} posts available
          </p>
        </div>
        <Link
          to="/posts/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Posts grid */}
      {posts?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to write something!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
