import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobApplicants, updateApplicationStatus } from '@/api/employer';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, FileText, CheckCircle2, XCircle } from 'lucide-react';
import toast from '@/utils/toast';

export default function JobApplicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = () => {
    getJobApplicants(id).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      toast.success('Status updated successfully');
      fetchApplicants(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading applicants...</div>;
  if (!data) return <div className="p-8 text-center text-destructive">Failed to load data.</div>;

  const { job, applications } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/employer/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applicants for {job.title}</h1>
          <p className="text-muted-foreground mt-1">Manage and review candidates.</p>
        </div>
        <div className="bg-secondary/30 px-4 py-2 rounded-lg border border-border text-sm font-medium">
          Total Candidates: {applications.length}
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Branch/Year</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No applications received yet.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-secondary/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          {app.userId?.profile?.avatar ? (
                            <img src={app.userId.profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {app.userId?.profile?.firstName} {app.userId?.profile?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{app.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {app.userId?.profile?.branch || 'N/A'} - {app.userId?.profile?.graduationYear || 'N/A'}<br/>
                      <span className="text-xs">CGPA: {app.userId?.profile?.cgpa || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        app.status === 'applied' ? 'bg-blue-500/20 text-blue-500' :
                        app.status === 'shortlisted' ? 'bg-green-500/20 text-green-500' :
                        app.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="text-xs bg-background border border-border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="under-review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 px-2" 
                          disabled={!app.resumeUrl && !app.userId?.profile?.resumeUrl}
                          onClick={() => window.open(app.resumeUrl || app.userId?.profile?.resumeUrl, '_blank')}
                        >
                          <FileText className="w-3 h-3 mr-1" /> Resume
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
    </div>
  );
}
