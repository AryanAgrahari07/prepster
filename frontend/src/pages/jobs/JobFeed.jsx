import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getJobs } from '@/api/jobs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Briefcase, MapPin, Building, Search, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { schemas } from '@/components/seo/SchemaTemplates';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';

const TYPE_COLORS = {
  'full-time':  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'internship': 'bg-green-500/10 text-green-400 border-green-500/20',
  'contract':   'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const WORKMODE_COLORS = {
  'remote': 'bg-purple-500/10 text-purple-400',
  'hybrid': 'bg-yellow-500/10 text-yellow-400',
  'onsite': 'bg-secondary text-muted-foreground',
};

export default function JobFeed() {
  const [page, setPage]               = useState(1);
  const [filters, setFilters]         = useState({ q: '', type: '', workMode: '', batchYear: '', minCtc: '' });
  const [activeFilters, setActiveFilters] = useState({ q: '', type: '', workMode: '', batchYear: '', minCtc: '' });

  const { data, isLoading: loading } = useQuery({
    queryKey: ['jobs', page, activeFilters],
    queryFn: async () => {
      const res = await getJobs({ page, limit: 10, ...activeFilters });
      return res;
    },
  });

  const jobs = data?.data?.jobs || [];
  const pagination = data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveFilters({ ...filters });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const totalPages = pagination.total ? Math.ceil(pagination.total / (pagination.limit || 10)) : 1;

  return (
    <>
      <SEO 
        title="Jobs & Opportunities | Prepster" 
        description="Browse and apply to the latest job openings, fresher roles, and internships curated for tech students." 
        keywords="fresher jobs, internships, remote software jobs, entry level tech jobs, off-campus placements"
        schema={[
          schemas.itemList({
            name: "Prepster Job Feed",
            description: "Browse and apply to the latest job openings, fresher roles, and internships curated for tech students.",
            url: "/jobs",
            items: jobs.map(j => ({
              name: j.title,
              description: j.companyName,
              url: `/jobs/${j._id}`
            }))
          })
        ]}
      />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job & Internship Feed</h1>
          <p className="text-muted-foreground mt-1">Discover curated opportunities for freshers and interns.</p>
        </div>

        {/* Search & Filters */}
        <form
          onSubmit={handleSearch}
          className="bg-secondary/20 border border-border rounded-xl p-3 sm:p-4 flex flex-col gap-3"
        >
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="job-search"
                className="pl-9"
                placeholder="Search roles, companies…"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </div>
            <Button type="submit" className="shrink-0">Search</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              id="job-type-filter"
              className="h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none w-full"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            <select
              id="job-mode-filter"
              className="h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none w-full"
              value={filters.workMode}
              onChange={(e) => handleFilterChange('workMode', e.target.value)}
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            <select
              id="job-batch-filter"
              className="h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none w-full"
              value={filters.batchYear}
              onChange={(e) => handleFilterChange('batchYear', e.target.value)}
            >
              <option value="">Any Batch</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <select
              id="job-ctc-filter"
              className="h-10 rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none w-full"
              value={filters.minCtc}
              onChange={(e) => handleFilterChange('minCtc', e.target.value)}
            >
              <option value="">Any CTC</option>
              <option value="5">5+ LPA</option>
              <option value="10">10+ LPA</option>
              <option value="15">15+ LPA</option>
            </select>
          </div>
        </form>

        <AdPlaceholder slot="8437360387" className="h-[90px]" />

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading opportunities…</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 text-center bg-secondary/10 border border-border rounded-xl">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No jobs found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-secondary/10 hover:bg-secondary/20 transition-colors border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 text-xl font-bold text-primary overflow-hidden">
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 object-contain" />
                    : job.companyName?.charAt(0)
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job._id}`} className="hover:underline">
                    <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                  </Link>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{job.companyName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || '—'}</span>
                    {job.applicationDeadline && (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-md border font-medium capitalize ${TYPE_COLORS[job.type] || ''}`}>
                      {job.type?.replace('-', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${WORKMODE_COLORS[job.workMode] || ''}`}>
                      {job.workMode}
                    </span>
                    {job.skillsRequired?.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded-md text-foreground">{skill}</span>
                    ))}
                    {job.skillsRequired?.length > 3 && (
                      <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                        +{job.skillsRequired.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0 flex flex-col items-end gap-3 w-full sm:w-auto">
                  <p className="text-sm font-semibold text-green-500">
                    {job.ctc?.min ? `₹${job.ctc.min}–${job.ctc.max} LPA` : 'Not Disclosed'}
                  </p>
                  <Link to={`/jobs/${job._id}`}>
                    <Button id={`view-job-${job._id}`} size="sm">View Details</Button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-between items-center bg-secondary/10 border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages} &mdash; {pagination.total} jobs
            </p>
            <div className="flex gap-2">
              <Button
                id="jobs-prev"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                id="jobs-next"
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
