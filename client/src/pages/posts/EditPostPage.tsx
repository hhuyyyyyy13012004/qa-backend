import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { postsApi } from '../../api/posts';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface EditPostForm {
  title: string;
  content: string;
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getOne(id!).then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPostForm>();

  // Pre-fill form khi post load xong
  useEffect(() => {
    if (post) {
      reset({ title: post.title, content: post.content });
    }
  }, [post, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditPostForm) => postsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      showToast('Post updated!', 'success');
      setTimeout(() => navigate('/my-posts'), 1500);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
      </div>

      {/* Status notice */}
      {(post?.status === 'APPROVED' || post?.status === 'REJECTED') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-4">
          ⚠️ Editing an <strong>{post.status}</strong> post will reset it to{' '}
          <strong>PENDING</strong> for re-review.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form
          onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
          className="flex flex-col gap-5"
        >
          <Input
            label="Title"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Min 5 characters' },
            })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea
              rows={8}
              className={`px-3 py-2 border rounded-lg text-sm outline-none transition-all resize-none
                ${
                  errors.content
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              {...register('content', {
                required: 'Content is required',
                minLength: { value: 10, message: 'Min 10 characters' },
              })}
            />
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
