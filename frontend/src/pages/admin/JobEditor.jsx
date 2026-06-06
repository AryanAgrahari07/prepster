import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Settings } from 'lucide-react';
import { getAdminJobById, createAdminJob, updateAdminJob } from '@/api/admin';

const schema = z.object({
  title: z.string().min(3, 'Job title is required'),
  companyName: z.string().min(2, 'Company name is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['full-time', 'internship', 'contract']),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  ctcMin: z.coerce.number().min(0).optional(),
  ctcMax: z.coerce.number().min(0).optional(),
  skills: z.string().optional(),
  batchYears: z.string().optional(),
  minCGPA: z.coerce.number().min(0).max(10).optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(['active', 'draft', 'closed', 'filled']).optional(),
  externalApplyUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

export default function JobEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
      type: 'full-time', 
      workMode: 'onsite',
      status: 'active'
    } 
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchJob = async () => {
        try {
          const res = await getAdminJobById(id);
          const job = res.data.job;
          setValue('title', job.title);
          setValue('companyName', job.companyName);
          setValue('description', job.description);
          setValue('type', job.type);
          setValue('location', job.location);
          setValue('workMode', job.workMode);
          setValue('ctcMin', job.ctc?.min || 0);
          setValue('ctcMax', job.ctc?.max || 0);
          setValue('skills', job.skillsRequired ? job.skillsRequired.join(', ') : '');
          setValue('batchYears', job.eligibility?.batchYears ? job.eligibility.batchYears.join(', ') : '');
          setValue('minCGPA', job.eligibility?.minCGPA || 0);
          if (job.applicationDeadline) {
            setValue('applicationDeadline', new Date(job.applicationDeadline).toISOString().split('T')[0]);
          }
          setValue('status', job.status);
          setValue('externalApplyUrl', job.externalApplyUrl || '');
        } catch (err) {
          setServerError('Failed to load job details.');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const payload = {
        title: data.title,
        companyName: data.companyName,
        description: data.description,
        type: data.type,
        location: data.location,
        workMode: data.workMode,
        ctc: { min: data.ctcMin || 0, max: data.ctcMax || 0, currency: 'INR' },
        skillsRequired: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        eligibility: {
          batchYears: data.batchYears ? data.batchYears.split(',').map(y => parseInt(y.trim())).filter(Boolean) : [],
          minCGPA: data.minCGPA || 0,
        },
        applicationDeadline: data.applicationDeadline || undefined,
        status: data.status,
        externalApplyUrl: data.externalApplyUrl || undefined,
      };

      if (isEditMode) {
        await updateAdminJob(id, payload);
      } else {
        await createAdminJob(payload);
      }
      
      navigate('/admin/jobs');
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to save job. Please try again.');
    }
  };

  const selectClass = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Link to="/admin/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Job' : 'Post a New Job'}</h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode ? 'Update the details of the job listing.' : 'Create a new job listing as an admin.'}
        </p>
      </div>

      {serverError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-secondary/10 border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Job Details</h2>
          <Input id="title" label="Job Title *" placeholder="e.g. Software Engineer" {...register('title')} error={errors.title?.message} />
          <Input id="companyName" label="Company Name *" placeholder="e.g. TCS, Infosys" {...register('companyName')} error={errors.companyName?.message} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Job Type *</label>
              <select id="type" {...register('type')} className={selectClass}>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Work Mode *</label>
              <select id="workMode" {...register('workMode')} className={selectClass}>
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select id="status" {...register('status')} className={selectClass}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Job Description *</label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Describe the role, responsibilities, and requirements…"
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-y"
            />
            {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
          </div>
        </section>

        {/* Location & CTC */}
        <section className="bg-secondary/10 border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Location & Compensation</h2>
          <Input id="location" label="Location *" placeholder="e.g. Bangalore, Mumbai, Pan India" {...register('location')} error={errors.location?.message} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="ctcMin" label="CTC Min (LPA)" type="number" placeholder="3.5" step="0.1" {...register('ctcMin')} error={errors.ctcMin?.message} />
            <Input id="ctcMax" label="CTC Max (LPA)" type="number" placeholder="6" step="0.1" {...register('ctcMax')} error={errors.ctcMax?.message} />
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-secondary/10 border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Eligibility & Apply Link</h2>
          <Input id="skills" label="Required Skills (comma-separated)" placeholder="Python, SQL, Problem Solving" {...register('skills')} />
          <Input id="batchYears" label="Eligible Batch Years (comma-separated)" placeholder="2025, 2026" {...register('batchYears')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="minCGPA" label="Minimum CGPA" type="number" placeholder="6.0" step="0.1" {...register('minCGPA')} />
            <Input id="applicationDeadline" label="Application Deadline" type="date" {...register('applicationDeadline')} />
          </div>
          <Input id="externalApplyUrl" label="External Direct Apply Link (Optional)" placeholder="https://careers.company.com/job..." type="url" {...register('externalApplyUrl')} error={errors.externalApplyUrl?.message} />
        </section>

        <div className="flex justify-end gap-4">
          <Link to="/admin/jobs">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" className="font-bold" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Post Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
