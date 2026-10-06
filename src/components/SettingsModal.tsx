import React from 'react';
import { Settings as SettingsIcon, User, Lock, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  currentUser: UserProfile;
  onSignOut: () => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentUser, onSignOut }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Workspace Settings</h2>
            <p className="text-xs text-slate-400">Manage your profile, security preferences, and team credentials.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>User Profile</span>
          </h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-mono font-bold text-blue-400">
              {getInitials(currentUser.name)}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-mono">{currentUser.team}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Isolation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Security & Row-Level Privacy</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account is bound to <span className="text-white font-semibold">{currentUser.team}</span>. All queries and private channel messages are secured by Firestore RLS rules preventing unauthorized access across team boundaries.
          </p>
        </div>

        {/* Sign Out Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Exit Workspace / Sign Out</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sign out of your current session to return to the team login portal or switch to another department.
          </p>
          <button
            onClick={onSignOut}
            className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-red-600/20 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
