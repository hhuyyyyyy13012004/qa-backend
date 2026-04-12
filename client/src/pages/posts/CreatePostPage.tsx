import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';

interface CreatePostForm {
  title: string;
  content: string;
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostForm>();

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePostForm) => postsApi.create(data),
    onSuccess: async (response) => {
      const post = response.data;

      // Upload image if selected
      if (imageFile) {
        try {
          await postsApi.uploadImage(post.id, imageFile);
        } catch {
          showToast('Post created but image upload failed', 'info');
        }
      }

      showToast('Post created as draft!', 'success');
      setTimeout(() => navigate('/my-posts'), 1500);
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to create post',
        'error',
      );
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, WEBP allowed', 'error');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form
          onSubmit={handleSubmit((data) => createMutation.mutate(data))}
          className="flex flex-col gap-5"
        >
          {/* Title */}
          <Input
            label="Title"
            placeholder="Enter post title..."
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Min 5 characters' },
            })}
          />

          {/* Content */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea
              placeholder="Write your post content..."
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

          {/* Image upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Cover Image{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <p className="text-gray-400 text-sm">Click to upload image</p>
                <p className="text-gray-300 text-xs mt-1">
                  JPG, PNG, WEBP — max 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            💡 Post will be saved as <strong>Draft</strong>. You can submit for
            review later.
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Save as Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
