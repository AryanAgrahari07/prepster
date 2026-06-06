import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminBlogs, deleteBlog, updateBlog } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Edit, Trash2, Globe, Lock } from 'lucide-react';
import toast from '@/utils/toast';

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (q = '') => {
    setLoading(true);
    try {
      const res = await getAdminBlogs({ q });
      setBlogs(res.data.blogs);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteBlog(id);
      toast.success('Blog deleted');
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await updateBlog(id, { isPublished: !currentStatus });
      toast.success(`Blog ${!currentStatus ? 'published' : 'unpublished'}`);
      setBlogs(blogs.map(b => b._id === id ? res.data.blog : b));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">Create and manage content for the Prepster Blog.</p>
        </div>
        <Link to="/admin/blogs/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Blog Post
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or slug..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBlogs(search)}
            />
          </div>
          <Button variant="outline" onClick={() => fetchBlogs(search)}>Search</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading blogs...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No blogs found.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground line-clamp-1">{blog.title}</div>
                      <div className="text-xs text-muted-foreground">/{blog.slug}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{blog.author?.profile?.firstName || 'Admin'}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePublish(blog._id, blog.isPublished)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          blog.isPublished 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        {blog.isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/blogs/${blog._id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleDelete(blog._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
