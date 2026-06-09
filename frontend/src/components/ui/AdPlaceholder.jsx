import React, { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export function AdPlaceholder({ slot, className = '', format = 'auto', responsive = true }) {
  const { user } = useAuthStore();

  // If the user is a PRO subscriber, do not render the ad
  const isPro = user?.subscription?.plan === 'pro' && user?.subscription?.status === 'active';

  useEffect(() => {
    // Only push the ad request if the user is not PRO and the window object exists
    if (!isPro && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [isPro, slot]);

  if (isPro) return null;

  return (
    <div className={`w-full overflow-hidden flex items-center justify-center my-4 ${className}`}>
      <ins className="adsbygoogle"
           style={{ display: 'block', minWidth: '250px' }}
           data-ad-client="ca-pub-7927567287922311"
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive={responsive ? "true" : "false"}></ins>
    </div>
  );
}
