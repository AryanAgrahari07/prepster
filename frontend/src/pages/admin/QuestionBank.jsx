import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuestions, deleteQuestion } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ topic: '', difficulty: '', search: '', company: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await getQuestions({ page, limit: 10, ...filters });
      setQuestions(res.data.questions);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage all aptitude questions.</p>
        </div>
        <Link to="/admin/questions/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
        </Link>
      </div>

      <div className="bg-secondary/20 border border-border rounded-xl p-4 flex flex-col gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Search Questions</label>
          <div className="flex gap-2">
            <Input 
              placeholder="Search by keyword..." 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setFilters({ ...filters, search: searchInput }); setPage(1); } }}
            />
            <Button variant="secondary" onClick={() => { setFilters({ ...filters, search: searchInput }); setPage(1); }}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Topic</label>
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring"
              value={filters.topic}
              onChange={(e) => { setFilters({...filters, topic: e.target.value}); setPage(1); }}
            >
              <option value="">All Topics</option>
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
            <label className="text-sm text-muted-foreground mb-1 block">Difficulty</label>
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring"
              value={filters.difficulty}
              onChange={(e) => { setFilters({...filters, difficulty: e.target.value}); setPage(1); }}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Company</label>
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring"
              value={filters.company}
              onChange={(e) => { setFilters({...filters, company: e.target.value}); setPage(1); }}
            >
              <option value="">All Companies</option>
              <option value="tcs">TCS</option>
              <option value="infosys">Infosys</option>
              <option value="wipro">Wipro</option>
              <option value="accenture">Accenture</option>
              <option value="cognizant">Cognizant</option>
              <option value="hcl">HCL</option>
              <option value="capgemini">Capgemini</option>
              <option value="tech_mahindra">Tech Mahindra</option>
              <option value="amazon">Amazon</option>
              <option value="zoho">Zoho</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead className="bg-secondary/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Question</th>
                <th className="px-6 py-3 font-medium">Topic</th>
                <th className="px-6 py-3 font-medium">Difficulty</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : questions.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No questions found.</td></tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="line-clamp-2">{q.text}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{q.topic} - {q.subTopic}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                        q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/questions/${q._id}/edit`} state={{ question: q }}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
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
        
        {/* Pagination */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!pagination.hasNext}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
