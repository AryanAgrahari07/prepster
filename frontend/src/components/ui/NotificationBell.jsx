import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell({ announcements, dismissAnnouncement, direction = 'down', align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasUnread = announcements.length > 0;

  // Determine positioning classes
  const isMobileHeader = align === 'mobile-header';
  
  const verticalClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';
  const horizontalClass = align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  
  const containerClasses = isMobileHeader 
    ? 'fixed top-[70px] left-4 right-4 w-auto z-50 overflow-hidden' 
    : `absolute ${verticalClass} ${horizontalClass} w-80 sm:w-96 z-50 overflow-hidden`;

  // For 'up' direction, we might want the animation to originate from the bottom
  const animationOrigin = direction === 'up' ? { originY: 1 } : { originY: 0 };
  const initialY = direction === 'up' ? 10 : -10;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={animationOrigin}
            initial={{ opacity: 0, y: initialY, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: initialY, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`${containerClasses} bg-card border border-border rounded-xl shadow-xl`}
          >
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {!hasUnread ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {announcements.map((a) => {
                    const styles = {
                      info:    { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Info },
                      warning: { bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: AlertTriangle },
                      success: { bg: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle2 },
                    };
                    const { bg, icon: Icon } = styles[a.type] || styles.info;
                    
                    return (
                      <div key={a._id} className={`p-4 hover:bg-secondary/20 transition-colors relative group`}>
                        <div className="flex gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{a.body}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissAnnouncement(a._id);
                          }} 
                          className="absolute top-4 right-4 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all rounded-md hover:bg-secondary"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
