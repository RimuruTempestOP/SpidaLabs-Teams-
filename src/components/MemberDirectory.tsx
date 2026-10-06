import React, { useState, useEffect } from 'react';
import { Users, Search, Radio } from 'lucide-react';
import { UserProfile } from '../types';
import { db, collection, onSnapshot } from '../firebase';

interface MemberDirectoryProps {
  currentUser: UserProfile;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({ currentUser }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const isSuperAdmin = currentUser.role === 'Super Admin';

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserProfile);
      });
      setMembers(list);
    }, (error) => {
      console.error('Error listening to users:', error);
    });

    return () => unsubscribe();
  }, []);

  const visibleMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = filterTeam === 'all' || m.team === filterTeam;
    const hasPermission = isSuperAdmin || m.team === currentUser.team || m.role === 'Super Admin';
    return matchesSearch && matchesTeam && hasPermission;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Members Directory</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {isSuperAdmin ? 'Full Directory' : 'Team Directory'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">View active SpidaLabs team members and availability status.</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </header>

      {/* Members Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {visibleMembers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-sm">No registered members found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMembers.map((m) => (
              <div key={m.uid || m.email} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-start space-x-4 shadow-xl">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-mono font-bold text-blue-400">
                    {getInitials(m.name)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-slate-900 rounded-full ${
                    m.status === 'online' ? 'bg-emerald-500' : m.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white truncate">{m.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{m.role}</span>
                  </div>
                  <div className="text-[11px] text-blue-400 font-medium truncate">{m.team}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
