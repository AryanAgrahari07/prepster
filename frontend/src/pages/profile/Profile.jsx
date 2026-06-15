import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore, { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, CheckCircle2, AlertCircle, FileText, Upload } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  college: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z
    .string()
    .transform((val) => (val === '' ? undefined : Number(val)))
    .refine((val) => !val || (val >= 2020 && val <= 2035), {
      message: 'Graduation year must be between 2020 and 2035',
    })
    .optional(),
  cgpa: z
    .string()
    .transform((val) => (val === '' ? undefined : Number(val)))
    .refine((val) => !val || (val >= 0 && val <= 10), {
      message: 'CGPA must be between 0 and 10',
    })
    .optional(),
  phone: z.string().optional(),
  targetCompanies: z.string().optional(),
  stream: z.enum(['engineering', 'mba']).optional(),
});

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Convert numbers back to strings for the form inputs
  const defaultValues = {
    ...user?.profile,
    graduationYear: user?.profile?.graduationYear ? String(user.profile.graduationYear) : '',
    cgpa: user?.profile?.cgpa ? String(user.profile.cgpa) : '',
    targetCompanies: user?.profile?.targetCompanies?.join(', ') || '',
    stream: user?.stream || 'engineering',
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError('');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUser({ ...user, profile: res.data.data.user.profile });
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      setError('');
      const formData = new FormData();
      formData.append('resume', file);
      
      const res = await api.post('/users/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUser({ ...user, profile: res.data.data.user.profile });
      setSuccess('Resume uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      // Clean up empty strings to undefined
      const payload = { ...data };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = undefined;
      });

      if (payload.targetCompanies !== undefined) {
        payload.targetCompanies = payload.targetCompanies.split(',').map(s => s.trim()).filter(Boolean);
      }

      const res = await api.patch('/users/me', payload);
      setUser({ ...user, profile: res.data.data.user.profile });
      
      const resetPayload = { ...payload };
      if (resetPayload.targetCompanies) resetPayload.targetCompanies = resetPayload.targetCompanies.join(', ');
      
      reset(resetPayload); // Reset form to new values to clear isDirty
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  // Basic progress calculation
  const fields = [
    user?.profile?.firstName,
    user?.profile?.lastName,
    user?.profile?.college,
    user?.profile?.branch,
    user?.profile?.graduationYear,
    user?.profile?.cgpa,
    user?.profile?.phone,
    user?.profile?.avatar,
    user?.profile?.targetCompanies?.length > 0,
    user?.isEmailVerified,
  ];
  const filled = fields.filter(Boolean).length;
  const progress = Math.round((filled / fields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your account details and preferences.</p>
      </div>

      <div className="bg-secondary/20 border border-border rounded-xl p-6">
        <h3 className="font-medium mb-4">Profile Completion</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-secondary rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        {progress < 100 && (
          <p className="text-sm text-muted-foreground mt-3">
            Complete your profile to get better job recommendations and access to full features.
          </p>
        )}
      </div>

      <div className="bg-secondary/20 border border-border rounded-xl p-6">
        {error && <div className="mb-6 p-3 bg-destructive/15 text-destructive border border-destructive/30 rounded-md">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-500/15 text-green-500 border border-green-500/30 rounded-md">{success}</div>}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
          <div className="flex items-center gap-4 sm:gap-6 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">Profile Photo</h3>
              <p className="text-sm text-muted-foreground mt-1">Recommended size: 400x400px. Max size: 5MB.</p>
            </div>
          </div>
          
          {/* Resume Upload Section */}
          <div className="flex items-center gap-4 flex-1 w-full md:border-l md:border-border md:pl-6">
            <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0 relative group cursor-pointer overflow-hidden">
              <FileText className="w-7 h-7 text-muted-foreground" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <input 
                type="file" 
                accept="application/pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg">Resume</h3>
              {user?.profile?.resumeUrl ? (
                <a href={user.profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block truncate w-full max-w-[200px]" title={user.profile.resumeFileName || 'View Current Resume'}>
                  {user.profile.resumeFileName || 'View Current Resume'}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">PDF format only. Max 5MB.</p>
              )}
              {uploadingResume && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
            <Input label="College/University" {...register('college')} error={errors.college?.message} />
            <Input label="Branch/Major" placeholder="e.g. Computer Science" {...register('branch')} error={errors.branch?.message} />
            <Input label="Graduation Year" type="number" {...register('graduationYear')} error={errors.graduationYear?.message} />
            <Input label="CGPA (out of 10)" type="number" step="0.01" {...register('cgpa')} error={errors.cgpa?.message} />
            <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Career Stream</label>
              <select 
                {...register('stream')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="engineering">Engineering / Tech</option>
                <option value="mba">MBA / Management</option>
              </select>
              {errors.stream && <p className="text-sm font-medium text-destructive mt-1.5">{errors.stream.message}</p>}
            </div>
            <div className="relative">
              <Input label="Email Address" value={user?.email || ''} disabled />
              {user?.isEmailVerified ? (
                <div className="absolute right-3 top-[34px] flex items-center text-green-500 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Verified
                </div>
              ) : (
                <div className="absolute right-3 top-[34px] flex items-center text-orange-400 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Unverified
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Input label="Target Companies (comma separated)" placeholder="e.g. TCS, Infosys, Amazon" {...register('targetCompanies')} error={errors.targetCompanies?.message} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
