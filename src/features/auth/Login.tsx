import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoginMutation } from './authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from './authSlice';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setLoginError(null);
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials(response));
      toast.success(`Welcome back, ${response.user.name}!`);

      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.data?.message || 'Login failed. Please check your credentials.';
      setLoginError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5 text-center font-sans">
      {/* Title & Subtitle Matching Reference Screen 1 */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
          Track All Your Money in One Place
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
          Track your balance, cards, transactions, and more from a single screen
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. user@example.com"
          error={errors.email?.message}
          className="rounded-2xl border-zinc-200 dark:border-zinc-800"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          className="rounded-2xl border-zinc-200 dark:border-zinc-800"
          {...register('password')}
        />

        {loginError && (
          <div className="text-xs font-semibold text-rose-500 text-center p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 w-full">
            {loginError}
          </div>
        )}

        {/* Matte Black Pill Action Button Matching Reference Screen 1 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-4 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-extrabold shadow-lg transition-all cursor-pointer mt-2"
        >
          {isLoading ? 'verifying...' : 'Login'}
        </button>
      </form>

      {/* Footer Text Link Matching Reference Screen 1 */}
      <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-zinc-900 dark:text-white underline hover:opacity-80">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
