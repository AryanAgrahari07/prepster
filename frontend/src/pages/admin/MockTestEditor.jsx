import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getMockTest, createMockTest, updateMockTest, getCompanies, getQuestions } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Search, Plus, Trash2 } from 'lucide-react';

export default function MockTestEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [companies, setCompanies] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTopic, setSearchTopic] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: '', companySlug: '', durationMinutes: 60, description: '', isActive: true }
  });

  useEffect(() => {
    getCompanies().then(res => setCompanies(res.data.companies)).catch(console.error);
    
    if (isEditing) {
      getMockTest(id).then(res => {
        reset(res.data.mockTest);
        setSelectedQuestions(res.data.mockTest.questions || []);
        setLoading(false);
      }).catch(console.error);
    }
  }, [id, isEditing, reset]);

  const searchQuestions = async () => {
    try {
      const res = await getQuestions({ topic: searchTopic, limit: 50 });
      // Filter out already selected
      const selectedIds = new Set(selectedQuestions.map(q => typeof q === 'string' ? q : q._id));
      setAvailableQuestions(res.data.questions.filter(q => !selectedIds.has(q._id)));
    } catch (err) {
      console.error(err);
    }
  };

  const addQuestion = (q) => {
    setSelectedQuestions(prev => [...prev, q]);
    setAvailableQuestions(prev => prev.filter(aq => aq._id !== q._id));
  };

  const removeQuestion = (id) => {
    setSelectedQuestions(prev => prev.filter(q => q._id !== id));
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        questions: selectedQuestions.map(q => q._id)
      };
      if (isEditing) {
        await updateMockTest(id, payload);
      } else {
        await createMockTest(payload);
      }
      navigate('/admin/mock-tests');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/mock-tests">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Mock Test' : 'New Mock Test'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <form id="mockTestForm" onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Test Details</h3>
            <Input label="Test Title" placeholder="TCS Ninja Mock 1" {...register('title', { required: 'Required' })} error={errors.title?.message} />
            <div>
              <label className="text-sm font-medium mb-1 block">Company</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('companySlug', { required: 'Required' })}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              {errors.companySlug && <p className="text-xs text-destructive mt-1">{errors.companySlug.message}</p>}
            </div>
            <Input label="Duration (mins)" type="number" {...register('durationMinutes')} />
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea className="w-full rounded-md border border-input bg-background p-3 text-sm min-h-[80px]" {...register('description')} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" {...register('isActive')} className="rounded border-input" /> Is Active
            </label>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>Save Mock Test</Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-lg border-b border-border pb-2 mb-4">Questions ({selectedQuestions.length})</h3>
            
            <div className="flex gap-2 mb-4">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm flex-1" value={searchTopic} onChange={(e) => setSearchTopic(e.target.value)}>
                <option value="">All Topics</option>
                <option value="quantitative">Quantitative</option>
                <option value="logical">Logical</option>
                <option value="verbal">Verbal</option>
              </select>
              <Button type="button" onClick={searchQuestions} variant="outline"><Search className="w-4 h-4 mr-2" /> Search</Button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              {/* Selected */}
              <div className="border border-border rounded-lg flex flex-col overflow-hidden">
                <div className="bg-secondary/50 p-2 text-xs font-bold text-center border-b border-border">Selected</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {selectedQuestions.map((q, i) => (
                    <div key={q._id} className="text-xs bg-secondary/20 p-2 rounded border border-border flex justify-between items-start gap-2">
                      <span className="text-muted-foreground">{i+1}.</span>
                      <span className="flex-1 line-clamp-2">{q.text}</span>
                      <button type="button" onClick={() => removeQuestion(q._id)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available */}
              <div className="border border-border rounded-lg flex flex-col overflow-hidden">
                <div className="bg-secondary/50 p-2 text-xs font-bold text-center border-b border-border">Available</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {availableQuestions.map(q => (
                    <div key={q._id} className="text-xs bg-secondary/20 p-2 rounded border border-border flex justify-between items-start gap-2">
                      <span className="flex-1 line-clamp-2">{q.text}</span>
                      <button type="button" onClick={() => addQuestion(q)} className="text-primary hover:bg-primary/10 p-1 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {availableQuestions.length === 0 && <p className="text-xs text-center text-muted-foreground mt-4">Search to add questions</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
