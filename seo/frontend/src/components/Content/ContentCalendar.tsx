import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Plus, X, Download,
    Trash2, Edit2, Send, ExternalLink, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface ContentItem {
    id: number;
    date: string;
    platform: string;
    type: string;
    topic: string;
    caption: string;
    driveUrl: string;
    status: 'Draft' | 'Scheduled' | 'Posted' | 'Live';
    datePosted?: string;
    responsibleName: string;
    responsiblePhoto?: string;
}

const ContentCalendar: React.FC = () => {
    const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';
    const API_URL = `${API_BASE}/api`;

    // State
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Form State
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        platform: 'Twitter',
        type: 'Static',
        topic: '',
        caption: '',
        driveUrl: '',
        status: 'Draft' as const,
        responsibleName: 'Admin'
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Items
    const fetchItems = async () => {
        setLoading(true);
        try {
            if (!user?.id) return;
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE}/content?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            } else {
                throw new Error('Failed to fetch content');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Handle Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete fit content item?')) return;

        try {
            if (!user?.id) return;
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE}/content/${id}?userId=${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setItems(items.filter(item => item.id !== id));
            } else {
                alert('Failed to delete item');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting item');
        }
    };

    // Handle Export
    const handleExport = async () => {
        try {
            if (!user?.id) return;
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE}/content/export?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `content_calendar_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Failed to export content');
            }
        } catch (err) {
            console.error(err);
            alert('Error exporting content');
        }
    };

    // Handle Status Change (Inline)
    const handleStatusChange = async (item: ContentItem, newStatus: string) => {
        const updateData: any = { status: newStatus };
        if (newStatus === 'Posted' || newStatus === 'Live') {
            updateData.datePosted = new Date().toISOString();
        }

        try {
            if (!user?.id) return;
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE}/content/${item.id}?userId=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...updateData, userId: user.id })
            });

            if (res.ok) {
                const updatedItem = await res.json();
                setItems(items.map(i => i.id === item.id ? updatedItem : i));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    // Helper for Form Submission
    const handleSubmit = async () => {
        if (!formData.topic || !formData.date) {
            alert('Please fill in required fields (Topic, Date)');
            return;
        }

        const payload: any = { ...formData };
        if (payload.status === 'Posted' || payload.status === 'Live') {
            if (!editingItem?.datePosted) {
                payload.datePosted = new Date().toISOString();
            }
        }

        try {
            if (!user?.id) return;
            const token = localStorage.getItem('auth_token');
            const url = editingItem
                ? `${API_BASE}/content/${editingItem.id}?userId=${user.id}`
                : `${API_BASE}/content`;

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...payload, userId: user.id })
            });

            if (res.ok) {
                const savedItem = await res.json();
                if (method === 'POST') {
                    setItems([savedItem, ...items]);
                } else {
                    setItems(items.map(i => i.id === savedItem.id ? savedItem : i));
                }
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData(initialFormState);
            } else {
                alert('Failed to save content');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving content');
        }
    };

    const openEditModal = (item: ContentItem) => {
        setEditingItem(item);
        setFormData({
            date: item.date,
            platform: item.platform,
            type: item.type,
            topic: item.topic,
            caption: item.caption || '',
            driveUrl: item.driveUrl || '',
            status: item.status as any,
            responsibleName: item.responsibleName
        });
        setIsModalOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Live':
            case 'Posted': return 'bg-green-100 text-green-700 border-green-200';
            case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[800px]">
            {/* Header / Toolbar */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                        <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Posting Schedule</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Excel Interactive Grid</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData(initialFormState);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5" /> Add Content
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm"
                        title="Export to Excel"
                    >
                        <Download className="w-5 h-5" /> Export
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-auto p-4 lg:p-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-900 dark:hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="min-w-[1200px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Platform</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 min-w-[200px]">Topic</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Drive URL</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-40">Date Posted</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-40">Responsible</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-x border-gray-200 dark:border-gray-700 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {items.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300 border-x border-gray-200 dark:border-gray-700">
                                            {entry.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-x border-gray-200 dark:border-gray-700">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-black text-gray-600 dark:text-gray-400 uppercase">
                                                {entry.platform}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-x border-gray-200 dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{entry.type}</span>
                                        </td>
                                        <td className="px-6 py-4 border-x border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2" title={entry.topic}>{entry.topic}</p>
                                            {entry.caption && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic" title={entry.caption}>{entry.caption}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 border-x border-gray-200 dark:border-gray-700 text-center">
                                            {entry.driveUrl ? (
                                                <a href={entry.driveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                    <ExternalLink className="w-5 h-5 mx-auto" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-x border-gray-200 dark:border-gray-700">
                                            <select
                                                value={entry.status}
                                                onChange={(e) => handleStatusChange(entry, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border outline-none cursor-pointer ${getStatusStyle(entry.status)}`}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="Posted">Posted</option>
                                                <option value="Live">Live</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-x border-gray-200 dark:border-gray-700">
                                            {entry.datePosted ? new Date(entry.datePosted).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-x border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[10px] font-bold text-purple-600 capitalize">
                                                    {entry.responsibleName.charAt(0)}
                                                </div>
                                                {entry.responsibleName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center border-x border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(entry)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Empty Rows for Excel Look */}
                                {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                                    <tr key={`empty-${i}`} className="h-16">
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                        <td className="border-x border-gray-200 dark:border-gray-700"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Entry Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {editingItem ? 'Edit Content' : 'Plan New Content'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Publish Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Posted">Posted</option>
                                            <option value="Live">Live</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Platform</label>
                                        <select
                                            value={formData.platform}
                                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                                        >
                                            <option>Twitter</option>
                                            <option>LinkedIn</option>
                                            <option>Instagram</option>
                                            <option>Facebook</option>
                                            <option>YouTube</option>
                                            <option>Blog</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Content Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                                        >
                                            <option>Static Post</option>
                                            <option>Carousel</option>
                                            <option>Video / Reel</option>
                                            <option>Story</option>
                                            <option>Article</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Topic / Headline</label>
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="e.g. 5 SEO Trends for 2026"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Caption / Notes</label>
                                    <textarea
                                        value={formData.caption}
                                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none text-gray-900 dark:text-white transition-all min-h-[100px]"
                                        placeholder="Write your caption here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Google Drive / Assets URL</label>
                                    <input
                                        type="text"
                                        value={formData.driveUrl}
                                        onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Responsible Person</label>
                                    <input
                                        type="text"
                                        value={formData.responsibleName}
                                        onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-4 bg-purple-600 text-white rounded-[2rem] font-black text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 dark:shadow-none flex items-center justify-center gap-3"
                                    >
                                        <Send className="w-5 h-5" /> {editingItem ? 'Update Content' : 'Save to Calendar'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContentCalendar;
