import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, BookOpen } from 'lucide-react';

export default function CompanyManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data.data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/companies/${id}`, { isActive: !currentStatus });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Tracks</h1>
          <p className="text-muted-foreground text-sm">Manage company-specific preparation tracks.</p>
        </div>
        <Link to="/admin/companies/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Company
          </Button>
        </Link>
      </div>

      <div className="bg-secondary/10 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading companies...</td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No companies found</td>
                </tr>
              ) : (
                companies.map(company => (
                  <tr key={company._id} className="border-t border-border hover:bg-secondary/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center font-bold">
                          {company.logo ? <img src={company.logo} alt={company.name} className="w-6 h-6 object-contain" /> : company.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{company.sector || '—'}</td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/companies/${company.slug}/questions`} className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium">
                        <BookOpen className="w-3.5 h-3.5" />
                        {company.totalQuestions || 0} Qs
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {company.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full border border-destructive/20">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/companies/${company.slug}/questions`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Manage Questions">
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => toggleActive(company._id, company.isActive !== false)}>
                          Toggle
                        </Button>
                        <Link to={`/admin/companies/${company._id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
