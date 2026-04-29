'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function MerchantTeamManagement() {
  const { showNotification } = useNotification();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/merchant/team');
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch team', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/merchant/team/invite', { email: inviteEmail, role: inviteRole });
      showNotification('Invitation protocol dispatched', 'success');
      setInviteEmail('');
      fetchTeam();
    } catch (err) {
      showNotification('Failed to invite member. Ensure the user exists.', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/merchant/team/${id}`);
      showNotification('Member/Invitation purged', 'success');
      fetchTeam();
    } catch (err) {
      showNotification('Purge failed', 'error');
    }
  };

  const handleResend = async (id: string) => {
    try {
      await api.post(`/merchant/team/resend/${id}`);
      showNotification('Invitation re-dispatched', 'success');
    } catch (err) {
      showNotification('Resend failed', 'error');
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Team Management</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Roles, Permissions & Staff Access</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mx-4">
           
           {/* Team Roster */}
           <div className="lg:col-span-8 space-y-8">
              <h3 className="text-2xl font-black italic tracking-tight">Active Roster</h3>
              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                       <tr className="text-[10px] font-black text-soft-grey uppercase tracking-widest">
                          <th className="p-8">Member Name</th>
                          <th className="p-8">Role Protocol</th>
                          <th className="p-8">Status</th>
                          <th className="p-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {members.map((member) => (
                          <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                             <td className="p-8 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-green font-black">
                                   {member.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-black text-white italic">{member.user?.name}</p>
                                   <p className="text-[10px] text-soft-grey font-mono">{member.user?.email}</p>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                                   member.role === 'OWNER' ? 'bg-gold/10 text-gold border-gold/20' : 
                                   member.role === 'ADMIN' ? 'bg-blue/10 text-blue border-blue/20' :
                                   'bg-white/5 text-soft-grey border-white/10'
                                }`}>
                                   {member.role}
                                </span>
                             </td>
                             <td className="p-8">
                                <span className={`text-[9px] font-black ${member.status === 'ACTIVE' ? 'text-green' : 'text-gold'}`}>
                                   {member.status}
                                </span>
                             </td>
                             <td className="p-8 text-right flex justify-end gap-4">
                                {member.status === 'INVITED' && (
                                  <button 
                                    onClick={() => handleResend(member.id)}
                                    className="text-green text-[10px] font-black uppercase tracking-widest hover:underline"
                                  >
                                    Resend
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleRemove(member.id)}
                                  className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline"
                                >
                                  Remove
                                </button>
                             </td>
                          </tr>
                       ))}
                       {members.length === 0 && (
                          <tr>
                             <td colSpan={4} className="p-20 text-center text-soft-grey italic text-xs uppercase tracking-widest opacity-30">No team members registered</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Invite Form */}
           <div className="lg:col-span-4 space-y-8">
              <h3 className="text-2xl font-black italic tracking-tight">Expand Team</h3>
              <form onSubmit={handleInvite} className="bg-[#0F3D3A]/20 border border-green/20 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Collaborator Email</label>
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="staff@business.com"
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-mono text-xs"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Authorization Level</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black text-[10px] uppercase tracking-widest outline-none"
                    >
                       <option value="ADMIN">ADMIN (Full Access)</option>
                        <option value="MANAGER">MANAGER (Branch Access)</option>
                       <option value="DEVELOPER">DEVELOPER (API Access)</option>
                       <option value="VIEWER">VIEWER (Read Only)</option>
                    </select>
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-green text-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-green/20 hover:scale-[1.02] transition-all"
                 >
                    DISPATCH INVITATION
                 </button>
                 
                 <p className="text-[10px] text-soft-grey text-center leading-relaxed">Invited users must have an existing Gencom Pay account to accept the protocol.</p>
              </form>
           </div>

        </div>
      </div>
    </Shell>
  );
}
