import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getAdminBlogById, createBlog, updateBlog } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, FileText, Image as ImageIcon } from 'lucide-react';
import toast from '@/utils/toast';

export default function BlogEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      coverImage: '',
      tags: '',
      readTime: 5,
      isPublished: false,
      content: ''
    }
  });

  const contentValue = watch('content');

  useEffect(() => {
    if (isEdit) {
      getAdminBlogById(id)
        .then(res => {
          const blog = res.data.blog;
          reset({
            title: blog.title,
            slug: blog.slug,
            coverImage: blog.coverImage || '',
            tags: blog.tags?.join(', ') || '',
            readTime: blog.readTime || 5,
            isPublished: blog.isPublished,
            content: blog.content
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load blog');
          navigate('/admin/blogs');
        });
    }
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: Number(data.readTime)
      };

      if (isEdit) {
        await updateBlog(id, payload);
        toast.success('Blog updated successfully');
      } else {
        await createBlog(payload);
        toast.success('Blog created successfully');
      }
      navigate('/admin/blogs');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save blog');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading editor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/blogs">
          <Button variant="outline" size="sm" className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Basic Info</h3>
            <Input 
              label="Blog Title" 
              placeholder="e.g. How to Crack TCS Ninja"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />
            
            <Input 
              label="URL Slug" 
              placeholder="e.g. how-to-crack-tcs-ninja"
              {...register('slug', { required: 'Slug is required' })}
              error={errors.slug?.message}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Content (Markdown)</label>
              <div className="border border-input rounded-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                <textarea 
                  className="w-full min-h-[400px] p-4 bg-background text-sm outline-none resize-y"
                  placeholder="Write your blog post in Markdown..."
                  {...register('content', { required: 'Content is required' })}
                ></textarea>
              </div>
              {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
              <h3 className="text-lg font-semibold border-b border-border pb-2">Meta & Publish</h3>
              
              <Input 
                label="Cover Image URL" 
                placeholder="https://res.cloudinary.com/..."
                {...register('coverImage')}
              />
              
              <Input 
                label="Tags (comma separated)" 
                placeholder="e.g. interview, tips, tcs"
                {...register('tags')}
              />
              
              <Input 
                label="Read Time (minutes)" 
                type="number"
                {...register('readTime')}
              />

              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-secondary/30">
                <input 
                  type="checkbox" 
                  id="isPublished" 
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  {...register('isPublished')}
                />
                <label htmlFor="isPublished" className="text-sm font-medium leading-none cursor-pointer">
                  Publish immediately
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center gap-2 h-12 text-md" isLoading={isSubmitting}>
              <Save className="w-4 h-4" /> {isEdit ? 'Update Blog Post' : 'Save Blog Post'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
