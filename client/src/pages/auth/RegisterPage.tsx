import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const mutation = useMutation({
    mutationFn: (data: Omit<RegisterForm, 'confirmPassword'>) =>
      authApi.register(data),
    onSuccess: () => {
      showToast('Registration successful! Please login.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Registration failed',
        'error',
      );
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...rest } = data;
    mutation.mutate(rest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Q&A community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Username"
            placeholder="johndoe"
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Min 3 characters' },
              maxLength: { value: 20, message: 'Max 20 characters' },
            })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: (val) =>
                val === watch('password') || 'Passwords do not match',
            })}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={mutation.isPending}
            className="mt-2"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
