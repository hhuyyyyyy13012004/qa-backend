import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../../api/questions';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';

interface CreateQuestionForm {
  title: string;
  content: string;
}

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQuestionForm>();

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionForm) => questionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      showToast('Question posted!', 'success');
      setTimeout(() => navigate('/questions'), 1500);
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to post question',
        'error',
      );
    },
  });

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
        <h1 className="text-2xl font-bold text-gray-800">Ask a Question</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form
          onSubmit={handleSubmit((data) => createMutation.mutate(data))}
          className="flex flex-col gap-5"
        >
          <Input
            label="Question Title"
            placeholder="What do you want to ask?"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 10, message: 'Min 10 characters' },
            })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Details</label>
            <textarea
              placeholder="Describe your question in detail..."
              rows={6}
              className={`px-3 py-2 border rounded-lg text-sm outline-none transition-all resize-none
                ${
                  errors.content
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              {...register('content', {
                required: 'Details are required',
                minLength: { value: 10, message: 'Min 10 characters' },
              })}
            />
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
            💡 Your question will be <strong>public immediately</strong> after
            posting.
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Post Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
