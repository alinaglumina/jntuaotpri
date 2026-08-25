import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import { Card, Button, FormField, Input, Banner, useToast } from '../components/ui/index.js';

export default function ChangePassword() {
  const { user } = useAuth();
  const forced = !!user?.must_change_pwd;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: (v) => api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: async () => {
      reset();
      toast.success('Password changed.');
      await qc.invalidateQueries({ queryKey: ['session'] });  // clears must_change_pwd
      if (forced) navigate('/admin', { replace: true });
    },
  });

  return (
    <div className="max-w-md">
      {forced && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <Banner title="Update your password" subtitle="For security, you must set a new password before continuing." className="!py-6" />
        </div>
      )}
      <h1 className="text-2xl"><i className="fa-solid fa-key mr-2 text-crimson" /> Change Password</h1>
      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField label="Current password" required error={errors.currentPassword && 'Required'}>
            <Input type="password" {...register('currentPassword', { required: true })} />
          </FormField>
          <FormField label="New password" required hint="At least 8 characters" error={errors.newPassword && 'At least 8 characters'}>
            <Input type="password" {...register('newPassword', { required: true, minLength: 8 })} />
          </FormField>
          <FormField label="Confirm new password" error={errors.confirm?.message}>
            <Input type="password" {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} />
          </FormField>
          {mutation.isError && <p className="text-sm text-crimson">{mutation.error.message}</p>}
          <Button type="submit" loading={mutation.isPending}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
