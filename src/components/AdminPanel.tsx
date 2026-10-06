import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import { UserProfile, TeamName, UserRole } from '../types';
import { db, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from '../firebase';

interface AdminPanelProps {
  currentUser: UserProfile;
}

const ALL_TEAMS: TeamName[] = [
  'Super Admin',
  'Management Team',
  'Marketing Team',
  'Lead Generation Team',
  'Development Team',
  'Scouting / Creator Recruitment Team'
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTeam, setNewTeam] = useState<TeamName>('Marketing Team');
  const [newRole, setNewRole] = useState<UserRole>('Member');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserProfile);
      });
      setUsersList(list);
    }, (error) => {
      console.error('Error listening to admin users:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      const uid = `user_${Date.now()}`;
      const newUser: UserProfile = {
        uid,
        email: newEmail.trim(),
        name: newName.trim(),
        role: newRole,
        team: newTeam,
        avatar: '',
        status: 'offline',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), newUser);
      setNewName('');
      setNewEmail('');
      setSuccessMsg('User successfully created and assigned in Firestore.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleRemoveUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.error('Failed to remove user:', err);
    }
  };

  const handleTeamChange = async (uid: string, team: TeamName) => {
    try {
      await updateDoc(doc(db, 'users', uid), { team });
    } catch (err) {
      console.error('Failed to update user team:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Super Admin Controls</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Restricted</span>
            </h2>
            <p className="text-xs text-slate-400">Manage enterprise users, team assignments, roles, and security access policies.</p>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Provision New Enterprise User</span>
          </h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="email"
              placeholder="email@spidalabs.io"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value as TeamName)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {ALL_TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-lg shadow-blue-600/20"
            >
              Add User
            </button>
          </form>
        </div>

        {/* Users Management Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Registered Firestore Users & Team Assignments</h3>
          </div>
          <div className="overflow-x-auto">
            {usersList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No registered users in database.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Assigned Team</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {usersList.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
                          {getInitials(u.name)}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.team}
                          onChange={(e) => handleTeamChange(u.uid, e.target.value as TeamName)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                        >
                          {ALL_TEAMS.map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveUser(u.uid)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
