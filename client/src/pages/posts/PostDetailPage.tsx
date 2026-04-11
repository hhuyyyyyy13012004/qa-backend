import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { postsApi } from '../../api/posts';
import { commentsApi } from '../../api/comments';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Button from '../../components/ui/Button';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // Fetch post
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getOne(id!).then((r) => r.data),
  });

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ['comments', 'post', id],
    queryFn: () => commentsApi.getByPost(id!).then((r) => r.data),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => postsApi.toggleLike(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['post', id] }),
    onError: () => showToast('Please login to like', 'error'),
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      commentsApi.create({
        content,
        postId: id,
        parentId: replyTo?.id,
      }),
    onSuccess: () => {
      setCommentText('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', id] });
      showToast('Comment added!', 'success');
    },
    onError: () => showToast('Failed to add comment', 'error'),
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', id] });
      showToast('Comment deleted', 'success');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post)
    return (
      <div className="text-center py-20 text-gray-500">Post not found</div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back
      </button>

      {/* Post */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {/* Image */}
        {post.imageUrl && (
          <img
            src={`http://localhost:3000${post.imageUrl}`}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span>
            by <strong>{post.author?.username}</strong>
          </span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Content */}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => likeMutation.mutate()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            ❤️ <span>{post._count?.likes ?? 0} likes</span>
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            💬 <span>{post._count?.comments ?? 0} comments</span>
          </span>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Comments ({comments?.length ?? 0})
        </h2>

        {/* Add comment */}
        {isAuthenticated ? (
          <div className="mb-6">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <span>Replying to @{replyTo.username}</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                replyTo
                  ? `Reply to @${replyTo.username}...`
                  : 'Write a comment...'
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={() => commentMutation.mutate(commentText)}
                isLoading={commentMutation.isPending}
                disabled={!commentText.trim()}
              >
                {replyTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>{' '}
            to comment
          </p>
        )}

        {/* Comments list */}
        <div className="flex flex-col gap-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2">
              {/* Top-level comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 text-xs font-semibold">
                    {comment.author.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-xl px-4 py-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {comment.author.username}
                    </span>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {isAuthenticated && (
                      <button
                        onClick={() =>
                          setReplyTo({
                            id: comment.id,
                            username: comment.author.username,
                          })
                        }
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Reply
                      </button>
                    )}
                    {user?.id === comment.authorId && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 flex flex-col gap-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-purple-600 text-xs font-semibold">
                          {reply.author.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl px-4 py-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {reply.author.username}
                          </span>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {reply.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 px-2">
                          <span className="text-xs text-gray-400">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                          {user?.id === reply.authorId && (
                            <button
                              onClick={() =>
                                deleteCommentMutation.mutate(reply.id)
                              }
                              className="text-xs text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
