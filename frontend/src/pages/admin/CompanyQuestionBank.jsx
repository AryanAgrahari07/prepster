import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { deleteQuestion, bulkImportCompanyQuestions, getAdminCompanyQuestions } from '@/api/admin';
import { getCompanyTrack } from '@/api/company';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus, Edit, Trash2, Search, Upload, ArrowLeft,
  Building2, CheckCircle2, XCircle, AlertCircle, BookOpen
} from 'lucide-react';

// ─── Bulk Import Panel ────────────────────────────────────────────────────────
function BulkImportPanel({ slug, companyName, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const parseFile = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let data = [];

        if (f.name.endsWith('.json')) {
          data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error('JSON must be an array of objects');
        } else if (f.name.endsWith('.csv')) {
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((h, j) => { obj[h] = values[j] ? values[j].trim().replace(/^"|"$/g, '') : ''; });
            obj.options = [
              { label: 'A', text: obj.optionA || '' },
              { label: 'B', text: obj.optionB || '' },
              { label: 'C', text: obj.optionC || '' },
              { label: 'D', text: obj.optionD || '' },
            ].filter(o => o.text);
            if (obj.companies) obj.companies = obj.companies.split(';').filter(Boolean);
            else obj.companies = [];
            if (obj.tags) obj.tags = obj.tags.split(';').filter(Boolean);
            data.push(obj);
          }
        } else {
          throw new Error('Unsupported file type. Use .json or .csv');
        }

        // Validate
        const REQUIRED = ['text', 'correctOption', 'explanation', 'topic', 'difficulty'];
        const validated = data.map((row, idx) => {
          const missing = REQUIRED.filter(f => !row[f]);
          const validOptions = row.options && row.options.length >= 2 && row.options.every(o => o.text);
          return {
            _raw: row,
            index: idx + 1,
            isValid: missing.length === 0 && validOptions,
            errors: [...missing.map(m => `Missing ${m}`), ...(!validOptions ? ['Need ≥2 options'] : [])],
          };
        });
        setPreview(validated);
        setResults(null);
      } catch (err) {
        alert('Error parsing file: ' + err.message);
        setFile(null);
        setPreview(null);
      }
    };
    reader.readAsText(f);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) { setFile(selected); parseFile(selected); }
  };

  const handleImport = async () => {
    if (!preview) return;
    const validRows = preview.filter(p => p.isValid).map(p => p._raw);
    if (validRows.length === 0) { alert('No valid rows to import'); return; }
    try {
      setLoading(true);
      const res = await bulkImportCompanyQuestions(slug, validRows);
      setResults(res.data);
      setPreview(null);
      setFile(null);
      onImported?.();
    } catch (err) {
      alert('Import failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const validCount = preview?.filter(p => p.isValid).length || 0;
  const invalidCount = preview?.filter(p => !p.isValid).length || 0;

  if (results) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Import Complete!</h3>
        <p className="text-muted-foreground mb-6">
          Successfully imported <strong>{results.imported}</strong> questions for <strong>{companyName}</strong>.
          {results.skipped > 0 && ` Skipped ${results.skipped} invalid rows.`}
        </p>
        <Button onClick={() => setResults(null)}>Import More</Button>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-1">Bulk Upload for {companyName}</h3>
          <p className="text-sm text-muted-foreground">All uploaded questions will be auto-tagged to <strong>{companyName}</strong>.</p>
        </div>

        <div className="flex justify-center mb-6">
          <input type="file" id="cq-file-upload" className="hidden" accept=".json,.csv" onChange={handleFileChange} />
          <label htmlFor="cq-file-upload">
            <Button as="span" className="cursor-pointer gap-2">
              <Upload className="w-4 h-4" /> Select JSON / CSV File
            </Button>
          </label>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Expected CSV Headers:</p>
          <code className="text-xs leading-relaxed break-all">
            text, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), explanation, topic, subTopic, difficulty (easy/medium/hard), tags (semicolon-sep)
          </code>
          <p className="mt-3 font-semibold text-foreground mb-1">JSON Format:</p>
          <code className="text-xs leading-relaxed">
            {`[{ "text": "...", "options": [{"label":"A","text":"..."},...], "correctOption": "A", "explanation": "...", "topic": "quantitative", "subTopic": "...", "difficulty": "medium" }]`}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex gap-6">
          <div><p className="text-sm text-muted-foreground">Total Rows</p><p className="text-2xl font-bold">{preview.length}</p></div>
          <div><p className="text-sm text-green-500">Valid</p><p className="text-2xl font-bold text-green-500">{validCount}</p></div>
          <div><p className="text-sm text-red-500">Invalid</p><p className="text-2xl font-bold text-red-500">{invalidCount}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>Cancel</Button>
          <Button onClick={handleImport} disabled={validCount === 0 || loading} isLoading={loading}>
            Import {validCount} Questions
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium">Row</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Question Text</th>
                <th className="px-4 py-3 font-medium">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {preview.map((row) => (
                <tr key={row.index} className={!row.isValid ? 'bg-red-500/5' : ''}>
                  <td className="px-4 py-3 text-muted-foreground">{row.index}</td>
                  <td className="px-4 py-3">
                    {row.isValid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  </td>
                  <td className="px-4 py-3"><div className="line-clamp-1">{row._raw.text || <span className="text-muted-foreground italic">Missing text</span>}</div></td>
                  <td className="px-4 py-3 text-red-500 text-xs">{row.errors.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompanyQuestionBank() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ topic: '', difficulty: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [tab, setTab] = useState('questions'); // 'questions' | 'import'

  useEffect(() => {
    getCompanyTrack(slug)
      .then(res => setCompany(res.data.company))
      .catch(console.error);
  }, [slug]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminCompanyQuestions(slug, { page, limit: 15, ...filters });
      setQuestions(res.data.questions || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error('Failed to fetch company questions', err);
    } finally {
      setLoading(false);
    }
  }, [slug, page, filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const applySearch = () => { setFilters(f => ({ ...f, search: searchInput })); setPage(1); };

  const companyName = company?.name || slug;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/companies')} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {company?.logo
              ? <img src={company.logo} alt={companyName} className="w-7 h-7 object-contain" />
              : <Building2 className="w-5 h-5 text-primary" />
            }
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{companyName} — Question Bank</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total ?? 0} questions tagged to this company
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/questions/new`} state={{ defaultCompany: slug }}>
            <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Add Single</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        {[
          { id: 'questions', label: 'Questions', icon: BookOpen },
          { id: 'import', label: 'Bulk Import', icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Questions Tab */}
      {tab === 'questions' && (
        <>
          {/* Filters */}
          <div className="bg-secondary/20 border border-border rounded-xl p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder="Search questions..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applySearch(); }}
              />
              <Button variant="secondary" onClick={applySearch}><Search className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring"
                  value={filters.topic}
                  onChange={e => { setFilters(f => ({ ...f, topic: e.target.value })); setPage(1); }}
                >
                  <option value="">All Topics</option>
                  <optgroup label="── Aptitude ──">
                    <option value="quantitative">Quantitative</option>
                    <option value="logical">Logical Reasoning</option>
                    <option value="verbal">Verbal Ability</option>
                    <option value="di">Data Interpretation</option>
                  </optgroup>
                  <optgroup label="── Core CS ──">
                    <option value="dsa">DSA</option>
                    <option value="os">Operating Systems</option>
                    <option value="dbms">DBMS</option>
                    <option value="sql">SQL</option>
                    <option value="cn">Computer Networks</option>
                    <option value="oops">OOP</option>
                    <option value="system-design">System Design</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring"
                  value={filters.difficulty}
                  onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value })); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-xl overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[480px]">
                <thead className="bg-secondary/50 text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Question</th>
                    <th className="px-5 py-3 font-medium">Topic</th>
                    <th className="px-5 py-3 font-medium">Difficulty</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan="4" className="px-5 py-10 text-center text-muted-foreground">Loading questions...</td></tr>
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <AlertCircle className="w-8 h-8 opacity-40" />
                          <p>No questions found for {companyName}.</p>
                          <button onClick={() => setTab('import')} className="text-primary text-sm hover:underline">
                            Upload questions via Bulk Import →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    questions.map(q => (
                      <tr key={q._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-4"><div className="line-clamp-2 max-w-md">{q.text}</div></td>
                        <td className="px-5 py-4 capitalize text-sm">{q.topic}{q.subTopic ? ` · ${q.subTopic}` : ''}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            q.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                            q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/admin/questions/${q._id}/edit`} state={{ question: q }}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(q._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pagination.total > 0 ? `Page ${pagination.page} of ${Math.ceil(pagination.total / pagination.limit) || 1} · ${pagination.total} total` : 'No results'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Import Tab */}
      {tab === 'import' && (
        <BulkImportPanel slug={slug} companyName={companyName} onImported={fetchQuestions} />
      )}
    </div>
  );
}
