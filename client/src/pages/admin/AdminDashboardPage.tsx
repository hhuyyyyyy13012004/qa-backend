import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [rejectModal, setRejectModal] = useState<{
    postId: string;
    title: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch all posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => postsApi.getAllAdmin().then((r) => r.data),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => postsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      showToast('Post approved!', 'success');
    },
    onError: () => showToast('Failed to approve', 'error'),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      postsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setRejectModal(null);
      setRejectReason('');
      showToast('Post rejected', 'success');
    },
    onError: () => showToast('Failed to reject', 'error'),
  });

  // Filter posts
  const filteredPosts = posts?.filter((post) =>
    filter === 'ALL' ? true : post.status === filter,
  );

  // Count by status
  const counts = {
    ALL: posts?.length ?? 0,
    PENDING: posts?.filter((p) => p.status === 'PENDING').length ?? 0,
    APPROVED: posts?.filter((p) => p.status === 'APPROVED').length ?? 0,
    REJECTED: posts?.filter((p) => p.status === 'REJECTED').length ?? 0,
    DRAFT: posts?.filter((p) => p.status === 'DRAFT').length ?? 0,
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and moderate posts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Pending',
            count: counts.PENDING,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          },
          {
            label: 'Approved',
            count: counts.APPROVED,
            color: 'bg-green-50 border-green-200 text-green-700',
          },
          {
            label: 'Rejected',
            count: counts.REJECTED,
            color: 'bg-red-50 border-red-200 text-red-600',
          },
          {
            label: 'Total',
            count: counts.ALL,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(
          ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DRAFT'] as FilterStatus[]
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {status} {status !== 'ALL' && `(${counts[status]})`}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {filteredPosts?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No {filter === 'ALL' ? '' : filter.toLowerCase()} posts
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts?.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[post.status]}`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      by <strong>{(post as any).author?.username}</strong>
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800">{post.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {post.content}
                  </p>

                  {/* Rejection reason */}
                  {post.status === 'REJECTED' && post.reviewNote && (
                    <div className="mt-2 bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600">
                      <strong>Rejection reason:</strong> {post.reviewNote}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions — chỉ hiện với PENDING */}
                {post.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => approveMutation.mutate(post.id)}
                      isLoading={approveMutation.isPending}
                      className="text-xs px-3 py-1.5"
                    >
                      ✅ Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        setRejectModal({ postId: post.id, title: post.title })
                      }
                      className="text-xs px-3 py-1.5"
                    >
                      ❌ Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Reject Post
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting: <strong>"{rejectModal.title}"</strong>
            </p>

            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Reason{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this post is being rejected..."
                rows={3}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectModal.postId,
                    reason: rejectReason,
                  })
                }
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
