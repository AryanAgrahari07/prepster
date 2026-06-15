import { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark } from '@/api/bookmarks';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Loader2, Trash2, ArrowRight, BookOpen, Briefcase, MessageSquare, BriefcaseBusiness, HelpCircle, Calculator, Building2 } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Saved' },
  { id: 'question', label: 'Questions', icon: BookOpen },
  { id: 'job', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'gd-topic', label: 'GD Topics', icon: MessageSquare },
  { id: 'case-study', label: 'Case Studies', icon: Briefcase },
  { id: 'pi-question', label: 'PI Questions', icon: HelpCircle },
  { id: 'guesstimate', label: 'Guesstimates', icon: Calculator },
  { id: 'company', label: 'Companies', icon: Building2 },
];

export default function SavedItems() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await getBookmarks();
      setBookmarks(res.data?.data?.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await removeBookmark(itemId);
      setBookmarks(prev => prev.filter(b => b.itemId !== itemId));
    } catch (error) {
      console.error('Failed to remove bookmark', error);
    }
  };

  const filteredBookmarks = activeTab === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.itemType === activeTab);

  // Get active tabs (tabs that have at least one bookmark, plus 'all')
  const availableTabs = TABS.filter(tab => 
    tab.id === 'all' || bookmarks.some(b => b.itemType === tab.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title="Saved Items | Prepster" description="View your saved questions, jobs, and study materials." />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-primary" /> Saved Items
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your bookmarked content from across the platform.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading saved items...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="app-card py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nothing saved yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            When you see a question, job, or topic you want to remember, click the bookmark icon to save it here.
          </p>
          <div className="flex gap-3">
            <Link to="/aptitude/practice" className="text-sm font-semibold text-primary hover:underline">Practice Questions</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/jobs" className="text-sm font-semibold text-primary hover:underline">Browse Jobs</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          {availableTabs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-background'
                    }`}>
                      {tab.id === 'all' 
                        ? bookmarks.length 
                        : bookmarks.filter(b => b.itemType === tab.id).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* List */}
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  layout
                  key={bookmark._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="app-card p-5 group flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {bookmark.itemType.replace('-', ' ')}
                      </span>
                      {bookmark.snapshot?.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {bookmark.snapshot.subtitle}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-base mb-1 line-clamp-2">
                      {bookmark.snapshot?.title || 'Untitled Item'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {bookmark.snapshot?.href && (
                      <Link 
                        to={bookmark.snapshot.href}
                        className="p-2 text-muted-foreground hover:text-primary bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                        title="View item"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleRemove(bookmark.itemId)}
                      className="p-2 text-muted-foreground hover:text-destructive bg-secondary/50 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredBookmarks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No items found in this category.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
