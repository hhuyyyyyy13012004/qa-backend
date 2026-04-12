import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import type { Post } from '../../types';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const statusLabels = {
  DRAFT: '📝 Draft',
  PENDING: '⏳ Pending Review',
  APPROVED: '✅ Approved',
  REJECTED: '❌ Rejected',
};

export default function MyPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () => postsApi.getMyPosts().then((r) => r.data),
  });

  // Submit for review
  const submitMutation = useMutation({
    mutationFn: (id: string) => postsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      showToast('Post submitted for review!', 'success');
    },
    onError: () => showToast('Failed to submit', 'error'),
  });

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      showToast('Post deleted', 'success');
    },
    onError: () => showToast('Failed to delete', 'error'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {posts?.length ?? 0} posts total
          </p>
        </div>
        <Link
          to="/posts/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Post
        </Link>
      </div>

      {posts?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts yet</p>
          <Link
            to="/posts/create"
            className="text-blue-600 hover:underline text-sm mt-2 block"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts?.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[post.status]}`}
                    >
                      {statusLabels[post.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {post.content}
                  </p>

                  {/* Rejection reason */}
                  {post.status === 'REJECTED' && post.reviewNote && (
                    <div className="mt-2 bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600">
                      <strong>Reason:</strong> {post.reviewNote}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {/* Submit button — only for DRAFT */}
                  {post.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      onClick={() => submitMutation.mutate(post.id)}
                      isLoading={submitMutation.isPending}
                      className="text-xs px-3 py-1.5"
                    >
                      Submit
                    </Button>
                  )}

                  {/* Edit button */}
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/posts/edit/${post.id}`)}
                    className="text-xs px-3 py-1.5"
                  >
                    Edit
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('Delete this post?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    className="text-xs px-3 py-1.5"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
