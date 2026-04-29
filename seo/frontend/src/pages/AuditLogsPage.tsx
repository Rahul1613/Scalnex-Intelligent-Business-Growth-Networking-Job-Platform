import React, { useState, useEffect } from 'react';
import { Shield, Clock, Globe } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface AuditLog {
    id: number;
    action: string;
    details: string;
    timestamp: string;
    ip: string;
}

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';

    useEffect(() => {
        fetch(`${API_BASE}/api/security/audit-logs`)
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-zinc-950 min-h-screen text-white">
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Security Audit Logs</h1>
                        <p className="text-gray-400 mt-1">Real-time monitoring of system activities and security events.</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-8 py-4">Event</th>
                                <th className="px-8 py-4">Details</th>
                                <th className="px-8 py-4">Source</th>
                                <th className="px-8 py-4 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500 italic">
                                        Loading security logs...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                            <span className="font-bold text-gray-200">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-gray-400 text-sm max-w-md truncate italic">
                                        {log.details}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-gray-500 bg-white/5 px-3 py-1 rounded-full w-fit">
                                            <Globe size={12} />
                                            <span className="text-[10px] font-mono">{log.ip || '127.0.0.1'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-gray-500 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                        No security events recorded in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditLogsPage;
