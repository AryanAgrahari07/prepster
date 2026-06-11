import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCompanies } from '@/api/company';
import { Search, Building2, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import SEO from '@/components/seo/SEO';
import { useState } from 'react';

export default function CompanyList() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });

  const companies = data?.data?.companies || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.sector && c.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        title="Company Preparation Tracks | Prepster"
        description="Prepare specifically for your dream companies like TCS, Infosys, Amazon, and Wipro with targeted insights, test patterns, and mock tests."
        keywords="TCS NQT preparation, Infosys mock test, company specific placement prep, tech company interview rounds, mass recruiter hiring process"
        url="https://prepster.in/companies"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Company Preparation Tracks",
          "url": "https://prepster.in/companies",
          "description": "Prepare specifically for your dream companies with targeted insights and mock tests."
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-w-6xl mx-auto space-y-5 sm:space-y-8 px-3 sm:px-4 md:px-6"
      >
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Company Tracks</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Prepare specifically for your dream companies with targeted insights and mock tests.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search company or sector..."
            className="pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="p-8 sm:p-12 text-center border border-dashed border-border rounded-xl">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-bold">No companies found</h3>
            <p className="text-muted-foreground mt-1 text-sm">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-secondary/20 border border-border rounded-xl p-4 sm:p-6 flex flex-col hover:border-primary/50 hover:shadow-md transition-all"
              >
                {/* Company logo + name */}
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                    {company.logo
                      ? <img src={company.logo} alt={company.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                      : <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    }
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold truncate">{company.name}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{company.sector}</p>
                  </div>
                </div>

                {/* Package info */}
                <div className="space-y-2 mb-4 sm:mb-6 flex-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      Fresher Package
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
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
