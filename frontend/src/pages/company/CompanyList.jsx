import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCompanies } from '@/api/company';
import { Search, Building2, ArrowRight, Package, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SEO from '@/components/seo/SEO';
import { useState, useMemo } from 'react';
import useAuthStore from '@/store/authStore';

const STREAM_TABS = [
  { id: 'all',         label: 'All Companies',        icon: Building2 },
  { id: 'engineering', label: 'Engineering & IT',      icon: GraduationCap },
  { id: 'mba',         label: 'Consulting & MBA',      icon: Briefcase },
];

const STREAM_BADGE = {
  engineering: { label: 'Engineering', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  mba:         { label: 'Consulting',  class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  both:        { label: 'All Streams', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

const SEO_META = {
  all: {
    title: 'Company Preparation Tracks | Prepster',
    description: 'Prepare for TCS, Infosys, McKinsey, BCG and more with targeted company tracks, mock tests, and interview insights.',
  },
  engineering: {
    title: 'Engineering Company Tracks | Prepster',
    description: 'Prepare specifically for TCS, Infosys, Wipro, Amazon and more with targeted insights, test patterns and mock tests.',
  },
  mba: {
    title: 'Consulting & MBA Company Tracks | Prepster',
    description: 'Crack McKinsey, BCG, Bain, Deloitte and top FMCG interviews with our dedicated consulting and MBA preparation tracks.',
  },
};

export default function CompanyList() {
  const { user } = useAuthStore();
  
  // Determine if the user (or guest) is in the MBA track
  const guestStream = localStorage.getItem('prepster_guest_stream') || 'engineering';
  const effectiveStream = user ? user.stream : guestStream;
  const isMba = effectiveStream === 'mba';

  const [activeTab, setActiveTab] = useState(isMba ? 'mba' : 'engineering');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all companies — no stream param so we can do client-side tab switching without refetch
  const { data, isLoading: loading } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });

  const allCompanies = data?.data?.companies || [];

  // Client-side filtering by tab + search
  const filteredCompanies = useMemo(() => {
    let list = allCompanies;

    // Force engineering tab if not MBA, otherwise use the selected activeTab
    const currentTab = !isMba ? 'engineering' : activeTab;

    if (currentTab !== 'all') {
      list = list.filter(c => {
        const stream = c.targetStream || 'engineering';
        return stream === currentTab || stream === 'both';
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.sector && c.sector.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allCompanies, activeTab, searchTerm, isMba]);

  // Use the effective tab for SEO
  const effectiveTabForSeo = !isMba ? 'engineering' : activeTab;
  const seo = SEO_META[effectiveTabForSeo] || SEO_META.all;

  if (loading) return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-secondary/30 rounded-lg" />
      <div className="h-10 w-full max-w-sm bg-secondary/20 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-secondary/20 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords="TCS NQT preparation, Infosys mock test, McKinsey case interview, BCG consulting prep, company specific placement prep"
        url="https://prepster.in/companies"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Company Preparation Tracks",
          "url": "https://prepster.in/companies",
          "description": seo.description,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-w-6xl mx-auto space-y-5 sm:space-y-6 px-3 sm:px-4 md:px-6"
      >
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {(!isMba || activeTab === 'engineering') ? 'Company Tracks' : (activeTab === 'mba' ? 'Consulting & MBA Tracks' : 'All Company Tracks')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {(!isMba || activeTab === 'engineering')
              ? 'Prepare specifically for your dream companies with targeted insights and mock tests.'
              : (activeTab === 'mba' 
                  ? 'Prepare for top consulting firms, FMCG, and management roles with targeted case study and GD/PI tracks.'
                  : 'Explore all available company preparation tracks.')
            }
          </p>
        </div>

        {/* Stream tabs - Only show if in MBA track */}
        {isMba && (
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 bg-secondary/50 border border-border rounded-2xl p-1 w-fit min-w-fit">
              {STREAM_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'mba' ? 'Search firm or sector…' : 'Search company or sector…'}
            className="pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* MBA info banner */}
        {activeTab === 'mba' && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-300">MBA & Consulting Tracks</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each track includes the firm's hiring process, case study frameworks, GD/PI prep tips, and compensation data.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredCompanies.length === 0 ? (
          <div className="p-8 sm:p-12 text-center border border-dashed border-border rounded-xl">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-bold">No companies found</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {searchTerm ? 'Try adjusting your search.' : 'No tracks available for this stream yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {filteredCompanies.map((company, index) => {
              const badge = STREAM_BADGE[company.targetStream] || STREAM_BADGE.engineering;
              return (
                <motion.div
                  key={company.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-secondary/20 border border-border rounded-xl p-4 sm:p-6 flex flex-col hover:border-primary/50 hover:shadow-md transition-all"
                >
                  {/* Company logo + name */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {company.logo
                        ? <img src={company.logo} alt={company.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                        : <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-xl font-bold truncate">{company.name}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{company.sector}</p>
                    </div>
                  </div>

                  {/* Stream badge + package */}
                  <div className="space-y-2 mb-4 sm:mb-6 flex-1">
                    {/* Only show stream badge when viewing "all" tab */}
                    {activeTab === 'all' && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex ${badge.class}`}>
                        {badge.label}
                      </span>
                    )}
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="w-3.5 h-3.5 shrink-0" />
                        {activeTab === 'mba' ? 'Starting CTC' : 'Fresher Package'}
                      </span>
                      <span className="font-semibold text-green-500">{company.packageInfo?.fresher || 'Varies'}</span>
                    </div>
                  </div>

                  <Link to={`/companies/${company.slug}`} className="mt-auto">
                    <Button className="w-full justify-between group text-xs sm:text-sm" variant="outline">
                      View Track Details
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
