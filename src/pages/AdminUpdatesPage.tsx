import React, { useEffect, useState } from 'react';
import { updateService } from '../services/update-service';
import type { UpdateEntry } from '../services/update-service';
import { Card, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Plus, Edit2, Trash2, Shield, AlertCircle, Megaphone, BookOpen, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_OPTIONS = [
  { value: 'Curriculum Update', label: 'Curriculum Update', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { value: 'New Feature', label: 'New Feature', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { value: 'Notice', label: 'General Notice', icon: <Info className="h-3.5 w-3.5" /> },
];

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Curriculum Update': return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    case 'New Feature': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25';
    case 'Notice': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/25';
    default: return 'text-muted-foreground bg-muted border-border';
  }
};

export const AdminUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Notice');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await updateService.getUpdates();
      setUpdates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch updates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Notice');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (update: UpdateEntry) => {
    setEditingId(update.id);
    setTitle(update.title);
    setCategory(update.category);
    setDescription(update.description);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    try {
      await updateService.deleteUpdate(id);
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete update.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await updateService.updateUpdate(editingId, { title, category, description });
        setUpdates((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      } else {
        const created = await updateService.createUpdate({ title, category, description });
        setUpdates((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save update.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">

      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-rose-500" />
            Admin Panel — Manage Updates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and delete announcements that appear on every student's dashboard.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-lg shadow-indigo-500/15"
        >
          New Update
        </Button>
      </section>

      {/* Updates List */}
      <section className="space-y-4 relative min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/25">
            <Megaphone className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h4 className="text-lg font-bold">No updates published</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Click "New Update" to publish your first announcement. Students will see it on their dashboard instantly.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card className="hover:shadow-md hover:border-primary/20 transition-all overflow-hidden relative group">
                  {/* Left color tag */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    update.category === 'Curriculum Update' ? 'bg-amber-500' :
                    update.category === 'New Feature' ? 'bg-indigo-500' :
                    'bg-cyan-500'
                  }`} />

                  <CardContent className="p-5 pl-7 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyle(update.category)}`}>
                          {update.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-foreground">{update.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{update.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(update)}
                        className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                        title="Edit Update"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                        title="Delete Update"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </section>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Update' : 'Publish New Update'}
        description="This announcement will appear on every student's dashboard."
        footer={
          <div className="flex space-x-2 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-1/2">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} isLoading={isSaving} className="w-1/2">
              {editingId ? 'Save Changes' : 'Publish Update'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New exam schedule released"
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    category === opt.value
                      ? `${getCategoryStyle(opt.value)} border-current scale-[1.02] shadow-sm`
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the update details here..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
