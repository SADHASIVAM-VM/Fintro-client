import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useRegisterMutation } from './authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from './authSlice';
import { Input } from '@/components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const response = await registerUser(data).unwrap();
      dispatch(setCredentials(response));
      toast.success(`Account created successfully! Welcome, ${response.user.name}`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.data?.message || 'Registration failed. Email might already exist.');
    }
  };

  return (
    <div className="space-y-5 text-center font-sans">
      {/* Title & Subtitle Matching Reference Screen 1 */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white leading-tight font-sans">
          All your finances in one place
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          Stay on top of your spending and savings effortlessly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-left">
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. John Doe"
          error={errors.name?.message}
          className="rounded-2xl border-[#E5E7EB] dark:border-slate-800"
          {...register('name')}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. john@example.com"
          error={errors.email?.message}
          className="rounded-2xl border-[#E5E7EB] dark:border-slate-800"
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          className="rounded-2xl border-[#E5E7EB] dark:border-slate-800"
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          className="rounded-2xl border-[#E5E7EB] dark:border-slate-800"
          {...register('confirmPassword')}
        />

        {/* Black Pill Action Button Matching Reference Screen 1 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] dark:bg-white dark:text-[#1C1C1E] dark:hover:bg-slate-200 text-sm font-extrabold shadow-md transition-all cursor-pointer mt-2"
        >
          {isLoading ? 'Creating Account...' : 'Create an account'}
        </button>
      </form>

      {/* Footer Text Link Matching Reference Screen 1 */}
      <div className="pt-2 text-xs text-[#6B7280] dark:text-slate-400">
        Have an account?{' '}
        <Link to="/login" className="font-bold text-[#111827] dark:text-white underline hover:opacity-80">
          Log in
        </Link>
      </div>
    </div>
  );
};
export default Register;
