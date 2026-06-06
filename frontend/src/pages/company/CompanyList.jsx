import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCompanies } from '@/api/company';
import { Search, Building2, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading companies...</div>;

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
      className="max-w-6xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Tracks</h1>
        <p className="text-muted-foreground mt-1">Prepare specifically for your dream companies with targeted insights and mock tests.</p>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by company or sector..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No companies found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, index) => (
          <motion.div 
            key={company.slug} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-secondary/20 border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-xl font-bold text-primary">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">{company.sector}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fresher Package</span>
                <span className="font-medium text-green-500">{company.packageInfo?.fresher || 'Varies'}</span>
              </div>
            </div>

            <Link to={`/companies/${company.slug}`} className="mt-auto">
              <Button className="w-full justify-between group" variant="outline">
                View Track Details
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
