import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';

export default function GoogleAd({ slot, style = { display: 'block' }, format = 'auto', responsive = 'true' }) {
  const { user } = useAuthStore();
  const adLoaded = useRef(false);

  // Pro users don't see ads
  if (user?.subscription?.plan === 'pro') {
    return null;
  }

  useEffect(() => {
    try {
      if (!adLoaded.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adLoaded.current = true;
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // In development, AdSense might not render, so we show a placeholder
  const isDev = import.meta.env.DEV;

  return (
    <div className="w-full overflow-hidden flex items-center justify-center min-h-[90px] my-4 rounded-lg bg-secondary/5 border border-border/30">
      {isDev ? (
        <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest p-4">
          Google Ad Placeholder (Slot: {slot})
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      )}
    </div>
  );
}
