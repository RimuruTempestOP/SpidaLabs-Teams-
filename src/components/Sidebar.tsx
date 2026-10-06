import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Mic, 
  Video, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Sparkles, 
  Radio,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserProfile, NavTab } from '../types';

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSignOut: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, onTabChange, onSignOut, isCollapsed, onToggleCollapse }) => {
  const isSuperAdmin = currentUser.role === 'Super Admin';

  const navItems = [
    { id: 'global-chat' as NavTab, label: 'Global Chat', icon: MessageSquare, badge: 'Company' },
    { id: 'team-space' as NavTab, label: 'My Team Space', icon: Users, badge: currentUser.team === 'Super Admin' ? 'All' : 'Private' },
    { id: 'voice' as NavTab, label: 'Voice Rooms', icon: Mic, badge: 'Live' },
    { id: 'video' as NavTab, label: 'Video Meetings', icon: Video, badge: 'HD' },
    { id: 'members' as NavTab, label: 'Members Directory', icon: Radio, badge: isSuperAdmin ? 'All' : 'Team' },
    ...(isSuperAdmin ? [{ id: 'admin' as NavTab, label: 'Admin Controls', icon: ShieldCheck, badge: 'Super' }] : []),
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  if (isCollapsed) {
    return (
      <aside className="w-20 bg-slate-900 border-r border-slate-800/80 flex flex-col items-center justify-between py-5 shrink-0 select-none transition-all duration-300">
        <div className="flex flex-col items-center space-y-6">
          <div 
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 cursor-pointer hover:opacity-95 transition"
            title="Expand Sidebar"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={item.label}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleCollapse}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
            {getInitials(currentUser.name)}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none transition-all duration-300">
      {/* Top Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">SpidaLabs Teams</h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">SECURE ENTERPRISE</p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-slate-500 px-3 mb-2 tracking-wider">Communication Hub</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Team Security Status Banner */}
      <div className="px-4 py-3 mx-4 mb-4 bg-slate-950/60 border border-slate-800 rounded-xl">
        <div className="flex items-center space-x-2 text-[11px] text-blue-400 font-medium">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Team Isolation Active</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          Assigned: <span className="text-slate-200 font-medium">{currentUser.team}</span>
        </p>
      </div>

      {/* User Profile Footer with prominent Sign Out button */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
              {getInitials(currentUser.name)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.team}</div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full py-2 px-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 rounded-xl text-xs font-medium transition flex items-center justify-center space-x-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};
