import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'user']),
});

export type UserFormSchema = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormSchema>;
  onSubmit: (data: UserFormSchema) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      role: defaultValues?.role || 'user',
    },
  });

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="jane@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Select
        label="Role"
        options={roleOptions}
        error={errors.role?.message}
        {...register('role')}
      />

      <div className="flex justify-end gap-3 border-t pt-4 mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
export default UserForm;
