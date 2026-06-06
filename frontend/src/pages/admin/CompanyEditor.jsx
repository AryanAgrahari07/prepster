import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCompany, createCompany, updateCompany } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function CompanyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEditing);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      logo: '',
      sector: '',
      hiringProcess: {
        overview: '',
        rounds: [{ name: '', description: '', duration: '', questionsCount: '' }]
      },
      selectionCriteria: {
        minCGPA: 6.0,
        tenthPercent: 60,
        twelfthPercent: 60,
        backlogs: 'No active backlogs',
        batchYears: '',
        branches: ''
      },
      packageInfo: {
        fresher: '',
        ninja: '',
        digital: '',
        notes: ''
      },
      isActive: true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'hiringProcess.rounds'
  });

  useEffect(() => {
    if (isEditing) {
      getCompany(id).then(res => {
        const c = res.data.company;
        // Transform arrays to comma-separated strings for inputs
        c.selectionCriteria.batchYears = c.selectionCriteria.batchYears.join(', ');
        c.selectionCriteria.branches = c.selectionCriteria.branches.join(', ');
        reset(c);
        setLoading(false);
      }).catch(err => {
        setServerError(err.message || 'Failed to load company');
        setLoading(false);
      });
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      setServerError('');
      
      // Transform comma-separated strings back to arrays
      const payload = { ...data };
      if (typeof payload.selectionCriteria.batchYears === 'string') {
        payload.selectionCriteria.batchYears = payload.selectionCriteria.batchYears.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      }
      if (typeof payload.selectionCriteria.branches === 'string') {
        payload.selectionCriteria.branches = payload.selectionCriteria.branches.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (isEditing) {
        await updateCompany(id, payload);
      } else {
        await createCompany(payload);
      }
      navigate('/admin/companies');
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to save company');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/companies">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Company Track' : 'New Company Track'}</h1>
        </div>
      </div>

      <div className="bg-secondary/20 border border-border rounded-xl p-6">
        {serverError && <div className="mb-6 p-3 bg-destructive/15 text-destructive rounded-md border border-destructive/30">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Company Name" placeholder="e.g. TCS" {...register('name', { required: 'Required' })} error={errors.name?.message} />
              <Input label="Slug (URL identifier)" placeholder="e.g. tcs" {...register('slug', { required: 'Required' })} error={errors.slug?.message} />
              <Input label="Sector" placeholder="e.g. IT Services" {...register('sector', { required: 'Required' })} />
              <Input label="Logo URL (Cloudinary)" placeholder="https://..." {...register('logo')} />
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" {...register('isActive')} className="rounded border-input bg-background" />
                  Is Active (visible to users)
                </label>
              </div>
            </div>
          </div>

          {/* Hiring Process */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Hiring Process</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">Process Overview</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                {...register('hiringProcess.overview', { required: 'Overview required' })}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm text-muted-foreground">Rounds</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', description: '', duration: '', questionsCount: '' })}>
                  <Plus className="w-4 h-4 mr-1" /> Add Round
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-background p-4 rounded-lg border border-border">
                  <div className="md:col-span-3">
                    <Input label="Round Name" placeholder="Aptitude" {...register(`hiringProcess.rounds.${index}.name`, { required: true })} />
                  </div>
                  <div className="md:col-span-4">
                    <Input label="Description" placeholder="Topics covered..." {...register(`hiringProcess.rounds.${index}.description`, { required: true })} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Duration" placeholder="60 mins" {...register(`hiringProcess.rounds.${index}.duration`)} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Qs Count" placeholder="40 Qs" {...register(`hiringProcess.rounds.${index}.questionsCount`)} />
                  </div>
                  <div className="md:col-span-1 pt-7 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Criteria */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Selection Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Min CGPA" type="number" step="0.1" {...register('selectionCriteria.minCGPA')} />
              <Input label="10th %" type="number" {...register('selectionCriteria.tenthPercent')} />
              <Input label="12th %" type="number" {...register('selectionCriteria.twelfthPercent')} />
              <Input label="Backlogs rule" placeholder="No active backlogs" {...register('selectionCriteria.backlogs')} />
              <Input label="Eligible Batches (comma sep)" placeholder="2024, 2025" {...register('selectionCriteria.batchYears')} />
              <Input label="Eligible Branches (comma sep)" placeholder="CSE, IT, ECE" {...register('selectionCriteria.branches')} />
            </div>
          </div>

          {/* Package Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Package Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fresher Package" placeholder="3.36 LPA" {...register('packageInfo.fresher')} />
              <Input label="Ninja/Advanced Package" placeholder="7 LPA" {...register('packageInfo.ninja')} />
              <Input label="Digital/Premium Package" placeholder="Digital..." {...register('packageInfo.digital')} />
              <Input label="Notes" placeholder="Additional info..." {...register('packageInfo.notes')} />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
