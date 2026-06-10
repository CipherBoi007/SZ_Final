'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await adminAPI.getUsers();
        const payload = data.data;
        setUsers(payload?.users || (Array.isArray(payload) ? payload : []));
      } catch { 
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handlePromote = async (id: string) => {
    if (!confirm('Promote this user to admin?')) return;
    try {
      await adminAPI.promoteUser(id);
      setUsers(users.map((u) => u.id.toString() === id ? { ...u, role: 'admin' } : u));
      toast.success('User promoted to admin');
    } catch { toast.error('Failed to promote'); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await adminAPI.deactivateUser(id);
      setUsers(users.map((u) => u.id.toString() === id ? { ...u, isActive: false } : u));
      toast.success('User deactivated');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Customers</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Manage and view registered store customers</p>
        </div>
      </div>

      <div className="relative mb-8 group max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
        <input 
          value={search} 
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }} 
          placeholder="Search Members by Name or Email..."
          className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner" 
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div className="md:hidden space-y-3">
            {paginated.map((user) => (
              <div key={user.id} className="p-4 rounded-2xl glass-strong border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-black shrink-0 border border-accent/20">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{user.name}</p>
                    <p className="text-[9px] text-white/20 font-black uppercase mt-0.5 tracking-widest truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive !== false && <button onClick={() => handleDeactivate(user.id.toString())} className="p-3 rounded-xl glass border border-white/5 text-white/40"><UserX className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-[32px] glass-strong border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5">
                <th className="text-left p-8">Customer</th>
                <th className="text-left p-8">Email</th>
                <th className="text-left p-8">Role</th>
                <th className="text-left p-8">Joined</th>
                <th className="text-right p-8">Actions</th>
              </tr></thead>
              <tbody>
                {paginated.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-black border border-accent/20">{user.name?.charAt(0)?.toUpperCase() || '?'}</div>
                        <div>
                          <p className="text-white font-black uppercase tracking-tight">{user.name}</p>
                          {user.isActive === false && <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Suspended</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-white/40 font-mono text-[11px]">{user.email}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-white/20'}`}>{user.role}</span>
                    </td>
                    <td className="p-8 text-white/20 font-black uppercase tracking-widest text-[9px]">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        {user.role !== 'admin' && <button onClick={() => handlePromote(user.id.toString())} className="p-4 rounded-2xl glass border border-white/5 text-white/40 hover:text-accent transition-all"><Shield className="w-4 h-4" /></button>}
                        {user.isActive !== false && <button onClick={() => handleDeactivate(user.id.toString())} className="p-4 rounded-2xl glass border border-white/5 text-white/40 hover:text-red-400 transition-all"><UserX className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-white/20"><Users className="w-8 h-8 mx-auto mb-2" /><p>No customers found</p></div>}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between rounded-2xl glass-strong border border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
