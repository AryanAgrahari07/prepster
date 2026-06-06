import { useToastStore } from '@/utils/toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 w-80 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
            t.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
            t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
            'bg-background border-border text-foreground'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {t.type === 'default' && <Info className="w-5 h-5 shrink-0 text-muted-foreground" />}
          
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          
          <button 
            onClick={() => removeToast(t.id)}
            className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
