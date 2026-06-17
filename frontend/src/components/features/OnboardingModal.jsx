import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore, { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GraduationCap, Briefcase, ChevronRight, X } from 'lucide-react';

const streamSchema = z.object({
  stream: z.enum(['engineering', 'mba']),
});

const mbaSchema = z.object({
  instituteType: z.string().optional().refine(
    (val) => !val || ['iim', 'xlri', 'fms', 'nmims', 'spjimr', 'iift', 'mdi', 'tier2', 'other'].includes(val),
    'Please select a valid institute type'
  ),
  mbaProgramme: z.string().min(1, 'Programme is required'),
  specialization: z.string().optional().refine(
    (val) => !val || ['marketing', 'finance', 'hr', 'operations', 'strategy', 'general'].includes(val),
    'Please select a valid specialization'
  ),
});

const engineeringSchema = z.object({
  college: z.string().min(1, 'College is required'),
  branch: z.string().min(1, 'Branch is required'),
  graduationYear: z.string().transform((val) => Number(val)).refine((val) => val >= 2020 && val <= 2035, 'Invalid year'),
});

export default function OnboardingModal() {
  const { user, checkAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ⚠️ Hooks MUST be called before any early return (Rules of Hooks)
  const { register: regMba, handleSubmit: handleMbaSubmit, formState: { errors: mbaErrors } } = useForm({
    resolver: zodResolver(mbaSchema),
  });

  const { register: regEng, handleSubmit: handleEngSubmit, formState: { errors: engErrors } } = useForm({
    resolver: zodResolver(engineeringSchema),
  });

  // Hide if not logged in or onboarding already done
  if (!user || user.onboardingCompleted) return null;

  const onStreamSelect = (selectedStream) => {
    setStream(selectedStream);
    setStep(2);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        stream,
        onboardingCompleted: true,
      };

      if (stream === 'mba') {
        payload.instituteType = data.instituteType;
        payload.mbaProgramme = data.mbaProgramme;
        payload.specialization = data.specialization;
      } else {
        payload.college = data.college;
        payload.branch = data.branch;
        payload.graduationYear = data.graduationYear;
      }

      await api.patch('/users/me', payload);
      await checkAuth(); // refresh user data
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Welcome to Prepster! 🚀</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Let's personalize your experience. What are you preparing for?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => onStreamSelect('engineering')}
                  className="flex flex-col items-center justify-center p-6 bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Engineering</h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">SDE, Data, Product roles</p>
                </button>

                <button
                  onClick={() => onStreamSelect('mba')}
                  className="flex flex-col items-center justify-center p-6 bg-secondary/50 hover:bg-secondary border border-border hover:border-purple-500/50 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg">MBA</h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">Consulting, Finance, Marketing</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && stream === 'engineering' && (
            <form onSubmit={handleEngSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Engineering Details</h2>
              </div>

              <Input
                label="College Name"
                placeholder="e.g. IIT Bombay"
                {...regEng('college')}
                error={engErrors.college?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Branch"
                  placeholder="e.g. CSE"
                  {...regEng('branch')}
                  error={engErrors.branch?.message}
                />
                <Input
                  label="Graduation Year"
                  placeholder="2025"
                  type="number"
                  {...regEng('graduationYear')}
                  error={engErrors.graduationYear?.message}
                />
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                Complete Profile <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 2 && stream === 'mba' && (
            <form onSubmit={handleMbaSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">MBA Details</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Institute Type</label>
                <select
                  {...regMba('instituteType')}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                >
                  <option value="">Select Institute Type</option>
                  <option value="iim">IIM (Indian Institute of Management)</option>
                  <option value="xlri">XLRI</option>
                  <option value="fms">FMS</option>
                  <option value="nmims">NMIMS</option>
                  <option value="spjimr">SPJIMR</option>
                  <option value="tier2">Tier 2 Institute</option>
                  <option value="other">Other</option>
                </select>
                {mbaErrors.instituteType && <p className="text-xs text-destructive mt-1">{mbaErrors.instituteType.message}</p>}
              </div>

              <Input
                label="Programme Name"
                placeholder="e.g. PGDM, MBA"
                {...regMba('mbaProgramme')}
                error={mbaErrors.mbaProgramme?.message}
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">Primary Specialization</label>
                <select
                  {...regMba('specialization')}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                >
                  <option value="">Select Specialization</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="operations">Operations</option>
                  <option value="strategy">Strategy / Consulting</option>
                  <option value="general">General Management</option>
                </select>
                {mbaErrors.specialization && <p className="text-xs text-destructive mt-1">{mbaErrors.specialization.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                Complete Profile <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
