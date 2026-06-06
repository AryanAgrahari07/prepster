import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployerJobs } from '@/api/employer';
import { Button } from '@/components/ui/Button';
import { Plus, Users, Briefcase, MapPin, Activity } from 'lucide-react';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployerJobs().then(res => {
      setJobs(res.data.jobs);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your job postings and applicants.</p>
        </div>
        <Link to="/employer/post-job">
          <Button><Plus className="w-4 h-4 mr-2" /> Post New Job</Button>
        </Link>
      </div>

      <div className="space-y-4 pt-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading your postings...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-secondary/10 border border-border rounded-xl">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Active Postings</h2>
            <p className="text-muted-foreground mb-6">You haven't posted any jobs yet. Create your first posting to start receiving applications.</p>
            <Link to="/employer/post-job">
              <Button>Create Posting</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="bg-secondary/10 border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground line-clamp-1">{job.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{job.type} • {job.workMode}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${job.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-6 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1"><Users className="w-4 h-4" /> Applicants</p>
                    <p className="text-2xl font-bold text-foreground">{job.applicationCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1"><Activity className="w-4 h-4" /> Views</p>
                    <p className="text-2xl font-bold text-foreground">{job.views || 0}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <Link to={`/employer/jobs/${job._id}/applicants`} className="block">
                    <Button className="w-full justify-center">View Applicants</Button>
                  </Link>
                  <Link to={`/employer/jobs/${job._id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-center">Edit Posting</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
