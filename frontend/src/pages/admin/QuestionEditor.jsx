import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createQuestion, updateQuestion } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export default function QuestionEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingQuestion = location.state?.question;
  const isEditing = !!editingQuestion;

  const [serverError, setServerError] = useState('');

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingQuestion || {
      text: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correctOption: 'A',
      explanation: '',
      topic: 'quantitative',
      subTopic: '',
      difficulty: 'medium',
      companies: '',
      tags: '',
    }
  });

  const { fields } = useFieldArray({ control, name: 'options' });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      // Clean up comma-separated arrays
      const payload = {
        ...data,
        companies: typeof data.companies === 'string' ? data.companies.split(',').map(s => s.trim()).filter(Boolean) : data.companies,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : data.tags,
      };

      if (isEditing) {
        await updateQuestion(editingQuestion._id, payload);
      } else {
        await createQuestion(payload);
      }
      navigate('/admin/questions');
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to save question');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/questions">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Question' : 'New Question'}</h1>
        </div>
      </div>

      <div className="bg-secondary/20 border border-border rounded-xl p-6">
        {serverError && <div className="mb-6 p-3 bg-destructive/15 text-destructive rounded-md border border-destructive/30">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Question Text</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
              {...register('text', { required: 'Question text is required' })}
            />
            {errors.text && <p className="text-sm text-destructive mt-1">{errors.text.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring" {...register('topic')}>
                <optgroup label="── Aptitude & Reasoning ──">
                  <option value="quantitative">Quantitative Aptitude</option>
                  <option value="logical">Logical Reasoning</option>
                  <option value="verbal">Verbal Ability</option>
                  <option value="di">Data Interpretation</option>
                </optgroup>
                <optgroup label="── Core CS / SDE ──">
                  <option value="dsa">Data Structures & Algorithms</option>
                  <option value="os">Operating Systems</option>
                  <option value="dbms">DBMS</option>
                  <option value="sql">SQL</option>
                  <option value="cn">Computer Networks</option>
                  <option value="oops">OOP Concepts</option>
                  <option value="system-design">System Design</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring" {...register('difficulty')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <Input label="Sub Topic" placeholder="e.g. number-system" {...register('subTopic', { required: true })} />
            <div>
              <label className="text-sm font-medium mb-2 block">Correct Option</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring" {...register('correctOption')}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <span className="flex items-center justify-center bg-secondary w-10 rounded-md font-bold text-muted-foreground">{field.label}</span>
                  <Input className="flex-1" {...register(`options.${index}.text`, { required: true })} />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="text-sm font-medium mb-2 block">Explanation (Step-by-step)</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
              {...register('explanation', { required: 'Explanation is required' })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <Input label="Companies (comma separated)" placeholder="TCS, Infosys" {...register('companies')} />
            <Input label="Tags (comma separated)" placeholder="primes, math" {...register('tags')} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
