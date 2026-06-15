import { useState, useRef } from 'react';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import toast from '@/utils/toast';

export default function Resume() {
  const { user, checkAuth } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    try {
      await api.post('/users/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await checkAuth();
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      // Assuming a patch endpoint can set resumeUrl to null
      await api.patch('/users/me', { resumeUrl: null, resumeFileName: null });
      await checkAuth();
      toast.success('Resume removed successfully');
    } catch (err) {
      toast.error('Failed to remove resume');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SEO title="Resume" description="Manage your professional resume." />
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload your latest resume to apply for jobs directly on the platform.
        </p>
      </div>

      <div className="app-card p-6 sm:p-8">
        {user?.profile?.resumeUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-[300px]" title={user?.profile?.resumeFileName || 'Active Resume'}>
                  {user?.profile?.resumeFileName || 'Active Resume'}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your resume is ready for job applications.
              </p>
              <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                <Button variant="outline" asChild>
                  <a href={user.profile.resumeUrl} target="_blank" rel="noreferrer">
                    View Resume
                  </a>
                </Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleRemove}>
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Upload your resume</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              PDF or DOCX format. Max file size 5MB. Make sure it's up to date before applying.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} isLoading={isUploading}>
              <Upload className="w-4 h-4 mr-2" /> Select File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
