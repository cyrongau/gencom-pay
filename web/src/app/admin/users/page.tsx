'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/AdminShell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user/admin/all');
      setUsers(res.data);
    } catch (err) {
      console.warn('Admin Users endpoint not found, using simulation.');
      setUsers([
        { id: '1', full_name: 'Suleiman Ali', email: 'suleiman@gencom.io', role: 'USER', status: 'VERIFIED', created_at: new Date() },
        { id: '2', full_name: 'Hodan Yusuf', email: 'hodan@gencom.io', role: 'USER', status: 'PENDING', created_at: new Date() },
        { id: '3', full_name: 'Nebula Cloud', email: 'biz@nebula.io', role: 'MERCHANT', status: 'VERIFIED', created_at: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">User Directory</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Manage Network Participants & Node Roles</p>
           </div>
           <div className="flex gap-4">
              <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                 <span className="material-icons-outlined text-sm">filter_alt</span> Filter Roles
              </button>
              <button className="btn-primary px-10 py-4 text-[10px]">Invite New Participant</button>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-x-auto">
           <table className="w-full text-left min-w-[900px]">
              <thead>
                 <tr className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] border-b border-white/5 pb-10">
                    <th className="pb-10 pl-6 italic">Participant Node</th>
                    <th className="pb-10 italic">Role</th>
                    <th className="pb-10 italic">Account Status</th>
                    <th className="pb-10 italic">Joined Network</th>
                    <th className="pb-10 text-right pr-6 italic">Actions</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 {users.map(user => (
                   <tr key={user.id} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                      <td className="py-8 pl-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-navy/60 rounded-xl border border-white/10 flex items-center justify-center font-black text-xs group-hover:bg-green/10 group-hover:text-green transition-all overflow-hidden">
                                {user.avatar_url ? (
                                   <img 
                                     src={user.avatar_url.startsWith('/') ? `${api.defaults.baseURL}${user.avatar_url}` : user.avatar_url} 
                                     className="w-full h-full object-cover"
                                   />
                                ) : (
                                   user.full_name ? user.full_name.charAt(0) : (user.email ? user.email.charAt(0) : '?').toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-black text-white italic">{user.full_name || 'Unnamed Participant'}</span>
                               <span className="text-[10px] text-soft-grey lowercase font-medium">{user.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="py-8">
                         <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-lg border ${
                            user.role === 'ADMIN' ? 'bg-blue/10 text-blue border-blue/20' : 
                            user.role === 'MERCHANT' ? 'bg-gold/10 text-gold border-gold/20' : 
                            'bg-white/5 text-soft-grey border-white/10'
                         }`}>
                            {user.role}
                         </span>
                      </td>
                      <td className="py-8">
                         <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'VERIFIED' ? 'bg-green animate-pulse' : 'bg-gold'}`}></span>
                            <span className={`text-[10px] font-black tracking-widest uppercase ${user.status === 'VERIFIED' ? 'text-green' : 'text-gold'}`}>
                               {user.status}
                            </span>
                         </div>
                      </td>
                      <td className="py-8 text-soft-grey font-medium text-xs">
                         {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-8 text-right pr-6">
                         <button className="text-soft-grey hover:text-white transition-colors">
                            <span className="material-icons-outlined">settings</span>
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </AdminShell>
  );
}
