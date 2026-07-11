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
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { ShieldCheck } from 'lucide-react';

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
    <Card className="border-none bg-card shadow rounded-2xl p-2 text-left">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain rounded-xl" />
        </div>
        <CardTitle className="text-2xl font-semibold font-sans">Access Fintro.</CardTitle>
        <CardDescription className="font-sans text-xs">
          Sign in to manage your budget, expenses, and transaction logs.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="E.g. sxxxxm@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {loginError && (
            <div className="text-xs font-semibold text-[#FF5A5A] text-center p-2.5 bg-[#FF5A5A]/10 rounded-lg border border-[#FF5A5A]/20 w-full font-sans">
              {loginError}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <div className="text-center text-sm text-muted-foreground font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
export default Login;
