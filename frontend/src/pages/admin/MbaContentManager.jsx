import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { motion } from 'framer-motion';
import {
  MessageSquare, User, Briefcase, PenTool, Calculator, Map,
  Plus, ToggleLeft, ToggleRight, Loader2, Pencil, Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';

// ─── Config for each MBA content type ────────────────────────────────────────
const TYPES = {
  gd: {
    label: 'GD Topics',
    icon: MessageSquare,
    color: 'text-blue-400',
    apiBase: '/v1/admin/mba/gd',
    fields: [
      { key: 'title',      label: 'Title',      type: 'text',   required: true },
      { key: 'category',   label: 'Category',   type: 'select', options: ['social', 'economic', 'political', 'technology', 'environment', 'abstract', 'other'], required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'], required: true },
      { key: 'description',label: 'Description',type: 'textarea' },
      { key: 'keyPoints',  label: 'Key Points (comma-separated)', type: 'text' },
    ],
  },
  pi: {
    label: 'PI Questions',
    icon: User,
    color: 'text-purple-400',
    apiBase: '/v1/admin/mba/pi',
    fields: [
      { key: 'question',  label: 'Question',   type: 'textarea', required: true },
      { key: 'type',      label: 'Type',       type: 'select', options: ['personal', 'situational', 'competency', 'stress', 'industry'], required: true },
      { key: 'sampleAnswer', label: 'Sample Answer', type: 'textarea' },
      { key: 'tips',      label: 'Tips (comma-separated)', type: 'text' },
    ],
  },
  cases: {
    label: 'Case Studies',
    icon: Briefcase,
    color: 'text-yellow-400',
    apiBase: '/v1/admin/mba/cases',
    fields: [
      { key: 'title',     label: 'Title',      type: 'text',    required: true },
      { key: 'sector',    label: 'Sector',     type: 'select',  options: ['consulting', 'fmcg', 'finance', 'technology', 'healthcare', 'retail', 'other'], required: true },
      { key: 'type',      label: 'Case Type',  type: 'select',  options: ['market-entry', 'profitability', 'm&a', 'pricing', 'growth', 'other'] },
      { key: 'difficulty',label: 'Difficulty', type: 'select',  options: ['easy', 'medium', 'hard'] },
      { key: 'scenario',  label: 'Scenario',   type: 'textarea', required: true },
      { key: 'solution',  label: 'Solution',   type: 'textarea' },
      { key: 'isFree',    label: 'Free?',      type: 'checkbox' },
    ],
  },
  wat: {
    label: 'WAT Topics',
    icon: PenTool,
    color: 'text-green-400',
    apiBase: '/v1/admin/mba/wat',
    fields: [
      { key: 'title',     label: 'Prompt Title', type: 'text',   required: true },
      { key: 'prompt',    label: 'Full Prompt',  type: 'textarea', required: true },
      { key: 'timeLimitMinutes', label: 'Time Limit (minutes)', type: 'number' },
      { key: 'wordLimit', label: 'Word Limit', type: 'number' },
      { key: 'sampleEssay', label: 'Sample Essay', type: 'textarea' },
    ],
  },
  guesstimates: {
    label: 'Guesstimates',
    icon: Calculator,
    color: 'text-orange-400',
    apiBase: '/v1/admin/mba/guesstimates',
    fields: [
      { key: 'title',      label: 'Title',       type: 'text',   required: true },
      { key: 'question',   label: 'Question',    type: 'textarea', required: true },
      { key: 'category',   label: 'Category',    type: 'select', options: ['market-sizing', 'fermi', 'supply-demand', 'revenue', 'other'] },
      { key: 'difficulty', label: 'Difficulty',  type: 'select', options: ['easy', 'medium', 'hard'] },
      { key: 'approach',   label: 'Approach',    type: 'select', options: ['top-down', 'bottom-up', 'comparative'] },
      { key: 'hint',       label: 'Hint',        type: 'text' },
      { key: 'finalAnswer',label: 'Final Answer',type: 'text' },
      { key: 'isFree',     label: 'Free?',       type: 'checkbox' },
    ],
  },
  sectors: {
    label: 'Sectors',
    icon: Map,
    color: 'text-pink-400',
    apiBase: '/v1/admin/mba/sectors',
    fields: [
      { key: 'name',        label: 'Name',        type: 'text',   required: true },
      { key: 'slug',        label: 'Slug',        type: 'text',   required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'topCompanies',label: 'Top Companies (comma-separated)', type: 'text' },
      { key: 'keySkills',   label: 'Key Skills (comma-separated)',    type: 'text' },
      { key: 'hiringProcessOverview', label: 'Hiring Process Overview', type: 'textarea' },
    ],
  },
};

export default function MbaContentManager() {
  const { api } = useAuthStore();
  const [activeType, setActiveType] = useState('gd');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const config = TYPES[activeType];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${config.apiBase}?limit=50`);
      setItems(res.data.data?.items || res.data.data || []);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [activeType]); // eslint-disable-line

  const toggleActive = async (item) => {
    setTogglingId(item._id);
    try {
      await api.patch(`${config.apiBase}/${item._id}`, { isActive: !item.isActive });
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    } catch { /* silent */ }
    setTogglingId(null);
  };

  const filtered = items.filter(i => {
    const text = (i.title || i.question || i.name || '').toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <SEO title="MBA Content Manager | Admin" description="" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">MBA Content Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create, edit, and toggle MBA prep content for all modules.</p>
        </div>
        <Link to={`/admin/mba/new?type=${activeType}`}>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New {config.label.slice(0, -1)}</Button>
        </Link>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPES).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => { setActiveType(key); setSearch(''); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                activeType === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeType === key ? '' : cfg.color}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${config.label}…`}
          className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          No {config.label} found.{' '}
          <Link to={`/admin/mba/new?type=${activeType}`} className="text-primary hover:underline">
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const label = item.title || item.question?.slice(0, 80) || item.name || item._id;
            const Icon = config.icon;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors ${
                  item.isActive === false ? 'opacity-50 border-border' : 'border-border hover:border-primary/30'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{label}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {item.difficulty && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.difficulty}</span>
                    )}
                    {item.category && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.category}</span>
                    )}
                    {item.isFree && (
                      <span className="text-[10px] font-bold text-green-500">FREE</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/admin/mba/${item._id}/edit?type=${activeType}`}>
                    <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => toggleActive(item)}
                    disabled={togglingId === item._id}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title={item.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {togglingId === item._id
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : item.isActive !== false
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6" />
                    }
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
