import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '@/store/authStore';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SEO from '@/components/seo/SEO';
import toast from '@/utils/toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordUpdate = async (data) => {
    setPasswordSuccess('');
    setPasswordError('');
    try {
      await api.patch('/users/me/password', data);
      setPasswordSuccess('Password updated successfully.');
      reset();
    } catch (err) {
      setPasswordError(err.response?.data?.error?.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      setDeleteError('');
      try {
        await api.delete('/users/me');
        toast.success('Account deletion requested. You will be logged out.');
        await logout();
      } catch (err) {
        setDeleteError(err.response?.data?.error?.message || 'Failed to delete account.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Settings" description="Manage your Prepster account settings" />
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-sm text-foreground capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscription</p>
              <p className="text-sm text-foreground capitalize">
                {user?.subscription?.plan || 'Free'} ({user?.subscription?.status || 'Inactive'})
              </p>
            </div>
          </div>
        </div>

        {/* Password Update (Only if not Google Auth) */}
        {!user?.googleId && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
            {passwordSuccess && <div className="mb-4 p-3 bg-green-500/15 text-green-500 border border-green-500/30 rounded-md text-sm">{passwordSuccess}</div>}
            {passwordError && <div className="mb-4 p-3 bg-destructive/15 text-destructive border border-destructive/30 rounded-md text-sm">{passwordError}</div>}
            <form onSubmit={handleSubmit(onPasswordUpdate)} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
              />
              <Input
                label="New Password"
                type="password"
                {...register('newPassword')}
                error={errors.newPassword?.message}
              />
              <Input
                label="Confirm New Password"
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              <Button type="submit" isLoading={isSubmitting}>
                Update Password
              </Button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {deleteError && (
            <div className="mb-4 text-sm text-destructive">{deleteError}</div>
          )}
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
