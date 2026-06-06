import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '@/api/jobs';
import { Button } from '@/components/ui/Button';
import { Building, MapPin, Briefcase, Clock, FileText } from 'lucide-react';
import toast from '@/utils/toast';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = useCallback(() => {
    getMyApplications().then(res => {
      setApplications(res.data.applications);
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    setWithdrawingId(id);
    try {
      await withdrawApplication(id);
      toast.success('Application withdrawn successfully');
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-500';
      case 'under-review': return 'bg-yellow-500/20 text-yellow-500';
      case 'shortlisted': return 'bg-green-500/20 text-green-500';
      case 'hired': return 'bg-emerald-500/20 text-emerald-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      case 'withdrawn': return 'bg-secondary text-muted-foreground';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of your job and internship applications.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center bg-secondary/10 border border-border rounded-xl flex flex-col items-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No Applications Yet</h2>
            <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet. Start exploring the job feed!</p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          applications.map(app => (
            <div key={app._id} className="bg-secondary/10 hover:bg-secondary/20 transition-colors border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-16 h-16 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-xl font-bold text-primary">
                {app.jobId?.companyLogo ? (
                  <img src={app.jobId.companyLogo} alt={app.jobId.companyName} className="w-10 h-10 object-contain" />
                ) : (
                  app.jobId?.companyName?.charAt(0) || '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${app.jobId?._id}`} className="block hover:underline">
                  <h2 className="text-xl font-bold text-foreground truncate">{app.jobId?.title || 'Unknown Job'}</h2>
                </Link>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {app.jobId?.companyName}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {app.jobId?.location || app.jobId?.workMode}</span>
                  <span className="flex items-center capitalize"><Briefcase className="w-4 h-4 mr-1" /> {app.jobId?.type}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" /> 
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="shrink-0 w-full sm:w-auto text-left sm:text-right flex flex-col sm:items-end gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex ${getStatusColor(app.status)}`}>
                  {app.status.replace('-', ' ')}
                </span>
                <div className="flex gap-2 w-full sm:w-auto mt-auto">
                  {['applied', 'under-review', 'shortlisted'].includes(app.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                      onClick={() => handleWithdraw(app._id)}
                      isLoading={withdrawingId === app._id}
                      disabled={withdrawingId !== null && withdrawingId !== app._id}
                    >
                      Withdraw
                    </Button>
                  )}
                  <Link to={`/jobs/${app.jobId?._id}`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" className="w-full">View Job</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
