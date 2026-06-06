import { useState, useEffect } from 'react';
import { getApplications } from '@/api/admin';
import { FileText, Building2, Calendar, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function ApplicationsManager() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getApplications({ page, limit: 20, status: statusFilter });
      setApplications(res.data.applications || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const statusColors = {
    applied: 'bg-blue-500/10 text-blue-500',
    shortlisted: 'bg-yellow-500/10 text-yellow-500',
    interview: 'bg-purple-500/10 text-purple-500',
    offer: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-500',
    withdrawn: 'bg-secondary text-muted-foreground'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-1">Cross-platform view of all job applications.</p>
      </div>

      <div className="flex gap-4 mb-4">
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Job</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No applications found.</td></tr>
              ) : (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4">
                      <p className="font-bold">{app.applicantId?.profile?.firstName} {app.applicantId?.profile?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{app.applicantId?.email}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{app.applicantId?.profile?.college || 'No college'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium line-clamp-1">{app.jobId?.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {app.jobId?.companyName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[app.status] || ''}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/employer/jobs/${app.jobId?._id}/applicants`}>
                        <Button variant="outline" size="sm"><LinkIcon className="w-3 h-3 mr-2" /> View in Job</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > 0 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page} of {Math.ceil(pagination.total / pagination.limit)}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
