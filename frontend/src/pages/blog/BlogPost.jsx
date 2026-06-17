import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogBySlug } from '@/api/blog';
import { ArrowLeft, Clock, Tag as TagIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';

const getDefaultImage = (slug) => {
  // Using Picsum with the blog slug as a seed guarantees a unique,
  // consistent, high-quality colourful image for every single blog post.
  return `https://picsum.photos/seed/${slug}/1200/600`;
};

// Very basic Markdown parser for bold, italics, headings, and lists
const MarkdownRenderer = ({ content }) => {
  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-6 text-foreground">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italics
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-4 text-muted-foreground bg-secondary/20 italic">$1</blockquote>')
      // Unordered Lists
      .replace(/^\s*\n\*/gim, '<ul>\n*')
      .replace(/^(\*|\-) (.*$)/gim, '<li class="ml-6 list-disc mb-1">$2</li>')
      // Ordered lists (very basic)
      .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 list-decimal mb-1">$1</li>')
      // Paragraphs
      .replace(/^\s*(\n)?(.+)/gim, function(m) {
        return /<(\/)?(h1|h2|h3|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p class="mb-4 leading-relaxed">' + m + '</p>';
      });
      
    // Fix up list containers
    html = html.replace(/<\/li>\n<p class="mb-4 leading-relaxed">/g, '</li>\n');
      
    return { __html: html };
  };

  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none text-foreground/90"
      dangerouslySetInnerHTML={parseMarkdown(content)}
    />
  );
};

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getBlogBySlug(slug)
      .then(res => setBlog(res.data.blog))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto p-8 animate-pulse space-y-8">
      <div className="h-64 bg-secondary/30 rounded-2xl w-full"></div>
      <div className="space-y-4">
        <div className="h-12 bg-secondary/20 rounded-lg w-3/4"></div>
        <div className="h-4 bg-secondary/20 rounded-md w-1/4"></div>
      </div>
      <div className="space-y-4 pt-8">
        <div className="h-4 bg-secondary/10 rounded-md w-full"></div>
        <div className="h-4 bg-secondary/10 rounded-md w-full"></div>
        <div className="h-4 bg-secondary/10 rounded-md w-5/6"></div>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
      <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or was removed.</p>
      <Link to="/blogs"><Button>Back to Blogs</Button></Link>
    </div>
  );

  return (
    <article className="max-w-4xl mx-auto space-y-10 pb-16 px-4 sm:px-6 lg:px-8 mt-4">
      <SEO 
        title={`${blog.title} | Prepster Blog`} 
        description={(blog.excerpt || blog.content || '').substring(0, 150) + '...'} 
        image={blog.coverImage}
        url={`https://prepster.in/blogs/${blog.slug}`}
        keywords={blog.tags ? blog.tags.join(', ') : 'placement blog, tech interviews, prepster'}
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": blog.title,
          "image": blog.coverImage ? [blog.coverImage] : [],
          "datePublished": new Date(blog.createdAt).toISOString(),
          "dateModified": new Date(blog.updatedAt || blog.createdAt).toISOString(),
          "author": [{
            "@type": "Person",
            "name": blog.author?.profile?.firstName ? `${blog.author.profile.firstName} ${blog.author.profile.lastName}` : "Prepster Team"
          }]
        }}
      />

      <Link to="/blogs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
      </Link>

      <header className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {blog.tags?.map(tag => (
            <span key={tag} className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {blog.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
              {blog.author?.profile?.avatar ? (
                <img src={blog.author.profile.avatar} alt="Author" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                  {blog.author?.profile?.firstName?.[0] || 'A'}
                </div>
              )}
            </div>
            <span className="font-medium text-foreground">
              {blog.author?.profile?.firstName} {blog.author?.profile?.lastName}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {blog.readTime || 5} min read</span>
        </div>
      </header>

      <div className="w-full aspect-[21/9] md:aspect-[2.5/1] bg-secondary rounded-3xl overflow-hidden shadow-lg border border-border">
        <img src={blog.coverImage || getDefaultImage(blog.slug)} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      <AdPlaceholder slot="6281633625" className="h-[90px] max-w-3xl mx-auto" />

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-8">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/50 px-4 py-2 rounded-full border border-border"
          >
            <Share2 className="w-4 h-4" /> Share Article
          </button>
        </div>

        <MarkdownRenderer content={blog.content} />

        <AdPlaceholder slot="7377719724" className="h-[90px] mt-12" />
      </div>
    </article>
  );
}
