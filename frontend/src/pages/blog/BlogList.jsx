import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs } from '@/api/blog';
import { Button } from '@/components/ui/Button';
import { Clock, Tag as TagIcon } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';

const getDefaultImage = (slug) => {
  // Using Picsum with the blog slug as a seed guarantees a unique, 
  // consistent, high-quality image for every single blog post.
  return `https://picsum.photos/seed/${slug}/1200/600?grayscale&blur=2`;
};

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const fetchBlogs = async (pageNum) => {
    try {
      const res = await getBlogs({ page: pageNum, limit: 9 });
      if (pageNum === 1) {
        setBlogs(res.data.blogs);
      } else {
        setBlogs(prev => [...prev, ...res.data.blogs]);
      }
      setHasNext(res.pagination.hasNext);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Prepster Blog | Placement Tips & Interview Guides" 
        description="Read the latest tips on cracking campus placements, aptitude tests, and technical interviews."
        keywords="placement tips, interview guides, campus placement blog, tech interview experiences, aptitude prep"
        url="https://prepster.in/blogs"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Prepster Blog",
          "url": "https://prepster.in/blogs",
          "description": "Read the latest tips on cracking campus placements, aptitude tests, and technical interviews."
        }}
      />

      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          The <span className="text-primary">Prepster</span> Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, interview experiences, and guides to help you land your dream job.
        </p>
      </div>

      <AdPlaceholder slot="8790873741" className="h-[90px] md:h-[120px] max-w-4xl mx-auto" />

      {loading && blogs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-secondary/30 rounded-2xl h-80"></div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-2xl border border-border">
          <p className="text-xl font-medium">No posts found.</p>
          <p className="mt-2 text-sm">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <Link 
              key={blog._id} 
              to={`/blogs/${blog.slug}`}
              className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300"
            >
              <div className="aspect-[16/9] w-full bg-secondary/50 overflow-hidden relative">
                {blog.coverImage ? (
                  <img 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img 
                    src={getDefaultImage(blog.slug)} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {blog.readTime || 5} min read
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md flex items-center gap-1">
                      <TagIcon className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                <div className="mt-auto pt-6 flex items-center gap-3 border-t border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {blog.author?.profile?.avatar ? (
                      <img src={blog.author.profile.avatar} alt="Author" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (blog.author?.profile?.firstName?.[0] || 'A')
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{blog.author?.profile?.firstName} {blog.author?.profile?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasNext && (
        <div className="text-center pt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => fetchBlogs(page + 1)}
            isLoading={loading}
          >
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
}
