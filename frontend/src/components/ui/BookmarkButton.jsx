import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { addBookmark, removeBookmark, checkBookmark } from '@/api/bookmarks';
import useAuthStore from '@/store/authStore';

export default function BookmarkButton({ itemType, itemId, snapshot, className = '' }) {
  const { user } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !itemId) return;
    
    let isMounted = true;
    checkBookmark(itemId)
      .then(res => {
        if (isMounted && res.data?.data?.isBookmarked) {
          setIsBookmarked(true);
        }
      })
      .catch(() => {});
      
    return () => { isMounted = false; };
  }, [user, itemId]);

  const toggleBookmark = async (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();
    
    if (!user) {
      // Could show a toast telling them to login
      return;
    }
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(itemId);
        setIsBookmarked(false);
      } else {
        await addBookmark({ itemType, itemId, snapshot });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Bookmark toggle failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Don't show for guests

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center
        ${isBookmarked ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:bg-secondary/80'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
      aria-label={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}
