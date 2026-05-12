import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/domain/validators/password.validator';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useChangePassword } from '@/presentation/hooks/useProfile';
import { useNotification } from '@/presentation/hooks/useNotification';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';

/**
 * ProfilePage - Displays user profile info and change password form.
 *
 * - Shows user name, email, and assigned roles (Req 11.1)
 * - Change password form with old/new password fields (Req 11.2)
 * - Inline validation: old password min 6, new password 6-72 (Req 11.3, 11.4, 11.5)
 * - Success: notification + clear form (Req 11.6)
 * - Incorrect old password: inline error on old password field (Req 11.7)
 * - Unexpected errors: error notification, retain form values (Req 11.8)
 */
export function ProfilePage() {
  const { user } = useAuth();
  const changePasswordMutation = useChangePassword();
  const { addNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    setError,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      addNotification({
        type: 'success',
        message: 'Password berhasil diubah.',
      });
      reset();
    } catch (error) {
      if (isIncorrectOldPasswordError(error)) {
        setError('oldPassword', {
          type: 'server',
          message: 'Password lama tidak sesuai.',
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Terjadi kesalahan saat mengubah password. Silakan coba lagi.',
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      {/* Profile Information */}
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nama</dt>
              <dd className="mt-1 text-base text-gray-900">{user?.name ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-base text-gray-900">{user?.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
                    >
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Change Password Form */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">Ubah Password</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4"
        >
          <Input
            label="Password Lama"
            type="password"
            placeholder="Masukkan password lama"
            autoComplete="current-password"
            error={errors.oldPassword?.message}
            {...register('oldPassword')}
          />

          <Input
            label="Password Baru"
            type="password"
            placeholder="Masukkan password baru"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
        </form>
      </section>
    </div>
  );
}

/**
 * Detects if the error is an "incorrect old password" response from the API.
 * Checks for 400 status with a message or field error on old_password.
 */
function isIncorrectOldPasswordError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    if (status === 400) {
      // Check for field-specific error on old_password
      if (data?.errors?.old_password) {
        return true;
      }
      // Check for message indicating incorrect old password
      const message = (data?.message ?? '').toLowerCase();
      if (
        message.includes('old password') ||
        message.includes('password lama') ||
        message.includes('incorrect')
      ) {
        return true;
      }
    }
  }
  return false;
}
