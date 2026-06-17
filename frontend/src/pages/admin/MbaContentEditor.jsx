import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Loader2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';

// ─── Field config — mirrors MbaContentManager ────────────────────────────────
const TYPES = {
  gd: {
    label: 'GD Topic',
    apiBase: '/admin/mba/gd',
    fields: [
      { key: 'title',       label: 'Title',       type: 'text',    required: true },
      { key: 'category',    label: 'Category',    type: 'select',  required: true,
        options: ['social','economic','political','technology','environment','abstract','other'] },
      { key: 'difficulty',  label: 'Difficulty',  type: 'select',  required: true,
        options: ['easy','medium','hard'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'keyPoints',   label: 'Key Points (comma-separated)', type: 'text' },
    ],
  },
  pi: {
    label: 'PI Question',
    apiBase: '/admin/mba/pi',
    fields: [
      { key: 'question',    label: 'Question',    type: 'textarea', required: true },
      { key: 'type',        label: 'Type',        type: 'select',   required: true,
        options: ['personal','situational','competency','stress','industry'] },
      { key: 'sampleAnswer',label: 'Sample Answer', type: 'textarea' },
      { key: 'tips',        label: 'Tips (comma-separated)', type: 'text' },
    ],
  },
  cases: {
    label: 'Case Study',
    apiBase: '/admin/mba/cases',
    fields: [
      { key: 'title',       label: 'Title',       type: 'text',    required: true },
      { key: 'sector',      label: 'Sector',      type: 'select',  required: true,
        options: ['consulting','fmcg','finance','technology','healthcare','retail','other'] },
      { key: 'type',        label: 'Case Type',   type: 'select',
        options: ['market-entry','profitability','m&a','pricing','growth','other'] },
      { key: 'difficulty',  label: 'Difficulty',  type: 'select',
        options: ['easy','medium','hard'] },
      { key: 'scenario',    label: 'Scenario',    type: 'textarea', required: true },
      { key: 'solution',    label: 'Solution',    type: 'textarea' },
      { key: 'isFree',      label: 'Free (no Pro required)?', type: 'checkbox' },
    ],
  },
  wat: {
    label: 'WAT Topic',
    apiBase: '/admin/mba/wat',
    fields: [
      { key: 'title',         label: 'Prompt Title',   type: 'text',    required: true },
      { key: 'prompt',        label: 'Full Prompt',    type: 'textarea', required: true },
      { key: 'timeLimitMinutes', label: 'Time Limit (min)', type: 'number' },
      { key: 'wordLimit',     label: 'Word Limit',    type: 'number' },
      { key: 'sampleEssay',   label: 'Sample Essay',  type: 'textarea' },
    ],
  },
  guesstimates: {
    label: 'Guesstimate',
    apiBase: '/admin/mba/guesstimates',
    fields: [
      { key: 'title',       label: 'Title',       type: 'text',   required: true },
      { key: 'question',    label: 'Question',    type: 'textarea', required: true },
      { key: 'category',    label: 'Category',    type: 'select',
        options: ['market-sizing','fermi','supply-demand','revenue','other'] },
      { key: 'difficulty',  label: 'Difficulty',  type: 'select',
        options: ['easy','medium','hard'] },
      { key: 'approach',    label: 'Approach',    type: 'select',
        options: ['top-down','bottom-up','comparative'] },
      { key: 'hint',        label: 'Hint (optional)', type: 'text' },
      { key: 'finalAnswer', label: 'Final Answer',   type: 'text' },
      { key: 'isFree',      label: 'Free (no Pro required)?', type: 'checkbox' },
    ],
  },
  sectors: {
    label: 'Sector',
    apiBase: '/admin/mba/sectors',
    fields: [
      { key: 'name',        label: 'Name',        type: 'text',    required: true },
      { key: 'slug',        label: 'Slug',        type: 'text',    required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'topCompanies',label: 'Top Companies (comma-separated)', type: 'text' },
      { key: 'keySkills',   label: 'Key Skills (comma-separated)',    type: 'text' },
      { key: 'hiringProcessOverview', label: 'Hiring Process Overview', type: 'textarea' },
    ],
  },
};

// ─── Generic field renderer ───────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const base = 'w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.key}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        rows={5}
        className={`${base} resize-y`}
        required={field.required}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select
        id={field.key}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        className={base}
        required={field.required}
      >
        <option value="">— Select —</option>
        {field.options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          id={field.key}
          checked={!!value}
          onChange={e => onChange(field.key, e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm">{field.label}</span>
      </label>
    );
  }
  return (
    <input
      id={field.key}
      type={field.type || 'text'}
      value={value ?? ''}
      onChange={e => onChange(field.key, e.target.value)}
      className={base}
      required={field.required}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MbaContentEditor() {
  const { id } = useParams();          // undefined on 'new'
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'gd';
  const config = TYPES[type];
  const navigate = useNavigate();
  const { api } = useAuthStore();
  const isNew = !id;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load existing item for edit
  useEffect(() => {
    if (!isNew) {
      api.get(`${config.apiBase}/${id}`)
        .then(res => {
          const data = res.data.data;
          // Flatten comma-sep arrays back to strings for editing
          ['keyPoints','tips','topCompanies','keySkills'].forEach(k => {
            if (Array.isArray(data[k])) data[k] = data[k].join(', ');
          });
          setForm(data);
          setLoading(false);
        })
        .catch(() => { setError('Failed to load content.'); setLoading(false); });
    }
  }, [id, type]); // eslint-disable-line

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Coerce comma-sep string fields back to arrays
      const payload = { ...form };
      ['keyPoints','tips','topCompanies','keySkills'].forEach(k => {
        if (typeof payload[k] === 'string' && payload[k].trim()) {
          payload[k] = payload[k].split(',').map(s => s.trim()).filter(Boolean);
        }
      });

      if (isNew) {
        await api.post(config.apiBase, payload);
      } else {
        await api.put(`${config.apiBase}/${id}`, payload);
      }
      navigate('/admin/mba');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Save failed. Please check the form.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SEO title={`${isNew ? 'New' : 'Edit'} ${config.label} | Admin`} description="" />

      <div className="flex items-center gap-3">
        <Link to="/admin/mba">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">{isNew ? `New ${config.label}` : `Edit ${config.label}`}</h1>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="app-card p-6 space-y-5">
        {config.fields.map(field => (
          <div key={field.key}>
            {field.type !== 'checkbox' && (
              <label htmlFor={field.key} className="block text-sm font-semibold mb-1.5">
                {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
            )}
            <FieldInput
              field={field}
              value={form[field.key]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Link to="/admin/mba">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[100px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
