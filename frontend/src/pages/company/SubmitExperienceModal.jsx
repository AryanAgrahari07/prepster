import { useState } from 'react';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Send, AlertCircle } from 'lucide-react';
import toast from '@/utils/toast';

export default function SubmitExperienceModal({ isOpen, onClose, slug, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    roleOffered: '',
    offerStatus: 'Pending',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      return toast.error('Please fill in all required fields');
    }

    try {
      setLoading(true);
      await api.post(`/companies/${slug}/experiences`, formData);
      toast.success('Experience submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-background border border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Share Interview Experience</h2>
            <p className="text-sm text-muted-foreground mt-1">Help juniors by sharing your interview journey.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Job Role <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. SDE-1, Ninja, Data Analyst"
                value={formData.roleOffered}
                onChange={e => setFormData({ ...formData, roleOffered: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Interview Title <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. TCS Ninja Interview Experience 2024"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Final Status</label>
              <select
                className="w-full bg-background border border-input rounded-md h-10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.offerStatus}
                onChange={e => setFormData({ ...formData, offerStatus: e.target.value })}
              >
                <option value="Pending">Waiting for Results</option>
                <option value="Offered">Selected / Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Detailed Experience <span className="text-destructive">*</span></label>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mb-2 flex gap-2 text-xs text-primary/80">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Include details about written test patterns, technical questions asked, HR round questions, and overall difficulty.</p>
              </div>
              <textarea
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[200px] resize-y"
                placeholder="Write your experience round by round..."
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-secondary/10 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="experience-form" isLoading={loading}>
            <Send className="w-4 h-4 mr-2" />
            Submit Experience
          </Button>
        </div>
      </div>
    </div>
  );
}
