import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/store/authStore';
import { triggerJobScraper } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Briefcase, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { formatCTC } from '@/utils';
import toast from '@/utils/toast';

export default function JobManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/jobs?page=${page}&limit=20`);
      setJobs(res.data.data.jobs || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/jobs/${id}`, { status });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await triggerJobScraper();
      toast.success(result.message || 'Jobs synced successfully');
      setPage(1);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to sync jobs');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground text-sm">Review and manage employer job posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSync} isLoading={syncing} className="gap-2">
            {!syncing && <RefreshCw className="w-4 h-4" />} Fetch Now
          </Button>
          <Link to="/admin/jobs/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-secondary/10 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Job & Company</th>
                <th className="px-6 py-4">Posted By</th>
                <th className="px-6 py-4">Type / Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading jobs...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No jobs found</td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job._id} className="border-t border-border hover:bg-secondary/10">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{job.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" /> {job.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{job.postedBy?.email || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {job.postedBy?.profile?.firstName} {job.postedBy?.profile?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="capitalize">{job.type?.replace('-', ' ')}</div>
                      <div className="text-xs text-muted-foreground capitalize">{job.workMode} • {job.location || 'Any'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'active' && <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>}
                      {job.status === 'draft' && <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Draft</span>}
                      {job.status === 'closed' && <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Closed</span>}
                      {job.status === 'filled' && <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Filled</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {job.status === 'active' ? (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(job._id, 'closed')}>Close</Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(job._id, 'active')}>Activate</Button>
                      )}
                      <Link to={`/admin/jobs/${job._id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(job._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.total > 0 && (
        <div className="flex justify-between items-center bg-secondary/10 border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
