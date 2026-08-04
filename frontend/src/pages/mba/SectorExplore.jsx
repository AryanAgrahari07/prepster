import { useState, useEffect } from 'react';
import { getSectors } from '@/api/mba';
import { Button } from '@/components/ui/Button';
import { Loader2, Briefcase, ChevronRight, CheckCircle2, TrendingUp, Building2, Map } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { schemas } from '@/components/seo/SchemaTemplates';
import { motion } from 'framer-motion';

export default function SectorExplore() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState(null);

  useEffect(() => {
    getSectors()
      .then(res => {
        setSectors(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading Sectors...</div>;

  return (
    <div className="space-y-8">
      <SEO 
        title="MBA Sectors | Prepster" 
        description="Explore different MBA career paths, roles, and key skills required." 
        schema={[
          schemas.course({
            name: "MBA Sector Exploration",
            description: "Explore different MBA career paths, roles, and key skills required.",
            url: "/mba/sectors"
          })
        ]}
      />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sector Exploration</h1>
        <p className="text-muted-foreground mt-1">Discover your ideal post-MBA career path and learn what it takes to break in.</p>
      </div>

      {!activeSector ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.length === 0 ? (
            <div className="col-span-full text-center p-12 app-card text-muted-foreground border-dashed">
              <Map className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-bold text-lg mb-2">No Sectors Available</h3>
              <p>Sectors have not been populated yet.</p>
            </div>
          ) : sectors.map((sector, idx) => (
            <motion.div 
              key={sector._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="app-card p-6 flex flex-col hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setActiveSector(sector)}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">{sector.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{sector.description}</p>
              
              <div className="flex items-center text-sm font-semibold text-primary group-hover:underline">
                Explore Sector <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Button variant="outline" onClick={() => setActiveSector(null)}>← Back to Sectors</Button>
          
          <div className="app-card p-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
              <h2 className="text-3xl font-bold mb-2">{activeSector.name}</h2>
              <p className="text-muted-foreground max-w-3xl leading-relaxed">{activeSector.description}</p>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-8">
              {/* Left Column: Roles & Hiring */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Common Roles */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Typical Roles
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeSector.commonRoles?.map((role, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20">
                        <h4 className="font-bold text-base mb-1">{role.title}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hiring Process */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> The Hiring Process
                  </h3>
                  <div className="p-5 rounded-xl border border-border bg-background text-sm leading-relaxed whitespace-pre-wrap">
                    {activeSector.hiringProcessOverview || "Process details coming soon."}
                  </div>
                </div>

              </div>

              {/* Right Column: Skills & Companies */}
              <div className="space-y-8">
                
                {/* Skills Checklist */}
                <div className="app-card p-6 border-primary/20 bg-primary/5">
                  <h3 className="font-bold mb-4">Key Skills Required</h3>
                  <ul className="space-y-3">
                    {activeSector.keySkills?.map((skill, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top Companies */}
                <div className="app-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" /> Top Employers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSector.topCompanies?.map((comp, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full border border-border">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
