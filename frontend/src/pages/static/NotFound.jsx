import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Ghost, Home, Search } from 'lucide-react';
import SEO from '@/components/seo/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-pulse">
            <span className="text-[150px] font-black">404</span>
          </div>
          <Ghost className="w-24 h-24 mx-auto text-primary relative z-10" />
        </div>
        
        <div className="space-y-2 relative z-10 mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Looks like you're lost</h1>
          <p className="text-muted-foreground">
            The page you are looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 relative z-10">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/jobs" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
