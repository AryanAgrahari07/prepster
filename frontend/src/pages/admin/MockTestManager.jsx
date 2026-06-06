import { useState, useEffect } from 'react';
import { getMockTests, deleteMockTest } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MockTestManager() {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      const res = await getMockTests();
      setMockTests(res.data.mockTests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mock test?')) return;
    try {
      await deleteMockTest(id);
      fetchMockTests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Tests</h1>
          <p className="text-muted-foreground mt-1">Manage company-specific mock tests.</p>
        </div>
        <Link to="/admin/mock-tests/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Mock Test</Button>
        </Link>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Test Name</th>
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium">Questions</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : mockTests.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No mock tests found.</td></tr>
            ) : (
              mockTests.map((test) => (
                <tr key={test._id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{test.title}</td>
                  <td className="px-6 py-4 uppercase font-semibold text-primary">{test.companySlug}</td>
                  <td className="px-6 py-4">{test.questions?.length || 0} Qs</td>
                  <td className="px-6 py-4 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {test.durationMinutes}m</td>
                  <td className="px-6 py-4">
                    {test.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/mock-tests/${test._id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(test._id)}>
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
    </div>
  );
}
