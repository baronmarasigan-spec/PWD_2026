import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar as CalendarIcon,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EventItem } from '../../types';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getDay = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.match(/\d+/)?.[0] || '0';
    return date.getDate().toString();
  } catch {
    return '0';
  }
};

export const AdminEvents: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

  // Form states
  const [eventForm, setEventForm] = useState({ title: '', date: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const eventFileRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateEvent(editingId, eventForm);
        showStatus("Event successfully updated!", 'success');
      } else {
        await addEvent(eventForm);
        showStatus("Event successfully added!", 'success');
      }
      setEventForm({ title: '', date: '' });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving event:", error);
      showStatus("Error saving event. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEvent(deleteConfirm.id);
      showStatus("Successfully deleted!", 'success');
    } catch (error) {
      console.error("Error deleting:", error);
      showStatus("Error deleting event.", 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEventForm({ title: item.title, date: item.date });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#1e419c]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 relative">
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              statusMessage.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
            }`}
          >
            <span className="font-bold text-sm">{statusMessage.text}</span>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-slate-500 mb-8">This action cannot be undone. Are you sure you want to delete this item?</p>
              <div className="flex gap-4">
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Events</h1>
        <p className="text-slate-500 font-medium text-lg">Update posters and announcement dates for citizens.</p>
      </header>

      <div className="max-w-4xl mx-auto">
        
        {/* Event Management (LGU Calendar) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <CalendarIcon className="text-[#1e419c]" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Announcement & Activity Dates</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-300 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="animate-spin mx-auto mb-4" size={40} />
              <p className="text-xs font-medium uppercase tracking-widest">Loading events...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleEventSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Title</label>
                    <input 
                      type="text" 
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Accessibility Awareness Seminar"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-[#1e419c] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                    {editingId ? 'Update Event' : 'Add Event'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setEventForm({ title: '', date: '' }); }}
                      className="px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                {events.length === 0 && (
                  <div className="p-12 text-center text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-medium uppercase tracking-widest">No events found.</p>
                  </div>
                )}
                <AnimatePresence>
                  {events.map((event) => (
                    <motion.div 
                      key={event.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e419c] font-bold">
                          {getDay(event.date)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{event.title}</h3>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{formatDate(event.date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
};

