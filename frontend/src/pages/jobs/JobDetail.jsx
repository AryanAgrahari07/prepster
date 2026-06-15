import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob, uploadResume } from '@/api/jobs';
import { Button } from '@/components/ui/Button';
import BookmarkButton from '@/components/ui/BookmarkButton';
import { Input } from '@/components/ui/Input';
import { Building, MapPin, Briefcase, Calendar, GraduationCap, CheckCircle2, Zap } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from '@/utils/toast';
import SEO from '@/components/seo/SEO';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false); // Should really come from backend check
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    getJobById(id).then(res => {
      setJob(res.data.job);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  const handleApply = async () => {
    if (user?.subscription?.plan !== 'pro') {
      toast.error('Direct apply is a Pro feature. Please upgrade to Prepster Pro.');
      navigate('/upgrade');
      return;
    }
    
    try {
      setApplying(true);
      
      let resumeUrl = user?.profile?.resumeUrl;
      
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const res = await uploadResume(formData);
        resumeUrl = res.data.resumeUrl;
      }
      
      if (!resumeUrl) {
        toast.error('Please upload a resume to apply.');
        setApplying(false);
        return;
      }

      await applyForJob(id, { resumeUrl }); 
      setApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading job details...</div>;
  if (!job) return <div className="p-8 text-center text-destructive">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEO 
        title={`${job.title} at ${job.companyName} | Prepster`} 
        description={`Apply for ${job.title} at ${job.companyName}. Location: ${job.location || 'Remote'}. Eligibility: ${job.eligibility?.batchYears?.join(', ')} batch.`}
        url={`https://prepster.in/jobs/${job._id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "datePosted": new Date(job.createdAt).toISOString(),
          "validThrough": new Date(new Date(job.createdAt).getTime() + 30*24*60*60*1000).toISOString(),
          "employmentType": job.type?.toUpperCase() || "FULL_TIME",
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.companyName,
            "logo": job.companyLogo || ""
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location || "Remote"
            }
          },
          "baseSalary": job.ctc ? {
            "@type": "MonetaryAmount",
            "currency": job.ctc.currency || "INR",
            "value": {
              "@type": "QuantitativeValue",
              "minValue": job.ctc.min * 100000,
              "maxValue": job.ctc.max * 100000,
              "unitText": "YEAR"
            }
          } : undefined
        }}
      />
      <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">← Back to Jobs</Link>
      
      <div className="bg-secondary/20 border border-border rounded-xl p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:gap-6 items-start justify-between">
          <div className="flex items-center gap-4 sm:gap-6 w-full">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-background border border-border flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary shrink-0">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              ) : (
                job.companyName.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1 flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground pr-4">{job.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <span className="flex items-center font-medium text-sm"><Building className="w-4 h-4 mr-1" /> {job.companyName}</span>
                </div>
              </div>
              <BookmarkButton 
                itemType="job" 
                itemId={job._id} 
                snapshot={{ title: job.title, subtitle: job.companyName, href: `/jobs/${job._id}` }} 
                className="shrink-0 mt-1"
              />
            </div>
          </div>
          <div className="w-full">
            {!user ? (
              <div className="flex flex-col gap-3 bg-secondary/10 p-4 sm:p-5 rounded-xl border border-border w-full">
                <h3 className="font-bold text-lg">Interested in this role?</h3>
                <p className="text-sm text-muted-foreground mb-1">Sign in to apply or upgrade to Pro to unlock direct applications.</p>
                <Link to="/auth/login">
                  <Button className="w-full font-bold">Login to Apply</Button>
                </Link>
              </div>
            ) : applied ? (
              <div className="flex flex-col items-center justify-center bg-green-500/10 p-4 sm:p-5 rounded-xl border border-green-500/30 w-full">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-green-500">Application Submitted</h3>
                <p className="text-sm text-green-500/80 text-center mt-1">We've sent your profile and resume to the employer.</p>
                <Link to="/applications" className="mt-4">
                  <Button variant="outline" size="sm" className="border-green-500/50 text-green-500 hover:bg-green-500/20">
                    Track Status
                  </Button>
                </Link>
              </div>
            ) : user?.subscription?.plan !== 'pro' ? (
              <div className="flex flex-col gap-3 bg-primary/10 p-4 sm:p-5 rounded-xl border border-primary/20 w-full">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Zap className="w-5 h-5 fill-current" />
                  <span>Pro Feature</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Prepster Pro to apply directly to jobs and internships.
                </p>
                <Link to="/upgrade">
                  <Button className="w-full font-bold mt-2">Upgrade to Pro</Button>
                </Link>
              </div>
            ) : job.externalApplyUrl ? (
              <div className="flex flex-col gap-2 bg-background p-4 sm:p-5 rounded-xl border border-border w-full">
                <div className="text-sm font-bold mb-1">Direct External Apply</div>
                <p className="text-sm text-muted-foreground mb-3">You will be redirected to the company's application portal to apply.</p>
                <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button size="lg" className="w-full font-bold">
                    Apply on Company Site
                  </Button>
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2 bg-background p-4 sm:p-5 rounded-xl border border-border w-full">
                <div className="text-sm font-bold mb-1">Upload Resume <span className="text-muted-foreground font-normal ml-1">(PDF max 5MB)</span></div>
                <Input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setResumeFile(e.target.files[0])} 
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <Button size="lg" className="w-full font-bold mt-3" onClick={handleApply} isLoading={applying}>
                  Apply Now
                </Button>
                {user?.profile?.resumeUrl ? (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {!resumeFile ? 'Your default resume will be used' : 'New resume will be uploaded'}
                  </p>
                ) : (
                  <p className="text-xs text-orange-400 mt-2 text-center">
                    {!resumeFile && 'Please attach a resume to apply'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Location</p>
            <p className="font-medium text-sm sm:text-base">{job.location || 'Remote'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center"><Briefcase className="w-4 h-4 mr-1" /> Type</p>
            <p className="font-medium capitalize text-sm sm:text-base">{job.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">💸 Salary</p>
            <p className="font-medium text-green-500 text-sm sm:text-base">
              {job.ctc?.min ? `₹${job.ctc.min}-${job.ctc.max} LPA` : 'Not Disclosed'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center"><Calendar className="w-4 h-4 mr-1" /> Deadline</p>
            <p className="font-medium text-sm sm:text-base">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-background border border-border p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Job Description</h2>
            <div className="prose prose-invert text-muted-foreground whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-secondary/10 border border-border p-6 rounded-xl space-y-4">
            <h2 className="font-bold flex items-center text-lg"><GraduationCap className="w-5 h-5 mr-2 text-primary" /> Eligibility</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Batch Years</p>
                <p className="font-medium">{job.eligibility?.batchYears?.join(', ') || 'Any'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branches</p>
                <p className="font-medium">{job.eligibility?.branches?.join(', ') || 'Any'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min CGPA</p>
                <p className="font-medium">{job.eligibility?.minCGPA || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/10 border border-border p-6 rounded-xl">
            <h2 className="font-bold mb-4 text-lg">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired?.map(skill => (
                <span key={skill} className="bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium">{skill}</span>
              ))}
              {(!job.skillsRequired || job.skillsRequired.length === 0) && (
                <span className="text-muted-foreground text-sm">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
